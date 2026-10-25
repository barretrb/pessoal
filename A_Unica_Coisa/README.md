# 🎯 Agente "A Única Coisa" (One Thing Prioritizer & Tracker)

Agente de produtividade proativo baseado no livro *"A Única Coisa"* (Gary Keller). Ele automatiza o ritual diário de priorização entre os domínios **Profissional** e **Pessoal** (*Contrapeso*), bloqueia janelas de foco no Google Calendar e monitora a execução via WhatsApp.

---

## 🛠️ Arquitetura do Sistema

```
[Google Tasks API]               [Google Calendar API]
(Listas: Profissional / Pessoal) (Leitura de slots + Time Blocking)
       │                                  │
       ▼                                  ▼
       [Core Engine: Antigravity Agent]  ◄──►  [State / DB Tracker]
       (Parser + Inferência LLM + Matriz "A Única Coisa")
                      ▲
                      │
           [Interface: WhatsApp]
   (Briefing Matinal / Check-in Noturno / Captura Contínua)
```

---

## 📋 Micro-Sintaxe Suportada nas Tarefas

* `[D]` ou `!` : Marca a tarefa com alto **Efeito Dominó** (prioridade máxima Deep Work).
* `[B]` ou `⚠️` : Marca como **Bloqueada por terceiros** (inelegível para foco do dia).
* `#90m`, `#2h` : Define duração estimada explicitamente.

---

## 🚀 Como Iniciar

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure seu `config/config.json` a partir do `config/config.example.json`.
3. Insira o arquivo `credentials.json` (OAuth 2.0 Client ID) na raiz do projeto.
4. Execute os testes unitários:
   ```bash
   python -m unittest discover -s tests
   ```

---

## 🌐 Deploy na Nuvem (Webhook & Automação 24/7)

O projeto inclui suporte pronto para deploy no **Render** (plano gratuito) ou qualquer servidor Docker:

* **Servidor Webhook (FastAPI):** `src/webhook_server.py`
  * Rota `POST /webhook/whatsapp` : Escuta respostas do usuário ("OK", "Trocar por X", conclusões noturnas e captura rápida de tarefas como *"Amanhã preciso..."*).
  * Rota `GET /cron/morning` : Disparo matinal (08:15).
  * Rota `GET /cron/night` : Fechamento noturno (18:00).
  * Rota `GET /cron/weekly` : Planejamento semanal (segundas às 08:00).
* **Arquivo de Deploy Render:** `render.yaml`
* **Container Docker:** `Dockerfile`
