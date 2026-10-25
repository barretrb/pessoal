# Devocional 365 & Bíblia em 1 Ano (Paulo Won • NVT)

Aplicação web moderna, imersiva e personalizada de leitura bíblica, devocional diário e estudo exegético.

---

## 🌟 Funcionalidades Principais

1. **Gestão de Progresso & Pendências Inteligentes:**
   - Reconhece o seu ponto de leitura: **Dia 298 (Hoje)** com alerta prioritário para recuperar o **Dia 297 (Pendente)**.
   - Marcação rápida de conclusão com celebração e histórico persistido no navegador.
   - Panorama interativo dos 365 dias do ano com filtros (Todos, Pendentes, Concluídos).

2. **Leitor Bíblico Devocional (NVT):**
   - Tipografia editorial refinada (estilo livro) com suporte a 3 temas: **Claro**, **Sépia (leitura suave tipo papel)** e **Escuro Noturno**.
   - **Palavras de Jesus em Destaque (Red Letter):** Realce rubi/carmim nas falas do Senhor Jesus (com botão liga/desliga).
   - **Referências Cruzadas Clicáveis:** Ícone de elo (🔗) ao lado dos versículos com passagens correlatas que abre uma gaveta lateral sem tirar você do texto.
   - **Comentários & Contexto da Perícope:** Aba lateral com visão teológica e espaço para Diário Espiritual (anotações pessoais salvas localmente).
   - **Destaque Colorido & Favoritos:** Paleta com 5 cores (Promessa, Mandamento, Oração, Majestade, Graça) e estrela de favoritos para revisão rápida.

3. **Módulo de Arqueamento (BibleArc - Técnica de John Piper):**
   - Segmentação do texto em proposições oracionais.
   - Diagramação gráfica de arcos lógicos em SVG.
   - Classificação das relações de discurso (Causa/Ground, Inferência, Propósito, Contraste, Concessão, etc.).
   - Salvamento de estudos no navegador para revisão exegética.

4. **Hub Multimídia Devocional:**
   - **Música Devocional do Dia (YouTube Music):** Player em destaque no topo da página inicial para oração e louvor antes da leitura.
   - **Vídeos Temáticos:** Visões gerais do BibleProject em português e estudos contextuais para aprofundar.

---

## 📱 Como Usar no Celular como App (PWA)

A aplicação foi desenhada com design mobile-first e suporte a PWA:

### No iPhone (iOS):
1. Abra a URL do site no **Safari**.
2. Toque no ícone de **Compartilhar** (quadrado com seta para cima).
3. Selecione **"Adicionar à Tela de Início"**.
4. O app terá ícone próprio, abrirá em tela cheia (sem a barra do navegador) e funcionará super rápido!

### No Android:
1. Abra a URL no **Google Chrome**.
2. Toque nos **três pontinhos** no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

---

## 🚀 Como Publicar Grátis Online (Caminho Mais Barato & Rápido)

Como seu repositório já está no GitHub (`barretrb/pessoal`), você pode colocar o site no ar em **menos de 2 minutos, com custo R$ 0,00**:

### Opção 1: Vercel (Recomendada - Zero Hibernação, Instantâneo)
1. Acesse [vercel.com](https://vercel.com) e entre com sua conta do GitHub.
2. Clique em **"Add New Project"** e selecione o repositório `pessoal`.
3. Em **Root Directory**, selecione a pasta `devocional-biblia`.
4. Clique em **Deploy**.
5. Pronto! Você ganha um link `seu-app.vercel.app` gratuito, com HTTPS e atualização automática a cada push no Git.

### Opção 2: Cloudflare Pages (100% Gratuito, Tráfego Ilimitado)
1. Acesse o dashboard da Cloudflare > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecione o repositório `pessoal`.
3. Build command: `npm run build`, Output directory: `dist`, Root directory: `devocional-biblia`.
4. Deploy!

---

## 💻 Como Executar Localmente

```bash
cd devocional-biblia
npm install
npm run dev
```

Acesse em seu navegador no endereço: `http://localhost:5173/`
