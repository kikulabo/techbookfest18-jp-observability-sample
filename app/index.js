require('./tracer');

const opentelemetry = require('@opentelemetry/api');
const express = require('express');
const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// 通常のレスポンスを返すパス
app.get('/', (_req, res) => {
  res.send('Hello from Node.js with Express on Sakura Cloud!\n');
});

// 意図的にエラーを発生させるパス
app.get('/testerror', (_req, res) => {
  try {
    throw new Error('This is a test error for Mackerel log monitoring!');
  } catch (error) {
    const span = opentelemetry.trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: error.message });
    }
    console.error(`Error on /testerror path: ${error.message}`);
    res.status(500).send('An intentional error occurred on the server.');
  }
});

// 重い処理をシミュレートするパス
app.get('/heavy-request', async (_req, res) => {
  const tracer = opentelemetry.trace.getTracer('heavy-request-tracer');
  const parentSpan = opentelemetry.trace.getActiveSpan();

  try {
    // heavy-processingスパン（5秒）
    await new Promise(resolve => {
      tracer.startActiveSpan('heavy-processing', { parent: parentSpan }, (heavySpan) => {
        setTimeout(() => {
          heavySpan.end();
          resolve();
        }, 5000);
      });
    });

    // light-processingスパン（1秒）
    await new Promise(resolve => {
      tracer.startActiveSpan('light-processing', { parent: parentSpan }, (lightSpan) => {
        setTimeout(() => {
          lightSpan.end();
          resolve();
        }, 1000);
      });
    });

    res.send('Heavy request processed. Check the trace to see the bottleneck!\n');
  } catch (error) {
    const span = opentelemetry.trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: error.message });
    }
    res.status(500).send('An error occurred during processing.');
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running with Express at http://${hostname}:${port}/`);
});
