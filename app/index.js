require('./tracer');

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
    console.error(`Error on /testerror path: ${error.message}`);
    res.status(500).send('An intentional error occurred on the server.');
  }
});

// 重い処理をシミュレートするパス
app.get('/heavy-request', async (_req, res) => {
  console.log('Request to /heavy-request');
  const delaySeconds = 3;
  await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
  res.send(`Heavy request processed after ${delaySeconds} seconds.\n`);
});

app.listen(port, hostname, () => {
  console.log(`Server running with Express at http://${hostname}:${port}/`);
});
