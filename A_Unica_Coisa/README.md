# 🎯 Agente "A Única Coisa" (The ONE Thing AI Agent)

> **Um copiloto autônomo de produtividade extrema que blinda seu foco, prioriza seus dominós e protege seus hábitos inegociáveis via WhatsApp, Google Tasks e Google Calendar.**

---

## 💡 1. A Motivação: Por que este projeto existe?

### ❌ A Ilusão das "To-Do Lists" Infinitas
A maioria dos profissionais produtivos sofre da **"Síndrome da Lista Plana"**: gerenciadores tradicionais de tarefas tratam todas as pendências com a mesma importância visual. Responder um e-mail de rotina disputa atenção com a criação de uma arquitetura estratégica. 

O resultado diário é clássico: passamos o dia ocupados com trabalho operacional (*Shallow Work*), chegamos exaustos às 18h e percebemos que **a entrega mais importante que realmente moveria o ponteiro da carreira ou da vida pessoal ficou intocada**.

### 📖 A Filosofia: "A Única Coisa" (Gary Keller & Jay Papasan)
Este agente foi construído sobre os pilares científicos do best-seller mundial *"A Única Coisa"*:

1. **A Pergunta-Foco:**  
   > *"Qual é a ÚNICA coisa que posso fazer hoje, de tal modo que, ao fazê-la, o restante se torne mais fácil ou desnecessário?"*
2. **O Efeito Dominó:** O sucesso é sequencial, não simultâneo. Você alinha seus dominós e concentra toda a sua força de vontade apenas no primeiro.
3. **O Conceito de Contrapeso (*Counterbalance*):** O equilíbrio estático entre vida e trabalho é um mito. Na vida profissional, você deve ser focado ao extremo; na vida pessoal (saúde, família, desenvolvimento), você deve aplicar o contrapeso contínuo para não deixar os pratos caírem.

Este agente não é apenas um disparador de notificações: **ele é um curador impiedoso de prioridades e um escudo protetor da sua atenção.**

---

## 🏛️ 2. Arquitetura do Sistema

```
                     ┌────────────────────────────────────────┐
                     │         Fontes de Dados & Rotina       │
                     └───────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │   Google Tasks API    │                       │  Google Calendar API  │
     │  (Listas Profissional │                       │  (Leitura de Agenda + │
     │       e Pessoal)      │                       │   Hábitos Âncora)     │
     └───────────┬───────────┘                       └───────────┬───────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │       Core Engine: "A Única Coisa"            │
                 │   - Parser Léxico de Micro-sintaxe            │
                 │   - Motor de Inferência Semântica (Groq LLM)  │
                 │   - Detector Dinâmico de Hábitos Âncora       │
                 │   - Algoritmo de Time Blocking Proativo       │
                 │   - Gerador de Pílulas do Almoço              │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │          Interface de Entrega: WhatsApp       │
                 │   08:15 ──► Briefing Matinal (Leitura em 4s)  │
                 │   12:30 ──► Pílula de Conhecimento no Almoço  │
                 │   18:00 ──► Check-in Noturno de Fechamento    │
                 └───────────────────────────────────────────────┘
```

---

## ⚡ 3. Destaques Técnicos & Engenharia de IA

* **Inferência Semântica com LLM (Groq / Llama 3.3 70B):** Classifica em tempo de execução se tarefas puras são *Deep Work* (alavancagem alta) ou *Shallow Work* (lote da tarde), fatiando tarefas gigantes (> 120min) em blocos executáveis sem exigir que o usuário preencha formulários complexos.
* **Detecção Dinâmica de Hábitos Âncora no Google Calendar:** O agente lê compromissos recorrentes de saúde e aprendizado (como **Corrida**, **Academia** e **Aulas de Inglês**) diretamente da agenda. Se a aula mudar de horário (ex: de 07:45 para 08:30), o agente recalcula os horários dinamicamente em tempo real.
* **Auto-Booking & Time Blocking Proativo:** Identifica a melhor janela livre da manhã (08:30 às 12:30) e cria automaticamente o evento de foco com destaque visual vermelho (*Tomato* / Cor 11) no Google Calendar.
* **Arquitetura Resiliente & Nuvem:**
  * Servidor web assíncrono em **FastAPI** pronto para rodar 24/7 no **Render** (com *Blueprint* declarativo `render.yaml`) ou **Docker**.
  * Autenticação OAuth 2.0 híbrida (funciona localmente via navegador e em servidores headless na nuvem via variáveis de ambiente `GOOGLE_TOKEN_JSON`).
  * Tratamento automático de payloads com encoding misto (UTF-8 / Windows-1252 / Latin-1) e processamento em background tasks.

---

## 📱 4. A Experiência do Usuário (Os 3 Rituais Diários)

### 🌅 1. Às 08:15 — O Ritual Matinal (Foco Puro em 4 Segundos)
Desenhado para ser lido em um piscar de olhos no celular, sem rolagem de tela e sem fadiga de decisão:

