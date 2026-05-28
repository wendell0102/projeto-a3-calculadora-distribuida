const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

const SERVICES = {
  add:      process.env.ADD_SERVICE_URL      || 'http://localhost:3001',
  subtract: process.env.SUBTRACT_SERVICE_URL || 'http://localhost:3002',
  multiply: process.env.MULTIPLY_SERVICE_URL || 'http://localhost:3003',
  divide:   process.env.DIVIDE_SERVICE_URL   || 'http://localhost:3004'
};

const lastCache = {};

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/calculate', async (req, res) => {
  const { operation, a, b } = req.body;
  if (!operation || a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Parametros invalidos: operation, a e b sao obrigatorios' });
  }
  const serviceUrl = SERVICES[operation];
  if (!serviceUrl) {
    return res.status(400).json({ error: `Operacao desconhecida: ${operation}` });
  }
  try {
    const response = await axios.post(serviceUrl + '/', { a, b }, { timeout: 5000 });
    const result = response.data.result;
    lastCache[operation] = result;
    res.json({ result, service: operation, status: 'ok' });
  } catch (err) {
    console.error(`[GATEWAY] Servico ${operation} indisponivel:`, err.message);
    if (lastCache[operation] !== undefined) {
      return res.status(200).json({
        result: lastCache[operation],
        service: operation,
        status: 'fallback',
        warning: `Servico ${operation} indisponivel. Retornando ultimo resultado em cache.`
      });
    }
    res.status(503).json({
      error: `Servico ${operation} esta indisponivel. Os demais servicos continuam funcionando.`,
      service: operation
    });
  }
});

app.get('/health', async (req, res) => {
  const statuses = {};
  await Promise.all(
    Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        await axios.get(url + '/health', { timeout: 2000 });
        statuses[name] = 'online';
      } catch {
        statuses[name] = 'offline';
      }
    })
  );
  res.json({ status: 'ok', gateway: 'online', services: statuses });
});

app.listen(PORT, () => {
  console.log(`[GATEWAY] Servidor central rodando na porta ${PORT}`);
  console.log('[GATEWAY] Servicos configurados:', SERVICES);
});
