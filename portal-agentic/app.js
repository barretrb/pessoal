// Agentic Executive Hub - Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAudioPlayer();
    initFSMSimulator();
    initFlashcards();
    initQuiz();
    initEvalsCalculator();
});

// 1. Navigation Logic
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
                window.scrollTo({ top: targetContent.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

// 2. Podcasts & Executive Audio Synthesis Engine
const podcastTracks = [
    {
        id: 1,
        title: "Ep. 01 — Além do Chatbot: Por que Empresas Constroem Plataformas Anti-Lock-in",
        speaker: "Sérgio Gaiotto (Diretor Executivo Claro Brasil) & Mentoria Executiva",
        duration: "04:30",
        audioText: `Bem-vindo ao Episódio 1 do Executive Agentic Hub. 
Neste episódio discutimos a principal transição da inteligência artificial corporativa: a passagem de geradores de texto e chatbots soltos para verdadeiros Sistemas Agênticos.
Grandes empresas como Mercado Livre com o Fury, Santander, Claro Brasil e ByteDance nunca constroem seus agentes diretamente acoplados a uma única nuvem ou modelo proprietário. Elas constroem uma plataforma própria, um runtime de orquestração agêntica baseado em open-source, utilizando LangChain, LangGraph e Langfuse.
Por que essa decisão é prioritária para Diretores e VPs? Porque ela elimina o chamado Vendor Lock-in. Se amanhã sair um modelo mais barato ou mais inteligente, a empresa troca o motor de inferência sem precisar reescrever um único agente.
Além disso, aprendemos a regra de ouro dos guardrails de segurança: nunca confie apenas em um comando de System Prompt para proteger dados sensíveis. Colocar 'não exponha CPF' em prompt é uma ilusão de segurança, pois quando o texto chega na API do modelo, o dado já vazou para a nuvem. Em produção corporativa, implementamos guardrails em quatro etapas: primeiro Regex determinístico na entrada para mascarar dados pessoais localmente, seguido por checagem de escopo e prompt injection, e somente depois a chamada ao modelo.`,
        tags: ["Anti-Lock-in", "Guardrails", "Plataforma"]
    },
    {
        id: 2,
        title: "Ep. 02 — FSM & FinOps: O Grafo Anti-Risco e a Escala de 500k Áudios/Dia",
        speaker: "Sérgio Gaiotto & Mentoria Executiva",
        duration: "05:15",
        audioText: `No Episódio 2, desmistificamos a orquestração agêntica com LangGraph.
Por que a Máquina de Estados Finitos é uma decisão de governança executiva e não apenas de engenharia de software?
Porque modelos de linguagem são inferência probabilística: eles não possuem garantias determinísticas de execução. Se você soltar um agente ReAct puro direto para clientes ou operações críticas, ele pode inventar procedimentos e causar danos financeiros e de marca.
No LangGraph, controlamos o risco através do estado explícito. Toda transição segue a fórmula: Estado mais Evento gera o Próximo Estado.
O agente é obrigado a passar por um nó de validação determinística de evidências. Se houver divergência entre o que o LLM escreveu e o que as ferramentas de fato retornaram, uma aresta condicional força o ciclo de autocorreção em até três tentativas. Se persistir, o sistema desvia com segurança para a escalação humana.
No campo do FinOps, analisamos o caso real da Claro Brasil: transcrever e analisar mais de quinhentas mil ligações diárias de clientes. Se usassem APIs comerciais de ponta, o custo seria proibitivo. A solução corporativa foi adotar SSLMs, modelos pequenos e especializados rodando WhisperX com fine-tuning de domínio em menos de cinco GPUs, reduzindo custos em mais de oitenta por cento.`,
        tags: ["LangGraph", "FSM", "FinOps", "SSLMs"]
    },
    {
        id: 3,
        title: "Ep. 03 — ByteDance Agent Sphere: O RH de Agentes e a Two-Slice Pizza Team",
        speaker: "Sérgio Gaiotto & Mentoria Executiva",
        duration: "04:50",
        audioText: `Neste Episódio 3, mergulhamos no conceito de Deep Agent Harness e no framework corporativo da ByteDance Volcano Engine: o Agent Sphere.
A fórmula fundamental do produto agêntico é: Agente é igual ao Modelo mais o Harness. Como nenhuma empresa é dona do modelo de fronteira da OpenAI ou da Google, o seu diferencial competitivo mora 100% no Harness.
O Harness é o ecossistema que permite trabalho de longa duração: planejamento explícito com lista de tarefas, sistema de arquivos virtual com permissões restritas, sub-agentes com contexto isolado e memória de longo prazo.
A ByteDance gerencia seus agentes como verdadeiros Funcionários Digitais em quatro pilares fundamentais:
Primeiro, Hire: contratação e onboarding padronizado de templates de agentes.
Segundo, Train: habilitação de habilidades profissionais com Skills em YAML e bases de conhecimento.
Terceiro, Run: execução de tarefas autônomas e salas de projeto colaborativas entre múltiplos agentes e humanos.
Quarto, Eval: dashboard executivo com placar de ROI, custo por tarefa e precisão.
Essa mudança transforma a clássica Two-Pizza Team de Jeff Bezos na Two-Slice Pizza Team: um único Product Manager orquestrando uma squad de sub-agentes especialistas.`,
        tags: ["ByteDance", "Harness", "Sub-agentes", "Digital Employees"]
    },
    {
        id: 4,
        title: "Ep. 04 — Golden Dataset de 500 Casos, Régua 0.75 vs 0.90 e o Marco Legal (PL 2338/23)",
        speaker: "Sérgio Gaiotto & Mentoria Executiva",
        duration: "05:40",
        audioText: `No quarto e último episódio, abordamos a entrada em produção: avaliação contínua, observabilidade e o cenário regulatório brasileiro.
Quando um agente entra em produção, ele enfrenta cinco grandes desafios: variabilidade probabilística, custos de tokens, latência de tempo até o primeiro token, alucinação de dados e degradação silenciosa.
Para evitar que atualizações silenciosas quebrem seu produto, nunca aponte para versões móveis como gpt-latest. Sempre fixe a versão exata do modelo e rode baterias de teste automatizadas em esteiras de integração contínua.
A recomendação para um Golden Dataset corporativo maduro é de cerca de quinhentos cenários curados por domínio.
A avaliação é dividida na proporção sessenta para quarenta: sessenta por cento do peso em regras determinísticas gratuitas que rodam em milissegundos, e quarenta por cento em um Juiz de IA focado estritamente em avaliar se as afirmações possuem fundamentação nas evidências.
A régua de corte para Go-Live é categórica: para agentes internos e copilotos de operação, o score mínimo exigido é de 0.75. Já para agentes expostos diretamente ao cliente final, a nota de corte é de 0.90.
Por fim, destacamos o Projeto de Lei 2338 de 2023, o Marco Legal da Inteligência Artificial no Brasil fiscalizado pela ANPD. Ele exigirá explicabilidade e rastreabilidade total das decisões automatizadas. A observabilidade via Langfuse deixa de ser uma escolha técnica e torna-se um requisito legal de conformidade corporativa.`,
        tags: ["Avaliação 60/40", "Golden Dataset", "ANPD", "CI/CD"]
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let currentUtterance = null;
let currentSpeed = 1;

function initAudioPlayer() {
    renderPlaylist();
    loadTrack(0);

    const playBtn = document.getElementById('btnPlayPause');
    const speedBtn = document.getElementById('btnSpeed');
    const nextBtn = document.getElementById('btnNext');
    const prevBtn = document.getElementById('btnPrev');

    if (playBtn) {
        playBtn.addEventListener('click', togglePlayPause);
    }
    if (speedBtn) {
        speedBtn.addEventListener('click', toggleSpeed);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % podcastTracks.length;
            loadTrack(currentTrackIndex);
            if (isPlaying) playAudio();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex - 1 + podcastTracks.length) % podcastTracks.length;
            loadTrack(currentTrackIndex);
            if (isPlaying) playAudio();
        });
    }
}

function renderPlaylist() {
    const playlistContainer = document.getElementById('playlistGrid');
    if (!playlistContainer) return;

    playlistContainer.innerHTML = podcastTracks.map((track, idx) => `
        <div class="track-item ${idx === currentTrackIndex ? 'active' : ''}" onclick="selectTrack(${idx})">
            <div class="track-num">${idx + 1}</div>
            <div class="track-details">
                <h4>${track.title}</h4>
                <p>${track.speaker} • ⏱️ ${track.duration}</p>
            </div>
        </div>
    `).join('');
}

window.selectTrack = function(index) {
    currentTrackIndex = index;
    loadTrack(index);
    playAudio();
};

function loadTrack(index) {
    const track = podcastTracks[index];
    document.getElementById('currentEpTitle').innerText = track.title;
    document.getElementById('currentEpSpeaker').innerText = track.speaker;
    document.getElementById('transcriptBox').innerHTML = track.audioText.split('\n\n').map(p => `<p style="margin-bottom: 1rem;">${p}</p>`).join('');
    
    // Update active playlist UI
    const items = document.querySelectorAll('.track-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    isPlaying = false;
    updatePlayBtnUI();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    if (!('speechSynthesis' in window)) {
        alert('Seu navegador não suporta síntese de voz nativa.');
        return;
    }

    window.speechSynthesis.cancel();
    const track = podcastTracks[currentTrackIndex];
    currentUtterance = new SpeechSynthesisUtterance(track.audioText);
    currentUtterance.lang = 'pt-BR';
    currentUtterance.rate = currentSpeed;

    // Pick PT-BR voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt') || v.lang.includes('PT'));
    if (ptVoice) currentUtterance.voice = ptVoice;

    currentUtterance.onend = () => {
        isPlaying = false;
        updatePlayBtnUI();
    };

    window.speechSynthesis.speak(currentUtterance);
    isPlaying = true;
    updatePlayBtnUI();
}

function pauseAudio() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    isPlaying = false;
    updatePlayBtnUI();
}

function updatePlayBtnUI() {
    const playBtn = document.getElementById('btnPlayPause');
    if (playBtn) {
        playBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
    }
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
    });
}

