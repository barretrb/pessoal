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

## 🔑 6. Guia Passo a Passo: Como Obter as Chaves e Configurar Cada Ferramenta

Todas as ferramentas utilizadas neste projeto possuem **nível gratuito generoso (Free Tier)** e não exigem cartão de crédito para os testes!

### 📱 6.1. CallMeBot (API de WhatsApp Gratuita — 1 minuto)
O CallMeBot permite que scripts enviem mensagens de texto para o seu WhatsApp pessoal via requisição HTTP simples:

1. Salve o número do bot do CallMeBot na sua agenda do celular: **`+34 644 59 71 84`** (ou acesse diretamente pelo link: [api.callmebot.com](https://api.callmebot.com/whatsapp.php)).
2. Abra uma conversa com ele no WhatsApp e envie exatamente a seguinte mensagem:
   ```text
   I allow callmebot to send me messages
   ```
3. O bot responderá em poucos segundos confirmando a autorização e enviará a sua **API Key numérica** (ex: `6993580`).
4. Guarde essa chave e o seu número de telefone com DDI e DDD (ex: `5521999999999`).

---

### 🧠 6.2. Groq (Inferência Ultrarrápida com Llama 3.3 — 1 minuto)
A Groq fornece acesso gratuito e em milissegundos aos melhores modelos abertos do mundo (Llama 3.3 70B):

1. Acesse o portal oficial de desenvolvedores: **[console.groq.com](https://console.groq.com/)**.
2. Faça login usando sua conta do Google ou GitHub.
3. No menu lateral esquerdo, clique em **API Keys**.
4. Clique no botão **`Create API Key`**, dê um nome (ex: `Agente-A-Unica-Coisa`) e clique em **Submit**.
5. Copie a chave gerada imediatamente (ela começa com `gsk_...`), pois ela só será exibida uma vez.

---

### 📅 6.3. Google Cloud Console (Google Tasks & Google Calendar API — 3 minutos)
Para que o agente possa ler suas listas e gerenciar o Time Blocking no seu calendário:

1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)** e faça login na sua conta Google.
2. No menu superior, clique no seletor de projetos e em **"New Project"** (Nome sugerido: `Agente-A-Unica-Coisa`).
3. **Ative as duas APIs necessárias:**
   * No menu lateral, vá em **APIs & Services > Library**.
   * Pesquise por **Google Tasks API** e clique em **Enable**.
   * Volte à biblioteca, pesquise por **Google Calendar API** e clique em **Enable**.
4. **Configure a Tela de Consentimento (OAuth Consent Screen):**
   * Vá em **APIs & Services > OAuth consent screen**.
   * Escolha o tipo de usuário **External** e clique em **Create**.
   * Preencha o nome do App (ex: `A Única Coisa`) e seu e-mail de suporte.
   * Na etapa **Scopes**, adicione: `.../auth/tasks` e `.../auth/calendar`.
   * Na etapa **Test users**, clique em **Add Users** e adicione o seu próprio e-mail Google (isso permite que você faça login em modo de desenvolvimento).
5. **Crie a Credencial OAuth:**
   * Vá em **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   * Em **Application type**, selecione **Desktop app** (ou *Web application*).
   * Clique em **Create** e, em seguida, no botão **Download JSON**.
   * Renomeie o arquivo baixado para **`credentials.json`** e coloque-o na raiz do projeto (ou na pasta `A_Unica_Coisa`).

---

### 🌐 6.4. Render (Hospedagem Gratuita do Webhook 24/7 — 2 minutos)
1. Acesse **[dashboard.render.com](https://dashboard.render.com/)** e conecte sua conta do GitHub.
2. Clique em **New + > Web Service**.
3. Selecione o repositório `pessoal` (ou o repositório onde seu código está salvo).
4. Configure os campos:
   * **Name:** `agente-a-unica-coisa`
   * **Root Directory:** `A_Unica_Coisa`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn src.webhook_server:app --host 0.0.0.0 --port $PORT`
   * **Instance Type:** `Free` ($0/mês)
5. Na seção **Environment Variables**, adicione suas 4 variáveis:
   * `WHATSAPP_PHONE`: `5521999999999`
   * `CALLMEBOT_APIKEY`: Sua API Key do CallMeBot
   * `GROQ_API_KEY`: Sua chave `gsk_...` da Groq
   * `PYTHON_VERSION`: `3.12.0`
6. Clique em **Deploy Web Service** e copie a URL pública gerada (ex: `https://agente-a-unica-coisa.onrender.com`).

---

### ⏰ 6.5. cron-job.org (Agendamento Automático dos Rituais — 2 minutos)
Para que o agente dispare automaticamente nos horários certos todos os dias úteis:

1. Acesse **[cron-job.org](https://cron-job.org/)** e crie uma conta gratuita.
2. No painel, clique em **Create Cronjob** e cadastre as 3 rotinas:
   * **Job 1 (Briefing Matinal):**
     * URL: `https://seu-app.onrender.com/cron/morning`
     * Schedule: Seg a Sex às **08:15** (Fuso Horário: America/Sao_Paulo)
   * **Job 2 (Pílula do Almoço):**
     * URL: `https://seu-app.onrender.com/cron/lunch`
     * Schedule: Seg a Sex às **12:30**
   * **Job 3 (Check-in Noturno):**
     * URL: `https://seu-app.onrender.com/cron/night`
     * Schedule: Seg a Sex às **18:00**

---

## 🛠️ 7. Instalação e Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/barretrb/pessoal.git
cd pessoal/A_Unica_Coisa

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure as variáveis de ambiente ou config.json
cp config/config.example.json config/config.json

# 4. Execute a bateria completa de testes unitários (17 testes)
python -m unittest discover -s tests

# 5. Inicie o servidor FastAPI local
uvicorn src.webhook_server:app --reload --port 8000
```

---

## ⚖️ 8. Licença e Créditos
Desenvolvido por **Rafael Barreto** como parte do ecossistema de agentes autônomos de produtividade e IA.  
Inspirado na obra de **Gary Keller e Jay Papasan** (*The ONE Thing*).
