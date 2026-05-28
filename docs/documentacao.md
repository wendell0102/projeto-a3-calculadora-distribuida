# Documentacao Tecnica — Calculadora Distribuida com Microservicos

**Disciplina:** Sistemas Distribuidos 
**Projeto:** A3 
**Tecnologias:** Node.js, Express, Docker, Docker Compose

---

## 1. Visao Geral do Sistema

O sistema implementa uma calculadora distribuida onde cada operacao matematica (soma, subtracao, multiplicacao e divisao) e executada por um microservico independente rodando em seu proprio container Docker.

A comunicacao entre os componentes e feita exclusivamente via HTTP REST, garantindo o desacoplamento total entre os servicos.

## 2. Componentes da Arquitetura

### 2.1 Frontend (porta 3000)

Interface web desenvolvida com HTML, CSS e JavaScript puro. Serve como ponto de entrada para o usuario e se comunica com o Gateway via HTTP. Implementa:
- Dashboard de operacoes
- Monitor de status dos servicos em tempo real
- Log de operacoes
- Indicador de tolerancia a falhas

### 2.2 Gateway / Servidor Central (porta 8080)

Servico intermediario desenvolvido com Node.js e Express. Responsabilidades:
- Receber requisicoes do frontend
- Rotear para o microservico correto com base na operacao
- Gerenciar falhas de servicos com circuit breaker
- Manter cache do ultimo resultado para fallback
- Expor endpoint /health com status de todos os servicos

### 2.3 Microservicos

| Servico        | Porta | Operacao    | Container           |
|----------------|-------|-------------|---------------------|
| Soma           | 3001  | a + b       | calc-soma           |
| Subtracao      | 3002  | a - b       | calc-subtracao      |
| Multiplicacao  | 3003  | a * b       | calc-multiplicacao  |
| Divisao        | 3004  | a / b       | calc-divisao        |

Cada microservico expoe:
- `POST /` — executa a operacao com body `{ a, b }`
- `GET /health` — retorna status do servico

## 3. Comunicacao HTTP

```
Frontend  -->  Gateway: POST /calculate { operation, a, b }
Gateway   -->  Servico: POST / { a, b }
Servico   -->  Gateway: { result, operation, a, b }
Gateway   -->  Frontend: { result, service, status }
```

## 4. Tolerancia a Falhas

### 4.1 Independencia de Containers
Cada servico roda em container separado. A queda de um nao afeta os demais.

### 4.2 Circuit Breaker no Gateway
O gateway usa `try/catch` com timeout de 5 segundos. Se o servico nao responder, o gateway:
1. Verifica se existe resultado em cache para aquela operacao
2. Se houver cache: retorna o ultimo resultado com aviso de fallback
3. Se nao houver cache: retorna erro HTTP 503 com mensagem descritiva

### 4.3 Health Check
O Docker Compose inclui `healthcheck` para cada servico com intervalo de 30 segundos e 3 tentativas antes de marcar como `unhealthy`.

### 4.4 Restart Policy
Todos os containers possuem `restart: unless-stopped`, reiniciando automaticamente em caso de falha.

## 5. Rede Docker

Todos os containers estao na mesma rede bridge `calc-network`, permitindo comunicacao por nome de container (DNS interno do Docker).

## 6. Como Executar

```bash
# 1. Clone
git clone https://github.com/wendell0102/projeto-a3-calculadora-distribuida.git
cd projeto-a3-calculadora-distribuida

# 2. Suba os containers
docker compose up --build

# 3. Acesse
# Frontend: http://localhost:3000
# Gateway: http://localhost:8080
# Health: http://localhost:8080/health
```

## 7. Como Testar a Tolerancia a Falhas

```bash
# Derrube o servico de divisao
docker stop calc-divisao

# Tente dividir (erro amigavel)
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":2}'

# Soma continua funcionando
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":2}'

# Restaure o servico
docker start calc-divisao
```

## 8. Variaveis de Ambiente do Gateway

| Variavel              | Descricao                    | Padrao                        |
|-----------------------|------------------------------|-------------------------------|
| ADD_SERVICE_URL       | URL do servico de soma       | http://calc-soma:3001         |
| SUBTRACT_SERVICE_URL  | URL do servico de subtracao  | http://calc-subtracao:3002    |
| MULTIPLY_SERVICE_URL  | URL do servico de mult.      | http://calc-multiplicacao:3003 |
| DIVIDE_SERVICE_URL    | URL do servico de divisao    | http://calc-divisao:3004      |

---

*Documentacao gerada para o Projeto A3 de Sistemas Distribuidos.*