function toggleSpeed() {
    const speeds = [1, 1.25, 1.5, 2];
    let nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
    currentSpeed = speeds[nextIdx];
    document.getElementById('btnSpeed').innerText = `${currentSpeed}x`;
    if (isPlaying) {
        playAudio();
    }
}

// 3. LangGraph FSM Interactive Simulator
const fsmScenarios = {
    sev1: {
        title: "Incidente Crítico SEV1 (OpsPilot INC-2041)",
        steps: [
            { node: "node-start", log: "[START] Recebido chamado: 'Checkout lento e compras falhando'." },
            { node: "node-classificar", log: "[CLASSIFICAR] LLM classifica categoria: 'incidente'. Desvio para 'investigar'." },
            { node: "node-investigar", log: "[INVESTIGAR] Modelo solicita tool_calls: ler_logs('checkout-api') e consultar_metricas('pagamentos-db')." },
            { node: "node-ferramentas", log: "[FERRAMENTAS] Execução real: Erro 503 detectado e pool reduzido de 50 para 10 conexões." },
            { node: "node-investigar", log: "[INVESTIGAR] Observação recebida. Modelo formula diagnóstico preliminar: Causa raiz no pagamentos-db." },
            { node: "node-validar", log: "[VALIDAR] Validação determinística Pydantic: Evidências cruzadas com ToolMessages. Sucesso! Severidade: SEV1." },
            { node: "node-aprovar", log: "[HITL - INTERRUPT] Ação com efeito colateral detectada: pausando execução e solicitando aprovação humana." },
            { node: "node-responder", log: "[RESPONDER] Ticket OPS-2041 aberto com sucesso após aprovação. Notificação enviada." },
            { node: "node-end", log: "[END] Execução finalizada com persistência Sqlite/Postgres." }
        ]
    },
    alucinacao: {
        title: "Alucinação Detectada & Autocorreção Cíclica",
        steps: [
            { node: "node-start", log: "[START] Recebida hipótese: 'O worker de e-mail caiu'." },
            { node: "node-classificar", log: "[CLASSIFICAR] Categoria: 'incidente'." },
            { node: "node-investigar", log: "[INVESTIGAR] Modelo formula diagnóstico afirmando que a fila está zerada sem consultar ferramentas." },
            { node: "node-validar", log: "[VALIDAR - FALHA] Alucinação detectada! As evidências citadas não constam no histórico de tools. Tentativas: 1/3." },
            { node: "node-investigar", log: "[CICLO DE RETRY] Grafo retrocede para 'investigar' injetando o erro para nova coleta de dados." },
            { node: "node-ferramentas", log: "[FERRAMENTAS] Coleta forçada: consultar_metricas('notificacoes-worker'). Fila real: 1.340 e-mails." },
            { node: "node-validar", log: "[VALIDAR - SUCESSO] Diagnóstico corrigido e lastreado. Tentativas: 2/3. Rota aprovada!" },
            { node: "node-responder", log: "[RESPONDER] Diagnóstico consistente gerado." },
            { node: "node-end", log: "[END] Finalizado." }
        ]
    },
    recusa: {
        title: "Entrada Fora de Escopo / Prompt Injection (Custo Zero)",
        steps: [
            { node: "node-start", log: "[START] Pergunta: 'Escreva um poema sobre a Grécia Antiga'." },
            { node: "node-classificar", log: "[CLASSIFICAR] LLM leve detecta escopo: 'fora'. Custo: ~10 tokens." },
            { node: "node-recusar", log: "[RECUSAR] Resposta padrão emitida: 'Escopo restrito a incidentes de infraestrutura'. Sem acionamento de tools." },
            { node: "node-end", log: "[END] Finalizado em 120ms com custo desprezível." }
        ]
    }
};

