const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

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
  if (Number(b) === 0) {
    return res.status(400).json({ error: 'Divisao por zero nao e permitida' });
  }
  const result = Number(a) / Number(b);
  console.log(`[DIVISAO] ${a} / ${b} = ${result}`);
  res.json({ result, operation: 'divide', a: Number(a), b: Number(b) });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'divide', port: PORT });
});

app.listen(PORT, () => {
  console.log(`[DIVISAO] Servico de divisao rodando na porta ${PORT}`);
});
