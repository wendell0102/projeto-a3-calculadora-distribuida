# Calculadora Distribuída com Microserviços e Docker

> **Projeto A3 — Sistemas Distribuídos**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## Descrição

Sistema de calculadora distribuída desenvolvido com arquitetura de microserviços, onde cada operação matemática (soma, subtração, multiplicação e divisão) é executada por um serviço independente em seu próprio container Docker. Um servidor central (gateway) recebe as requisições da interface web e as encaminha ao microserviço correspondente.

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    INTERFACE WEB                    │
│              (Frontend — porta 3000)                │
└────────────────────────┬────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────┐
│                 GATEWAY / SERVER                    │
│              (Servidor Central — porta 8080)        │
└────┬───────────┬──────────────┬──────────────┬──────┘
     │           │              │              │
  HTTP        HTTP            HTTP           HTTP
     │           │              │              │
┌────▼──┐  ┌────▼────┐  ┌──────▼──┐  ┌───────▼─┐
│ SOMA  │  │ SUBTR.  │  │  MULT.  │  │  DIV.   │
│ :3001 │  │  :3002  │  │  :3003  │  │  :3004  │
└───────┘  └─────────┘  └─────────┘  └─────────┘
```

## Estrutura do Projeto

```
projeto-a3-calculadora-distribuida/
├── frontend/
│   ├── index.html          # Interface web (dashboard)
│   └── Dockerfile
├── gateway/
│   ├── index.js            # Servidor central / roteador
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── add/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── subtract/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── multiply/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── divide/
│       ├── index.js
│       ├── package.json
│       └── Dockerfile
├── docs/
│   └── documentacao.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado
- Git instalado

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/wendell0102/projeto-a3-calculadora-distribuida.git
cd projeto-a3-calculadora-distribuida
```

### 2. Suba todos os containers

```bash
docker compose up --build
```

### 3. Acesse a interface web

Abra o navegador em: **http://localhost:3000**

## Portas dos Serviços

| Serviço        | Container          | Porta |
|----------------|--------------------|-------|
| Frontend       | calc-frontend      | 3000  |
| Gateway        | calc-gateway       | 8080  |
| Soma           | calc-soma          | 3001  |
| Subtração      | calc-subtracao     | 3002  |
| Multiplicação  | calc-multiplicacao | 3003  |
| Divisão        | calc-divisao       | 3004  |

## Como Testar os Serviços

### Via interface web
Acesse http://localhost:3000, insira dois números, selecione a operação e clique em Calcular.

### Via curl (linha de comando)

```bash
# Soma: 10 + 5
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":5}'

# Subtração: 10 - 3
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"subtract","a":10,"b":3}'

# Multiplicação: 4 x 7
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"multiply","a":4,"b":7}'

# Divisão: 20 / 4
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":20,"b":4}'
```

### Verificar saúde dos serviços

```bash
curl http://localhost:8080/health
```

## Tolerância a Falhas

O sistema implementa tolerância a falhas com as seguintes estratégias:

- **Independência de containers**: cada serviço roda em seu próprio container; se um cair, os demais continuam funcionando normalmente.
- **Circuit Breaker no Gateway**: o servidor central detecta se um microserviço está indisponível e retorna uma mensagem de erro amigável sem derrubar os outros.
- **Fallback com cache**: para divisão, o gateway mantém o último resultado em cache como fallback.
- **Health Check**: endpoint `/health` retorna o status individual de cada microserviço.

### Demonstrando a tolerância a falhas

```bash
# 1. Derrube o serviço de divisão
docker stop calc-divisao

# 2. Tente uma divisão (retorna erro amigável)
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":2}'

# 3. Soma ainda funciona normalmente
curl http://localhost:8080/calculate -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":2}'

# 4. Restaure o serviço
docker start calc-divisao
```

## Comunicação entre Serviços

Toda comunicação é feita via **HTTP REST**:

- Frontend → Gateway: `POST /calculate`
- Gateway → Microserviço: `POST /` com `{ a, b }`
- Microserviço → Gateway: `{ result: valor }`
- Gateway → Frontend: `{ result: valor, service: nome }`

## Tecnologias Utilizadas

- **Node.js** com Express — backend de todos os serviços
- **HTML/CSS/JavaScript** — interface web
- **Docker** — containerização
- **Docker Compose** — orquestração dos containers
- **Axios** — comunicação HTTP entre serviços

## Licença

MIT — desenvolvido para fins acadêmicos.
