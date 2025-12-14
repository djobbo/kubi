import { Effect, Config, Duration } from "effect"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"

export const ObservabilityLive = NodeSdk.layer(
  Effect.gen(function* () {
    const otlpEndpoint = yield* Config.string("OTLP_ENDPOINT").pipe(
      Config.withDefault("http://localhost:4318"),
    )

    const serviceName = yield* Config.string("SERVICE_NAME").pipe(
      Config.withDefault("api"),
    )

    const serviceVersion = yield* Config.string("SERVICE_VERSION").pipe(
      Config.withDefault("0.0.0"),
    )

    const traceExporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
    })

    const metricExporter = new OTLPMetricExporter({
      url: `${otlpEndpoint}/v1/metrics`,
    })

    return {
      resource: {
        serviceName,
        serviceVersion,
      },
      spanProcessor: new BatchSpanProcessor(traceExporter, {
        scheduledDelayMillis: Duration.toMillis("1 seconds"),
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: Duration.toMillis("50 millis"),
      }),
    } satisfies NodeSdk.Configuration
  }),
)
