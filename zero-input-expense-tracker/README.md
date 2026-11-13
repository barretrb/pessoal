# Zero-Input Expense Tracker

Sistema autônomo de controle financeiro pessoal: captura notificações bancárias e de carteiras digitais via **MacroDroid**, filtra e extrai dados estruturados com **Groq (`llama-3.3-70b-versatile`)**, aprende estabelecimentos em **`merchant_memory`**, confirma dúvidas via **Telegram Bot (HITL)**, lança receitas/despesas fixas pelo **Planejamento Anual** e exibe métricas em um **Dashboard Web**.

## Estrutura do Projeto

```text
zero-input-expense-tracker/
├── app/
│   ├── main.py                 # Entrypoint FastAPI e lifespan
│   ├── config.py               # Configurações via pydantic-settings
│   ├── database.py             # SQLAlchemy (SQLite / MySQL)
│   ├── models.py               # Transaction, MerchantMemory, AnnualPlan
│   ├── schemas.py              # Contratos Pydantic (API e AI JSON Mode)
│   ├── security.py             # Auth X-API-Key e sessão do Dashboard
│   ├── services/
│   │   ├── ai_parser.py        # Groq llama-3.3-70b-versatile + pré-match em memória
│   │   ├── ingestion.py        # Pipeline: memória -> IA -> dedup 3min -> DB -> Telegram
│   │   ├── telegram_bot.py     # Bot API (notificação silenciosa e Inline Keyboard)
│   │   ├── planner.py          # Motor de Planejamento Anual (FIXED_PLAN)
│   │   └── analytics.py        # Saldo Livre, Burn Rate e Breakdown por categoria
│   ├── routers/
│   │   ├── webhooks.py         # POST /api/v1/webhook/notification e /telegram
│   │   ├── cron.py             # POST /api/v1/cron/daily
│   │   ├── plan.py             # CRUD /api/v1/annual-plan
│   │   └── dashboard.py        # GET /login, /dashboard
│   └── templates/
│       ├── login.html
│       └── dashboard.html      # TailwindCSS + Chart.js
├── tests/
│   └── test_ingestion.py       # Suite pytest com mocks de bancos BR e Google Pay
├── .env.example
├── requirements.txt
└── README.md
```

## Setup Local

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edite o .env com suas chaves reais
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Acesse o dashboard em `http://localhost:8000/dashboard`.

## Testes

```bash
pytest -v
```

## Configuração do Telegram Bot (HITL)

1. Crie um bot no [@BotFather](https://t.me/BotFather) e obtenha o `TELEGRAM_BOT_TOKEN`.
2. Descubra seu `TELEGRAM_CHAT_ID` (ex: via `@userinfobot`).
3. Com o backend exposto em HTTPS, registre o webhook do Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.com/api/v1/webhook/telegram",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET_DO_ENV>"
  }'
```

Comandos disponíveis no chat do bot: `/saldo` ou `/resumo`.

## Configuração do MacroDroid (Android)

1. **Gatilho (Trigger):** `Notificação Recebida`
   - Selecione os apps desejados: Nubank, Itaú, Inter, Bradesco, Santander, Mercado Pago, Google Wallet / Google Pay, etc.
2. **Ação (Action):** `Requisição HTTP` (`HTTP Request`)
   - **Método:** `POST`
   - **URL:** `https://seu-dominio.com/api/v1/webhook/notification`
   - **Cabeçalhos (Headers):**
     - `Content-Type`: `application/json`
     - `X-API-Key`: `<API_SECRET_KEY_DO_ENV>`
   - **Corpo (Body):**

```json
{
  "app": "{not_app_package}",
  "title": "{not_title}",
  "text": "{not_text}",
  "timestamp": "{year}-{month_digit}-{dayofmonth}T{hour}:{minute}:{second}-03:00"
}
```

## Cron Diário (Planejamento Anual)

Agende no `crontab` do servidor (ex: todos os dias às 06:00) para lançar receitas e despesas fixas do dia:

```cron
0 6 * * * curl -s -X POST "https://seu-dominio.com/api/v1/cron/daily" -H "X-API-Key: <API_SECRET_KEY>" > /dev/null
```

O endpoint é idempotente por `(annual_plan_id, YYYY-MM)`, evitando lançamentos duplicados mesmo se executado mais de uma vez no mesmo dia.

## Deploy em Produção & Migração para MySQL

- **Reverse Proxy:** Recomenda-se rodar `uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2` atrás de Nginx/Caddy com TLS (HTTPS obrigatório para o webhook do Telegram).
- **Migração para MySQL:** Basta alterar `DATABASE_URL` no `.env` para:
  `mysql+pymysql://usuario:senha@host:3306/finance_db?charset=utf8mb4`
  (o driver `pymysql` já está incluído no `requirements.txt` e os modelos SQLAlchemy usam tipos compatíveis).