> 🎯 **A ÚNICA COISA DE HOJE**
>
> 💼 **Dominó:** *Fechar a criação dos vídeos de demonstração*  
> ⏰ **Janela:** 09:30 às 11:00  
> ⚖️ **Pessoal:** *Aula de Inglês (Rafa - EF) das 07:45 às 08:45*  
> 📦 **Tarde:** Responder fornecedores (+2 rápidas)  
>
> 👉 _Responda **"OK"** para bloquear sua agenda._

---

### 🍽️ 2. Às 12:30 — A Pausa do Almoço (Pílula da Metodologia)
Uma dose diária de reflexão profunda no horário de almoço para calibrar a mentalidade antes do turno da tarde:

> 🍽️ 🧠 **Pausa do Almoço: A Única Coisa**
>
> 📌 *O Conceito de Contrapeso*
>
> _"O equilíbrio perfeito entre vida e trabalho é uma ilusão. O segredo é o contrapeso: foco intenso no trabalho quando estiver no bloco profundo, e presença total na vida pessoal quando for a hora da sua corrida, academia ou estudos."_
>
> 💡 **Dica prática para a tarde:** Ao entrar no trabalho profundo, mergulhe sem distrações. Ao encerrar o expediente, desconecte de verdade.
>
> *(Aproveite o almoço e recarregue a energia para fechar o dia em alta!)*

---

### 🌙 3. Às 18:00 — O Fechamento do Dia (Celebração do Foco)
Um check-in consciente para comemorar as vitórias e descarregar a mente:

> 🌙 **Fechamento do Dia:**  
> 1. Derrubou o dominó profissional (*Fechar a criação dos vídeos*)?  
> 2. Cumpriu seu contrapeso pessoal (*Aula de Inglês*)?  
>
> *(Responda quais concluiu para eu registrar suas vitórias ou mande áudio com o que planejar para amanhã).*

---

## 🎬 5. Roteiro Sugerido para Vídeo / Conteúdo (YouTube / LinkedIn)

Se você for gravar um vídeo ou demonstrar o projeto publicamente, siga este roteiro de 3 a 5 minutos:

1. **O Gancho (0:00 - 0:45):**  
   * Abra mostrando uma lista com 25 tarefas no Google Tasks.
   * *"Quantas vezes você terminou o dia exausto sem ter feito a única coisa que realmente importava? Foi por isso que criei este agente com IA."*
2. **A Base Conceitual (0:45 - 1:30):**  
   * Mostre o livro *"A Única Coisa"* de Gary Keller.
   * Explique em 30 segundos o conceito do **Efeito Dominó** e do **Contrapeso**.
3. **A Demonstração Ao Vivo (1:30 - 3:00):**  
   * Mostre a mensagem chegando no WhatsApp às 08:15 com o dominó profissional eleito pela LLM.
   * Mostre o Google Calendar abrindo com a janela de 90 minutos bloqueada automaticamente em vermelho.
   * Mostre a identificação da aula de inglês ou da corrida que já estavam marcadas na agenda como o Contrapeso Pessoal do dia.
4. **A Engenharia por Trás (3:00 - 4:00):**  
   * Mostre o painel do **Render** rodando com FastAPI, Python 3.12 e a integração com a **Groq**.
   * Destaque o código de inferência e a resiliência a falhas de conexão.
5. **Chamada para Ação (4:00 - 4:30):**  
   * *"O código está aberto no meu GitHub. Se você quer automatizar sua disciplina com IA em vez de depender apenas da força de vontade, confira o repositório!"*

---

## 🛠️ 6. Instalação e Execução

### Pré-requisitos
* Python 3.12+
* Conta no Google Cloud Console com as APIs ativadas:
  * **Google Tasks API**
  * **Google Calendar API**
* Chave de API da **Groq** ([console.groq.com](https://console.groq.com/))
* Conta gratuita no **CallMeBot** para entrega no WhatsApp

### Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/barretrb/pessoal.git
cd pessoal/A_Unica_Coisa

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure as variáveis de ambiente ou config.json
cp config/config.example.json config/config.json

# 4. Execute a bateria de testes unitários (17 testes)
python -m unittest discover -s tests

# 5. Inicie o servidor local
uvicorn src.webhook_server:app --reload --port 8000
```

### Deploy na Nuvem (Render / Docker)

1. Conecte o repositório no **[Render](https://dashboard.render.com/)** como um **Web Service** usando o arquivo `render.yaml`.
2. Configure as seguintes variáveis de ambiente:
   * `WHATSAPP_PHONE`: Seu número internacional (ex: `5521999999999`)
   * `CALLMEBOT_APIKEY`: Sua API Key do CallMeBot
   * `GROQ_API_KEY`: Sua chave de API da Groq
   * `PYTHON_VERSION`: `3.12.0`
3. Agende os 3 disparos gratuitos no **[cron-job.org](https://cron-job.org)**:
   * `08:15` ➔ `https://seu-app.onrender.com/cron/morning`
   * `12:30` ➔ `https://seu-app.onrender.com/cron/lunch`
   * `18:00` ➔ `https://seu-app.onrender.com/cron/night`

---

## ⚖️ Licença e Créditos
Desenvolvido por **Rafael Barreto** como parte do ecossistema de agentes autônomos de produtividade e IA.  
Inspirado na obra de **Gary Keller e Jay Papasan** (*The ONE Thing*).
