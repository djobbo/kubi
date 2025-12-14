# dair.gg

## Instrumentation

The project uses a Grafana-based observability stack for monitoring, logging, and tracing.

### Stack Components

| Service | Port | Description |
|---------|------|-------------|
| **Grafana** | 3002 | Visualization and dashboards |
| **Grafana Alloy** | 12345 (UI), 4317 (gRPC), 4318 (HTTP) | OpenTelemetry collector |
| **Grafana Loki** | 3100 | Log aggregation |
| **Grafana Tempo** | 3200 | Distributed tracing |

### Architecture

```
┌─────────────┐     OTLP/HTTP      ┌─────────────┐
│   API       │ ─────────────────► │   Alloy     │
│  (traces)   │    :4318           │  (collector)│
└─────────────┘                    └──────┬──────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                          ▼               ▼               ▼
                    ┌─────────┐     ┌─────────┐     ┌─────────┐
                    │  Loki   │     │  Tempo  │     │ Grafana │
                    │ (logs)  │     │(traces) │     │  (UI)   │
                    └─────────┘     └─────────┘     └─────────┘
```

### Starting the Stack

```bash
bun compose up
```

### Access

- **Grafana**: http://localhost:3002
  - Username: `admin`
  - Password: `correcthorsebatterystaple`
- **Alloy UI**: http://localhost:12345
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200

### Configuration Files

- `apps/monitoring/alloy/config.alloy` - Alloy OTEL receiver configuration
- `apps/monitoring/loki/loki-config.yaml` - Loki storage configuration
- `apps/monitoring/tempo/tempo-config.yaml` - Tempo storage configuration
- `apps/monitoring/grafana/provisioning/` - Grafana datasource provisioning

### API Integration

The API automatically sends telemetry to Alloy via OpenTelemetry. Configure via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `OTLP_ENDPOINT` | `http://alloy:4318` | OTLP HTTP endpoint |
| `SERVICE_NAME` | `api` | Service name in traces |
| `SERVICE_VERSION` | `0.0.0` | Service version in traces |