let simStepIndex = 0;
let simInterval = null;
let currentScenario = fsmScenarios.sev1;

function initFSMSimulator() {
    const btns = document.querySelectorAll('.scenario-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.getAttribute('data-scenario');
            currentScenario = fsmScenarios[key];
            resetSimulation();
        });
    });

    const runBtn = document.getElementById('btnRunSimulation');
    if (runBtn) {
        runBtn.addEventListener('click', runSimulation);
    }
}

function resetSimulation() {
    clearInterval(simInterval);
    simStepIndex = 0;
    const nodes = document.querySelectorAll('.fsm-node');
    nodes.forEach(n => n.classList.remove('active', 'highlight-pass', 'highlight-fail'));
    const consoleEl = document.getElementById('fsmConsole');
    if (consoleEl) {
        consoleEl.innerHTML = `<span style="color: #64748b;">// Selecione um cenário e clique em 'Executar FSM no LangGraph'</span>`;
    }
}

function runSimulation() {
    resetSimulation();
    const consoleEl = document.getElementById('fsmConsole');
    consoleEl.innerHTML = `<strong>--- INICIANDO FLUXO: ${currentScenario.title} ---</strong>\n`;

    simInterval = setInterval(() => {
        if (simStepIndex >= currentScenario.steps.length) {
            clearInterval(simInterval);
            consoleEl.innerHTML += `\n<strong style="color: #10b981;">--- FLUXO CONCLUÍDO COM SUCESSO ---</strong>`;
            return;
        }

        const step = currentScenario.steps[simStepIndex];
        const nodes = document.querySelectorAll('.fsm-node');
        nodes.forEach(n => n.classList.remove('active'));

        const targetNode = document.getElementById(step.node);
        if (targetNode) {
            targetNode.classList.add('active');
            if (step.log.includes('FALHA')) {
                targetNode.classList.add('highlight-fail');
            } else if (step.log.includes('SUCESSO')) {
                targetNode.classList.add('highlight-pass');
            }
        }

        consoleEl.innerHTML += `<div>${step.log}</div>`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
        simStepIndex++;
    }, 1200);
}

