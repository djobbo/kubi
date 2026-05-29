import * as NodeSdk from "@effect/opentelemetry/NodeSdk"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { Config, Duration, Effect, Layer, Option } from "effect"
import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware"

export { httpServerSpanName } from "./span-name.ts"
export { httpServerTracer } from "./http-server-tracer.ts"

/** Disable Effect's deferred HTTP tracer; use {@link httpServerTracer} in middleware instead. */
export const disableBuiltInHttpTracer = Layer.succeed(
  HttpMiddleware.TracerDisabledWhen,
  () => true,
)

const normalizeOtlpBaseUrl = (endpoint: string) => endpoint.replace(/\/$/, "")

const resolveOtlpEndpoint = Effect.gen(function* () {
  const fromEnv = yield* Config.option(
    Config.string("OTEL_EXPORTER_OTLP_ENDPOINT"),
  )
  if (Option.isSome(fromEnv)) {
    return normalizeOtlpBaseUrl(fromEnv.value)
  }

  const legacy = yield* Config.string("OTLP_ENDPOINT").pipe(
    Config.withDefault("http://localhost:4318"),
  )
  return normalizeOtlpBaseUrl(legacy)
})

const resolveServiceName = (defaultServiceName: string) =>
  Effect.gen(function* () {
    const otelName = yield* Config.option(Config.string("OTEL_SERVICE_NAME"))
    if (Option.isSome(otelName)) return otelName.value

    const serviceName = yield* Config.option(Config.string("SERVICE_NAME"))
    if (Option.isSome(serviceName)) return serviceName.value

    return defaultServiceName
  })

/**
 * Scoped OpenTelemetry layer for Node Effect apps (traces + metrics via OTLP HTTP).
 *
 * Disabled when `OTEL_SDK_DISABLED=true`. Service name defaults to `defaultServiceName`
 * unless `OTEL_SERVICE_NAME` or `SERVICE_NAME` is set.
 *
 * Traces use `SimpleSpanProcessor` when `NODE_ENV` is not `production` (immediate export),
 * and `BatchSpanProcessor` in production.
 */
export const observabilityLayer = (defaultServiceName: string) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const disabled = yield* Config.boolean("OTEL_SDK_DISABLED").pipe(
        Config.withDefault(false),
      )
      if (disabled) {
        return Layer.empty
      }

      return NodeSdk.layer(
        Effect.gen(function* () {
          const otlpEndpoint = yield* resolveOtlpEndpoint
          const serviceName = yield* resolveServiceName(defaultServiceName)
          const serviceVersion = yield* Config.string(
            "OTEL_SERVICE_VERSION",
          ).pipe(
            Config.orElse(() => Config.string("SERVICE_VERSION")),
            Config.withDefault("0.0.0"),
          )

          const traceExporter = new OTLPTraceExporter({
            url: `${otlpEndpoint}/v1/traces`,
          })

          const metricExporter = new OTLPMetricExporter({
            url: `${otlpEndpoint}/v1/metrics`,
          })

          const isProduction = yield* Config.string("NODE_ENV").pipe(
            Config.withDefault("development"),
            Config.map((env) => env === "production"),
          )

          const spanProcessor = isProduction
            ? new BatchSpanProcessor(traceExporter, {
                scheduledDelayMillis: Duration.toMillis("1 seconds"),
              })
            : new SimpleSpanProcessor(traceExporter)

          return {
            resource: {
              serviceName,
              serviceVersion,
            },
            spanProcessor,
            metricReader: new PeriodicExportingMetricReader({
              exporter: metricExporter,
              exportIntervalMillis: Duration.toMillis("10 seconds"),
            }),
          } satisfies NodeSdk.Configuration
        }),
      )
    }),
  )
