const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/', (req, res) => {
  const { a, b } = req.body;
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Parametros a e b sao obrigatorios' });
  }
  const result = Number(a) * Number(b);
  console.log(`[MULTIPLICACAO] ${a} x ${b} = ${result}`);
  res.json({ result, operation: 'multiply', a: Number(a), b: Number(b) });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'multiply', port: PORT });
});

app.listen(PORT, () => {
  console.log(`[MULTIPLICACAO] Servico de multiplicacao rodando na porta ${PORT}`);
});