// 4. Flashcards Interativos
function initFlashcards() {
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// 5. Quiz Executivo de Prontidão
const quizQuestions = [
    {
        q: "Por que uma grande corporação deve priorizar LangGraph em vez de frameworks de conversação livre como AutoGen para operações críticas?",
        options: [
            "Porque o LangGraph é mais rápido para criar protótipos de chat livre sem precisar definir esquemas de estado.",
            "Porque o LangGraph modela Máquinas de Estados Finitos (FSM) com estado tipado, permitindo validação determinística de evidências, limites de retry e rotas seguras de escalação humana.",
            "Porque frameworks como AutoGen exigem pagamento de licenças mensais à OpenAI.",
            "Porque o LangGraph não permite integração com modelos de código aberto."
        ],
        answer: 1,
        feedback: "Exato! Em ambientes corporativos regulados, a previsibilidade e a rastreabilidade de estado do LangGraph são fundamentais para evitar alucinações e ações com efeito colateral desgovernadas."
    },
    {
        q: "Em relação aos Guardrails de segurança corporativa e LGPD, qual é a falha grave de colocar a instrução 'Não exiba CPF' apenas no System Prompt?",
        options: [
            "O System Prompt só funciona em inglês, gerando falhas em português.",
            "A instrução não reduz o custo de tokens na chamada de saída.",
            "O prompt só é processado após o dado sensível ter chegado aos servidores da nuvem do modelo, o que já constitui vazamento de dados corporativos para fora da empresa.",
            "Os modelos atuais ignoram completamente qualquer instrução de System Prompt."
        ],
        answer: 2,
        feedback: "Perfeito! A proteção de dados sensíveis exige guardrails de entrada determinísticos (como Regex local) para mascarar os dados antes do envio para qualquer API de terceiros."
    },
    {
        q: "Segundo a experiência executiva compartilhada no curso, qual a nota de corte recomendada no Golden Dataset para aprovar o Go-Live de um agente voltado ao cliente final?",
        options: [
            "0.50 (50%)",
            "0.75 (75%)",
            "0.90 (90%)",
            "1.00 (100%) obrigatoriamente sem tolerância a nenhuma variação"
        ],
        answer: 2,
        feedback: "Correto! Agentes internos de apoio/backoffice operam bem com 0.75, mas para agentes expostos ao cliente final o risco de marca e jurídico exige nota de corte mínima de 0.90."
    },
    {
        q: "Qual a diferença essencial entre a memória persistente (AGENTS.md) e as habilidades modulares (SKILL.md) na arquitetura de um Deep Agent?",
        options: [
            "O AGENTS.md é apenas um arquivo de log temporário, enquanto o SKILL.md armazena credenciais de banco.",
            "O AGENTS.md é carregado continuamente e pode ser editado pelo agente com aprendizados históricos, enquanto o SKILL.md usa progressive disclosure (só carrega o corpo sob demanda) e é governado por humanos.",
            "Não há diferença prática, ambos são nomes alternativos para o System Prompt.",
            "O SKILL.md só pode ser escrito em linguagem C++."
        ],
        answer: 1,
        feedback: "Exato! SKILL.md é o padrão de processo mantido pelo PM/time (carregado sob demanda), enquanto AGENTS.md guarda o contexto cumulativo e vocabulário do projeto."
    }
];

let currentQIdx = 0;
let userScore = 0;

function initQuiz() {
    renderQuestion(0);
}

function renderQuestion(idx) {
    const qData = quizQuestions[idx];
    const numEl = document.getElementById('quizQNum');
    const textEl = document.getElementById('quizQText');
    const optionsContainer = document.getElementById('quizOptions');
    const feedbackEl = document.getElementById('quizFeedback');

    if (!qData) {
        showQuizResult();
        return;
    }

    numEl.innerText = `Pergunta ${idx + 1} de ${quizQuestions.length}`;
    textEl.innerText = qData.q;
    feedbackEl.style.display = 'none';

    optionsContainer.innerHTML = qData.options.map((opt, i) => `
        <div class="quiz-option" onclick="handleQuizAnswer(${i})">
            <span style="font-weight: 700; color: var(--blip-cyan);">${String.fromCharCode(65 + i)})</span> ${opt}
        </div>
    `).join('');
}

window.handleQuizAnswer = function(selectedIdx) {
    const qData = quizQuestions[currentQIdx];
    const options = document.querySelectorAll('.quiz-option');
    const feedbackEl = document.getElementById('quizFeedback');

    options.forEach(o => o.style.pointerEvents = 'none');

    if (selectedIdx === qData.answer) {
        options[selectedIdx].classList.add('correct');
        feedbackEl.style.display = 'block';
        feedbackEl.style.background = 'rgba(16, 185, 129, 0.15)';
        feedbackEl.style.color = '#a7f3d0';
        feedbackEl.innerHTML = `<strong>Correto!</strong> ${qData.feedback}`;
        userScore++;
    } else {
        options[selectedIdx].classList.add('wrong');
        options[qData.answer].classList.add('correct');
        feedbackEl.style.display = 'block';
        feedbackEl.style.background = 'rgba(244, 63, 94, 0.15)';
        feedbackEl.style.color = '#fecdd3';
        feedbackEl.innerHTML = `<strong>Incorreto.</strong> ${qData.feedback}`;
    }

    setTimeout(() => {
        currentQIdx++;
        renderQuestion(currentQIdx);
    }, 3200);
};

function showQuizResult() {
    const box = document.getElementById('quizContainer');
    let title = "";
    let desc = "";

    if (userScore === quizQuestions.length) {
        title = "Nível Staff / Líder Executivo de IA (100% de Aproveitamento)";
        desc = "Você domina os conceitos arquiteturais, de governança e FinOps necessários para liderar discussões com Diretoria/VP e guiar times de engenharia.";
    } else if (userScore >= 2) {
        title = "Nível Product Manager Prático (Bom Domínio)";
        desc = "Você compreende os trade-offs de produto e a separação entre protótipos e sistemas corporativos. Recomendamos revisar os conceitos de FinOps e Guardrails.";
    } else {
        title = "Nível em Evolução";
        desc = "Recomendamos explorar os podcasts dos episódios 2 e 4 e o simulador interativo de FSM.";
    }

    box.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏆</div>
            <h3 style="font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">${title}</h3>
            <p style="font-size: 1.1rem; color: var(--text-muted); max-width: 650px; margin: 0 auto 2rem;">${desc}</p>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--blip-cyan); margin-bottom: 2rem;">Pontuação: ${userScore} de ${quizQuestions.length} acertos</div>
            <button class="btn-primary" onclick="resetQuiz()">Tentar Novamente</button>
        </div>
    `;
}

window.resetQuiz = function() {
    currentQIdx = 0;
    userScore = 0;
    location.reload();
};

// 6. Calculadora Interativa de Evals 60/40
function initEvalsCalculator() {
    const calcBtn = document.getElementById('btnCalculateEvals');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateEvalsScore);
    }
}

function calculateEvalsScore() {
    const r1 = document.getElementById('evalRule1').checked ? 1 : 0;
    const r2 = document.getElementById('evalRule2').checked ? 1 : 0;
    const r3 = document.getElementById('evalRule3').checked ? 1 : 0;
    const r4 = document.getElementById('evalRule4').checked ? 1 : 0;
    const judgeScore = parseFloat(document.getElementById('evalJudgeRange').value) / 5; // normalize 0-1

    const rulesScore = (r1 + r2 + r3 + r4) / 4; // 0 to 1
    const compositeScore = (rulesScore * 0.6) + (judgeScore * 0.4);

    const scoreDisplay = document.getElementById('evalCompositeDisplay');
    const badgeInternal = document.getElementById('gateBadgeInternal');
    const badgeExternal = document.getElementById('gateBadgeExternal');

    scoreDisplay.innerText = compositeScore.toFixed(3);

    // Internal gate (threshold 0.75)
    if (compositeScore >= 0.75) {
        badgeInternal.className = 'badge-pass';
        badgeInternal.innerText = 'APROVADO (>= 0.75)';
    } else {
        badgeInternal.className = 'badge-fail';
        badgeInternal.innerText = 'REPROVADO (< 0.75)';
    }

    // External gate (threshold 0.90)
    if (compositeScore >= 0.90) {
        badgeExternal.className = 'badge-pass';
        badgeExternal.innerText = 'APROVADO (>= 0.90)';
    } else {
        badgeExternal.className = 'badge-fail';
        badgeExternal.innerText = 'BLOQUEADO (< 0.90)';
    }
}
