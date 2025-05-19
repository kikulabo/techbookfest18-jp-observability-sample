require('dotenv').config();
const { resourceFromAttributes, processDetector, hostDetector } = require('@opentelemetry/resources');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const exporter = new OTLPTraceExporter({
  maxQueueSize: 1000,
  url: "https://otlp-vaxila.mackerelio.com/v1/traces",
  headers: {
    "Accept": "*/*",
    "Mackerel-Api-Key": process.env.MACKEREL_API_KEY,
  }
})

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [    
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
  resource: resourceFromAttributes({
    "service.name": "dev",
    "service.version": "v1.0.0",
    "deployment.environment.name": "web"
  }),
  resourceDetectors: [processDetector, hostDetector]
});

sdk.start()
