/**
 * Simulador de Banca Oral PGE-AL
 * Frontend Logic, Audio Recording, Web Speech API, Timers e Relatório Oficial ProGrupo
 */

// Estado Global da Aplicação
const state = {
  config: {
    candidate_name: "Viviane Lima",
    reading_time_seconds: 120,
    response_time_seconds: 300,
    auto_speak_examiner: true,
    examiner_voice_speed: 0.95
  },
  disciplinas: [],
  session: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  stage: "reading", // "reading" | "speaking" | "repergunta" | "repergunta_speaking"
  timerInterval: null,
  timeRemaining: 0,
  totalTimeStage: 0,
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  audioContext: null,
  analyser: null,
  visualizerAnimationId: null,
  speechRecognition: null,
  currentTranscript: "",
  reperguntaTranscript: "",
  hideTranscriptDuringSpeech: false,
  testMicRecording: false,
  testMicContext: null,
  testMicRecognition: null
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarConfiguracoes();
  carregarDisciplinas();
  initSpeechSynthesis();
  initSpeechRecognition();
});

// Navegação entre Telas
function switchView(viewId) {
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  if (viewId === "setup-view") document.getElementById("btn-nav-simulado").classList.add("active");
  if (viewId === "bank-view") document.getElementById("btn-nav-banco").classList.add("active");
  if (viewId === "history-view") document.getElementById("btn-nav-historico").classList.add("active");
}

// Carregar Configurações do Backend
async function carregarConfiguracoes() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.config) {
      state.config = { ...state.config, ...data.config };
      document.getElementById("setup-candidata").value = state.config.candidate_name || "Viviane Lima";
      document.getElementById("cfg-candidata").value = state.config.candidate_name || "Viviane Lima";
      document.getElementById("setup-tempo-leitura").value = state.config.reading_time_seconds || 120;
      document.getElementById("setup-tempo-resposta").value = state.config.response_time_seconds || 300;
      document.getElementById("cfg-auto-speak").checked = state.config.auto_speak_examiner !== false;
      document.getElementById("cfg-voice-speed").value = state.config.examiner_voice_speed || 0.95;
    }
  } catch (err) {
    console.error("Erro ao carregar configurações:", err);
  }
}

// Carregar Disciplinas Disponíveis
async function carregarDisciplinas() {
  try {
    const res = await fetch("/api/disciplinas");
    const list = await res.json();
    state.disciplinas = list;

    const container = document.getElementById("disciplinas-checkbox-container");
    container.innerHTML = "";

    list.forEach((d, idx) => {
      const isDefault = ["Direito Constitucional", "Direito Tributário", "Direito Civil", "Direito Financeiro"].includes(d.nome);
      const div = document.createElement("label");
      div.className = `disc-checkbox-label ${isDefault ? "selected" : ""}`;
      div.innerHTML = `
        <div class="disc-info">
          <input type="checkbox" name="disciplina" value="${d.nome}" ${isDefault ? "checked" : ""} onchange="atualizarEstiloCheckbox(this)">
          <span>${d.nome}</span>
        </div>
        <span class="disc-badge">${d.total} questões</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar disciplinas:", err);
  }
}

function atualizarEstiloCheckbox(input) {
  const label = input.closest(".disc-checkbox-label");
  if (input.checked) {
    label.classList.add("selected");
  } else {
    label.classList.remove("selected");
  }
}

function selecionarTodasDisciplinas(select) {
  document.querySelectorAll('input[name="disciplina"]').forEach(cb => {
    cb.checked = select;
    atualizarEstiloCheckbox(cb);
  });
}

function selecionarPadraoProGrupo() {
  const padrao = ["Direito Constitucional", "Direito Tributário", "Direito Civil", "Direito Financeiro"];
  document.querySelectorAll('input[name="disciplina"]').forEach(cb => {
    cb.checked = padrao.includes(cb.value);
    atualizarEstiloCheckbox(cb);
  });
}

// ==========================================
// VOZ DA BANCA (TEXT-TO-SPEECH)
// ==========================================
let ptBrVoice = null;
function initSpeechSynthesis() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      ptBrVoice = voices.find(v => v.lang === "pt-BR" && (v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("Natural") || v.name.includes("Maria"))) 
                 || voices.find(v => v.lang === "pt-BR") 
                 || voices[0];
    };
  }
}

function falarTexto(texto, onEndCallback = null) {
  if (!("speechSynthesis" in window) || !texto) return;
  window.speechSynthesis.cancel(); // Para qualquer fala anterior
  
  const cleanText = texto.replace(/[\*\#\_]/g, "").trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "pt-BR";
  if (ptBrVoice) utterance.voice = ptBrVoice;
  utterance.rate = parseFloat(document.getElementById("cfg-voice-speed")?.value || state.config.examiner_voice_speed || 0.95);
  utterance.pitch = 0.98;

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }
  window.speechSynthesis.speak(utterance);
}

function ouvirTextoBanca() {
  if (state.currentQuestion) {
    const texto = state.currentQuestion.enunciado_fala || state.currentQuestion.enunciado;
    falarTexto(texto);
  }
}

function ouvirReperguntaBanca() {
  const texto = document.getElementById("sim-repergunta-texto").innerText;
  if (texto) falarTexto(texto);
}

// ==========================================
// RECONHECIMENTO DE FALA (SPEECH-TO-TEXT)
// ==========================================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Navegador não suporta Web Speech API nativa.");
    return;
  }

  state.speechRecognition = new SpeechRecognition();
  state.speechRecognition.continuous = true;
  state.speechRecognition.interimResults = true;
  state.speechRecognition.lang = "pt-BR";

  state.speechRecognition.onresult = (event) => {
    let interim = "";
    let final = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript + " ";
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if (state.stage === "speaking") {
      state.currentTranscript += final;
      const display = (state.currentTranscript + " " + interim).trim();
      document.getElementById("sim-live-transcript").innerText = display || "(Gravando...)";
    } else if (state.stage === "repergunta_speaking") {
      state.reperguntaTranscript += final;
      const display = (state.reperguntaTranscript + " " + interim).trim();
      document.getElementById("sim-live-transcript").innerText = display || "(Gravando resposta da repergunta...)";
    }
  };

  state.speechRecognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
  };

  state.speechRecognition.onend = () => {
    // Se o gravador ainda estiver ativo (e o navegador parou por silêncio), reinicia automaticamente
    if (state.isRecording) {
      try {
        state.speechRecognition.start();
      } catch (e) {}
    }
  };
}

function toggleVisibilidadeTranscricao() {
  const box = document.getElementById("sim-live-transcript");
  const btn = document.getElementById("btn-toggle-transcript");
  if (box.style.filter === "blur(5px)") {
    box.style.filter = "none";
    btn.innerText = "Ocultar durante a fala";
  } else {
    box.style.filter = "blur(5px)";
    btn.innerText = "Exibir transcrição";
  }
}

// ==========================================
// CAPTAÇÃO DE MICROFONE & WAVEFORM
// ==========================================
async function iniciarMicrofoneVisualizador() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.isRecording = true;
    state.audioChunks = [];

    // MediaRecorder para gravação resiliente em blocos de 1 segundo
    state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };
    state.mediaRecorder.start(1000);

    // Visualizador de Ondas Sonoras no Canvas
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    state.audioContext = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    state.analyser = analyser;

    document.getElementById("visualizer-container").style.display = "flex";
    desenharWaveform();

    // Inicia reconhecimento de fala contínuo
    if (state.speechRecognition) {
      try {
        state.speechRecognition.start();
      } catch (e) {}
    }
  } catch (err) {
    console.error("Erro ao acessar microfone:", err);
    alert("Permissão de microfone necessária para a sustentação oral da prova!");
  }
}

function pararMicrofoneVisualizador() {
  state.isRecording = false;
  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
    state.mediaRecorder.stop();
    state.mediaRecorder.stream.getTracks().forEach(t => t.stop());
  }
  if (state.speechRecognition) {
    try {
      state.speechRecognition.stop();
    } catch (e) {}
  }
  if (state.visualizerAnimationId) {
    cancelAnimationFrame(state.visualizerAnimationId);
  }
  if (state.audioContext) {
    try { state.audioContext.close(); } catch (e) {}
  }
  document.getElementById("visualizer-container").style.display = "none";
}

function desenharWaveform() {
  const canvas = document.getElementById("waveform-canvas");
  if (!canvas || !state.analyser) return;
  const ctx = canvas.getContext("2d");
  const bufferLength = state.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    state.visualizerAnimationId = requestAnimationFrame(draw);
    state.analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#4f46e5";
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * (canvas.height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  draw();
}

// ==========================================
// FLUXO DO SIMULADO (CICLO DE VIDA)
// ==========================================
async function iniciarSimulado() {
  const candidata = document.getElementById("setup-candidata").value.trim() || "Viviane Lima";
  const qtdQuestoes = parseInt(document.getElementById("setup-qtd-questoes").value);
  const tempoLeitura = parseInt(document.getElementById("setup-tempo-leitura").value);
  const tempoResposta = parseInt(document.getElementById("setup-tempo-resposta").value);

  const disciplinasChecked = Array.from(document.querySelectorAll('input[name="disciplina"]:checked')).map(cb => cb.value);
  if (disciplinasChecked.length === 0) {
    alert("Por favor, selecione ao menos uma disciplina para o simulado.");
    return;
  }

  document.getElementById("btn-iniciar").disabled = true;
  document.getElementById("btn-iniciar").innerHTML = "<span>⏳</span> Preparando Banca Examinadora...";

  try {
    const res = await fetch("/api/simulado/iniciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidata,
        disciplinas: disciplinasChecked,
        qtd_questoes: qtdQuestoes,
        tempo_leitura: tempoLeitura,
        tempo_resposta: tempoResposta
      })
    });

    const data = await res.json();
    state.session = data.session_id;
    state.totalQuestions = data.total_questoes;
    state.currentQuestionIndex = 0;

    switchView("simulation-view");
    carregarQuestaoDaSessao();
  } catch (err) {
    console.error("Erro ao iniciar simulado:", err);
    alert("Falha ao inicializar o simulado. Verifique se o servidor está ativo.");
  } finally {
    document.getElementById("btn-iniciar").disabled = false;
    document.getElementById("btn-iniciar").innerHTML = "<span>⚖️</span> Iniciar Simulado de Banca Oral";
  }
}

async function carregarQuestaoDaSessao() {
  try {
    const res = await fetch(`/api/simulado/${state.session}/questao_atual`);
    const data = await res.json();

    if (data.concluido) {
      finalizarSimuladoCompleto();
      return;
    }

    state.currentQuestion = data.questao;
    state.currentQuestionIndex = data.indice;
    state.currentTranscript = "";
    state.reperguntaTranscript = "";

    // Atualiza cabeçalho da questão
    document.getElementById("sim-progress-label").innerText = `PERGUNTA ${data.numero} DE ${data.total}`;
    document.getElementById("sim-disc-title").innerText = data.questao.disciplina;
    document.getElementById("sim-topico-title").innerText = data.questao.topico || "PONTOS DA ARGUIÇÃO";
    document.getElementById("sim-enunciado-texto").innerText = data.questao.enunciado;

    // Reseta Repergunta e Transcrição
    document.getElementById("repergunta-container").style.display = "none";
    document.getElementById("sim-live-transcript").innerText = "(Inicie a fala para visualizar a transcrição do microfone...)";

    // Inicia Fase 1: Tempo de Leitura
    iniciarFaseLeitura(data.tempo_leitura);
  } catch (err) {
    console.error("Erro ao carregar questão:", err);
  }
}

// FASE 1: LEITURA
function iniciarFaseLeitura(tempoSegundos) {
  state.stage = "reading";
  pararMicrofoneVisualizador();
  clearInterval(state.timerInterval);

  // Badge visual
  const badge = document.getElementById("sim-stage-badge");
  badge.className = "sim-stage-badge stage-reading";
  document.getElementById("sim-stage-icon").innerText = "📖";
  document.getElementById("sim-stage-text").innerText = "Tempo de Leitura";

  // Botões
  document.getElementById("btn-iniciar-fala-agora").style.display = "inline-flex";
  document.getElementById("btn-finalizar-resposta").style.display = "none";

  // Voz automática do examinador lendo a questão (se habilitado)
  if (state.config.auto_speak_examiner) {
    const textoFala = state.currentQuestion.enunciado_fala || state.currentQuestion.enunciado;
    falarTexto(textoFala);
  }

  // Timer de leitura
  if (tempoSegundos <= 0) {
    document.getElementById("sim-timer-display").innerText = "LIVRE";
    document.getElementById("sim-timer-label").innerText = "LEITURA SEM LIMITE DE TEMPO";
    document.getElementById("sim-timer-fill").style.width = "100%";
    return;
  }

  state.timeRemaining = tempoSegundos;
  state.totalTimeStage = tempoSegundos;
  document.getElementById("sim-timer-label").innerText = "TEMPO RESTANTE PARA LEITURA";
  atualizarDisplayTimer();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    atualizarDisplayTimer();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      tocarSinalSonoro();
      iniciarFaseRespostaOral();
    }
  }, 1000);
}

// FASE 2: RESPOSTA ORAL
function iniciarFaseRespostaOral() {
  window.speechSynthesis.cancel(); // Para a leitura se a candidata já quiser falar
  clearInterval(state.timerInterval);
  state.stage = "speaking";

  // Badge visual
  const badge = document.getElementById("sim-stage-badge");
  badge.className = "sim-stage-badge stage-speaking";
  document.getElementById("sim-stage-icon").innerText = "🎙️";
  document.getElementById("sim-stage-text").innerText = "Resposta Oral da Candidata";

  // Botões
  document.getElementById("btn-iniciar-fala-agora").style.display = "none";
  document.getElementById("btn-finalizar-resposta").style.display = "inline-flex";
  document.getElementById("btn-finalizar-resposta").innerHTML = "<span>✅</span> FINALIZAR RESPOSTA E ENVIAR ÁUDIO";

  // Inicia microfone e visualizador
  iniciarMicrofoneVisualizador();

  // Timer de resposta
  const tempoSegundos = state.session ? parseInt(document.getElementById("setup-tempo-resposta").value) : 300;
  if (tempoSegundos <= 0) {
    document.getElementById("sim-timer-display").innerText = "LIVRE";
    document.getElementById("sim-timer-label").innerText = "SUSTENTAÇÃO ORAL EM ANDAMENTO";
    document.getElementById("sim-timer-fill").style.width = "100%";
    return;
  }

  state.timeRemaining = tempoSegundos;
  state.totalTimeStage = tempoSegundos;
  document.getElementById("sim-timer-label").innerText = "TEMPO RESTANTE DE RESPOSTA ORAL";
  atualizarDisplayTimer();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    atualizarDisplayTimer();

    if (state.timeRemaining <= 30) {
      document.getElementById("sim-timer-display").classList.add("warning");
    }

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      tocarSinalSonoro();
      finalizarRespostaOral();
    }
  }, 1000);
}

function atualizarDisplayTimer() {
  const min = Math.floor(state.timeRemaining / 60);
  const seg = state.timeRemaining % 60;
  document.getElementById("sim-timer-display").innerText = `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;

  const pct = Math.max(0, (state.timeRemaining / state.totalTimeStage) * 100);
  document.getElementById("sim-timer-fill").style.width = `${pct}%`;
}

function tocarSinalSonoro() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

// FINALIZAR RESPOSTA ORAL
async function finalizarRespostaOral() {
  clearInterval(state.timerInterval);
  pararMicrofoneVisualizador();
  document.getElementById("sim-timer-display").classList.remove("warning");

  const btnFinalizar = document.getElementById("btn-finalizar-resposta");
  btnFinalizar.disabled = true;
  btnFinalizar.innerHTML = "<span>⏳</span> Processando sustentação oral...";

  // Se estiver na fase de resposta principal
  if (state.stage === "speaking") {
    try {
      // 1. Envia transcrição da resposta principal
      await fetch("/api/simulado/submeter_resposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: state.session,
          questao_index: state.currentQuestionIndex,
          transcricao: state.currentTranscript.trim() || "(A candidata optou por não emitir som ou microfone inaudível)"
        })
      });

      // 2. Banca analisa necessidade de repergunta
      btnFinalizar.innerHTML = "<span>⚖️</span> Banca avaliando repergunta...";
      const formData = new FormData();
      formData.append("session_id", state.session);
      formData.append("questao_index", state.currentQuestionIndex);

      const resRepergunta = await fetch("/api/simulado/verificar_repergunta", {
        method: "POST",
        body: formData
      });
      const dataRepergunta = await resRepergunta.json();

      if (dataRepergunta.deve_reperguntar && dataRepergunta.repergunta) {
        // Exibe Repergunta
        iniciarFaseRepergunta(dataRepergunta.repergunta);
        btnFinalizar.disabled = false;
      } else {
        // Sem repergunta, avança para a próxima
        avancarParaProximaQuestao();
      }
    } catch (err) {
      console.error("Erro ao processar resposta:", err);
      avancarParaProximaQuestao();
    }
  } 
  // Se estiver na fase de resposta à repergunta
  else if (state.stage === "repergunta_speaking") {
    try {
      await fetch("/api/simulado/submeter_repergunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: state.session,
          questao_index: state.currentQuestionIndex,
          transcricao_repergunta: state.reperguntaTranscript.trim() || "(Resposta da repergunta sucinta)"
        })
      });

      avancarParaProximaQuestao();
    } catch (err) {
      console.error("Erro ao enviar repergunta:", err);
      avancarParaProximaQuestao();
    }
  }
}

// FASE 3: REPERGUNTA DA BANCA
function iniciarFaseRepergunta(textoRepergunta) {
  state.stage = "repergunta_speaking";

  // Exibe container de Repergunta
  const repBox = document.getElementById("repergunta-container");
  repBox.style.display = "block";
  document.getElementById("sim-repergunta-texto").innerText = textoRepergunta;

  // Badge
  const badge = document.getElementById("sim-stage-badge");
  badge.className = "sim-stage-badge stage-repergunta";
  document.getElementById("sim-stage-icon").innerText = "❓";
  document.getElementById("sim-stage-text").innerText = "Repergunta da Banca";

  // Fala da repergunta pelo examinador
  falarTexto(textoRepergunta, () => {
    // Ao término da fala do examinador, inicia gravação da resposta da candidata
    iniciarMicrofoneVisualizador();
  });

  // Botão
  const btnFinalizar = document.getElementById("btn-finalizar-resposta");
  btnFinalizar.disabled = false;
  btnFinalizar.innerHTML = "<span>✅</span> FINALIZAR RESPOSTA DA REPERGUNTA";

  // Timer para resposta de repergunta (1m30s padrão)
  state.timeRemaining = 90;
  state.totalTimeStage = 90;
  document.getElementById("sim-timer-label").innerText = "TEMPO PARA RESPOSTA DA REPERGUNTA";
  atualizarDisplayTimer();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    atualizarDisplayTimer();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      tocarSinalSonoro();
      finalizarRespostaOral();
    }
  }, 1000);
}

// AVANÇAR PARA PRÓXIMA OU FINALIZAR
async function avancarParaProximaQuestao() {
  try {
    const res = await fetch(`/api/simulado/${state.session}/avancar`, { method: "POST" });
    const data = await res.json();

    const btnFinalizar = document.getElementById("btn-finalizar-resposta");
    btnFinalizar.disabled = false;

    if (data.concluido) {
      finalizarSimuladoCompleto();
    } else {
      carregarQuestaoDaSessao();
    }
  } catch (err) {
    console.error("Erro ao avançar questão:", err);
  }
}

// FINALIZAR SIMULADO E GERAR RELATÓRIO PROGRUPO
async function finalizarSimuladoCompleto() {
  pararMicrofoneVisualizador();
  clearInterval(state.timerInterval);

  // Exibe tela de carregamento do relatório
  switchView("report-view");
  document.getElementById("rep-feedback-banca").innerHTML = "<p>Aguarde enquanto a banca examinadora consolida as notas de todas as disciplinas, pontua cada critério objetivo e elabora o parecer oficial...</p>";

  try {
    const res = await fetch(`/api/simulado/${state.session}/finalizar`, { method: "POST" });
    const relatorio = await res.json();
    renderizarRelatorioProGrupo(relatorio);
  } catch (err) {
    console.error("Erro ao gerar relatório final:", err);
    alert("Erro ao consolidar relatório. Tente recarregar pelo Histórico.");
  }
}

// RENDERIZAÇÃO DO RELATÓRIO OFICIAL PROGRUPO (EXATAMENTE COMO NO PDF)
function renderizarRelatorioProGrupo(rel) {
  // Metadados
  document.getElementById("rep-disciplinas-titulo").innerText = rel.disciplinas_titulo || "Disciplinas da Arguição";
  document.getElementById("rep-aluno").innerText = rel.aluno || "Viviane Lima";
  document.getElementById("rep-data").innerText = rel.data || new Date().toLocaleString("pt-BR");
  document.getElementById("rep-duracao").innerText = rel.duracao || "16:00";
  document.getElementById("rep-perguntas-count").innerText = rel.perguntas_avaliadas || "4 de 4 avaliadas";

  // Score
  document.getElementById("rep-media-geral").innerHTML = `${rel.media_disciplinas.toFixed(1)} <span>/ 100</span>`;
  document.getElementById("rep-percentual-badge").innerText = `${rel.percentual}%`;

  // Status Pill
  const statusBanner = document.getElementById("rep-status-banner");
  statusBanner.innerText = rel.status;
  if (rel.status_tipo === "aprovado") {
    statusBanner.className = "status-alert-pill status-aprovado";
  } else {
    statusBanner.className = "status-alert-pill status-eliminado";
  }

  // Tabela de Disciplinas
  const tbody = document.getElementById("rep-tabela-disciplinas");
  tbody.innerHTML = "";
  rel.notas_disciplinas.forEach(nd => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nd.disciplina}</td>
      <td style="text-align: right;">${nd.nota.toFixed(1)} / 100</td>
    `;
    tbody.appendChild(tr);
  });

  // Feedback da Banca
  const feedbackContainer = document.getElementById("rep-feedback-banca");
  feedbackContainer.innerHTML = "";
  const paragrafos = rel.feedback_banca.split("\n\n");
  paragrafos.forEach(p => {
    if (p.trim()) {
      const pElem = document.createElement("p");
      pElem.innerText = p.trim();
      feedbackContainer.appendChild(pElem);
    }
  });

  // Desempenho Pergunta por Pergunta
  const questoesContainer = document.getElementById("rep-questoes-container");
  questoesContainer.innerHTML = "";

  rel.questoes_detalhadas.forEach(q => {
    const card = document.createElement("div");
    card.className = "question-report-card";

    // Critérios
    let criteriosHtml = "";
    q.criterios.forEach(c => {
      criteriosHtml += `
        <div class="criteria-item">
          <div class="criteria-header">
            <div class="criteria-desc">${c.descricao}</div>
            <div class="criteria-score-badge">${c.nota_obtida.toFixed(1)} / ${c.nota_maxima.toFixed(1)}</div>
          </div>
          <div class="criteria-justification-box">
            ${c.justificativa}
          </div>
        </div>
      `;
    });

    // Pontos Esperados
    let pontosHtml = "";
    (q.pontos_esperados || []).forEach(pt => {
      pontosHtml += `<li>${pt}</li>`;
    });

    // Base Legal
    let legalHtml = "";
    (q.base_legal || []).forEach(bl => {
      legalHtml += `<li>${bl}</li>`;
    });

    card.innerHTML = `
      <div class="q-report-header">
        <div class="q-report-tag">
          PERGUNTA ${q.numero} • ${q.disciplina.toUpperCase()} • ${q.topico.toUpperCase()}
        </div>
        <div class="q-report-score">
          Nota: ${q.nota.toFixed(1)} / 100
        </div>
      </div>

      <div class="q-report-enunciado">
        ${q.enunciado}
      </div>

      <div class="q-section-title">RESPOSTA DO CANDIDATO</div>
      <div class="q-candidata-answer">
        ${q.resposta_candidata}
      </div>

      ${q.repergunta ? `
        <div class="q-section-title" style="color: #6b21a8; margin-top: 1.25rem;">REPERGUNTA</div>
        <div style="font-weight: 700; color: #1e1b4b; margin-bottom: 0.5rem; font-size: 1.05rem;">
          ${q.repergunta}
        </div>
        <div class="q-section-title">RESPOSTA</div>
        <div class="q-candidata-answer">
          ${q.resposta_repergunta || "(Sem manifestação)"}
        </div>
      ` : ""}

      <div class="q-section-title" style="margin-top: 1.75rem;">CRITÉRIOS DE CORREÇÃO</div>
      <div class="criteria-list">
        ${criteriosHtml}
      </div>

      <div class="q-section-title">COMENTÁRIO DO EXAMINADOR</div>
      <div class="examiner-comment-box">
        ${q.comentario_examinador}
      </div>

      <div class="q-section-title">PONTOS ESPERADOS</div>
      <ul class="expected-points-list">
        ${pontosHtml}
      </ul>

      <div class="q-section-title">BASE LEGAL</div>
      <ul class="legal-base-list">
        ${legalHtml}
      </ul>

      <div class="q-section-title">RESPOSTA ESPERADA</div>
      <div class="expected-answer-text">
        ${q.resposta_esperada}
      </div>
    `;

    questoesContainer.appendChild(card);
  });
}

// ==========================================
// BANCO DE QUESTÕES & EXPLORADOR
// ==========================================
let timerDebounce = null;
function debounceBusca() {
  clearTimeout(timerDebounce);
  timerDebounce = setTimeout(carregarBancoQuestoes, 350);
}

async function carregarBancoQuestoes() {
  const disc = document.getElementById("bank-filtro-disc")?.value || "";
  const busca = document.getElementById("bank-busca-texto")?.value || "";

  const container = document.getElementById("bank-questoes-lista");
  const stats = document.getElementById("bank-stats-label");
  if (!container) return;

  stats.innerText = "Consultando questões do material de revisão...";

  try {
    const url = `/api/banco_questoes?disciplina=${encodeURIComponent(disc)}&busca=${encodeURIComponent(busca)}&limite=40`;
    const res = await fetch(url);
    const data = await res.json();

    stats.innerText = `Exibindo ${data.resultados.length} de ${data.total_encontrado} questões encontradas no material da PGE-AL:`;
    container.innerHTML = "";

    data.resultados.forEach(item => {
      const div = document.createElement("div");
      div.className = "question-box";
      div.style.marginBottom = "1rem";
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">
            ${item.disciplina} • ${item.topico}
          </span>
          <span class="disc-badge">${item.tipo === "oficial_progrupo" ? "Padrão Oficial" : "Revisão Final"}</span>
        </div>
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; font-size: 1rem;">
          ${item.pergunta}
        </div>
        <div style="font-size: 0.9rem; color: #475569; background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
          <strong>Gabarito / Doutrina:</strong> ${item.resposta}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao buscar banco:", err);
  }
}

// ==========================================
// HISTÓRICO DE SIMULADOS
// ==========================================
async function carregarHistorico() {
  const container = document.getElementById("history-lista-container");
  if (!container) return;

  container.innerHTML = "<p>Carregando relatórios anteriores...</p>";

  try {
    const res = await fetch("/api/simulado/historico");
    const lista = await res.json();

    if (lista.length === 0) {
      container.innerHTML = "<p style='color: var(--text-muted);'>Nenhum simulado registrado até o momento. Inicie seu primeiro treino!</p>";
      return;
    }

    let html = `
      <table class="disciplines-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Disciplinas</th>
            <th>Duração</th>
            <th>Média Geral</th>
            <th>Resultado</th>
            <th style="text-align: right;">Ação</th>
          </tr>
        </thead>
        <tbody>
    `;

    lista.forEach(h => {
      const badgeClass = h.status_tipo === "aprovado" ? "status-aprovado" : "status-eliminado";
      html += `
        <tr>
          <td><strong>${h.data}</strong></td>
          <td>${h.disciplinas_titulo}</td>
          <td>${h.duracao}</td>
          <td><strong style="color: var(--primary); font-size: 1.1rem;">${h.media_disciplinas.toFixed(1)}</strong> / 100</td>
          <td><span class="${badgeClass}" style="padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem;">${h.status_tipo === "aprovado" ? "Aprovado" : "Eliminado"}</span></td>
          <td style="text-align: right;">
            <button class="btn-secondary-sm" onclick="abrirRelatorioPorId('${h.id}')">Ver Relatório ProGrupo</button>
          </td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
  }
}

async function abrirRelatorioPorId(id) {
  try {
    const res = await fetch(`/api/simulado/relatorio/${id}`);
    const rel = await res.json();
    switchView("report-view");
    renderizarRelatorioProGrupo(rel);
  } catch (err) {
    alert("Falha ao abrir relatório.");
  }
}

// ==========================================
// MODAIS (CONFIGURAÇÃO, DÚVIDA, TESTE DE MIC)
// ==========================================
function abrirModalConfig() {
  document.getElementById("modal-config").classList.add("active");
}
function fecharModalConfig() {
  document.getElementById("modal-config").classList.remove("active");
}
async function salvarConfiguracoes() {
  const candidata = document.getElementById("cfg-candidata").value.trim();
  const apiKey = document.getElementById("cfg-gemini-key").value.trim();
  const autoSpeak = document.getElementById("cfg-auto-speak").checked;
  const voiceSpeed = parseFloat(document.getElementById("cfg-voice-speed").value);

  const payload = {
    candidate_name: candidata || "Viviane Lima",
    auto_speak_examiner: autoSpeak,
    examiner_voice_speed: voiceSpeed
  };
  if (apiKey) payload.gemini_api_key = apiKey;

  try {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    state.config.candidate_name = payload.candidate_name;
    state.config.auto_speak_examiner = autoSpeak;
    state.config.examiner_voice_speed = voiceSpeed;
    document.getElementById("setup-candidata").value = payload.candidate_name;
    fecharModalConfig();
    alert("Configurações atualizadas!");
  } catch (err) {
    alert("Erro ao salvar configurações.");
  }
}

// Modal Dúvida
function abrirModalDuvidaBanca() {
  document.getElementById("duvida-texto-input").value = "";
  document.getElementById("duvida-resposta-box").style.display = "none";
  document.getElementById("modal-duvida").classList.add("active");
}
function fecharModalDuvida() {
  document.getElementById("modal-duvida").classList.remove("active");
}
async function enviarDuvidaBanca() {
  const pergunta = document.getElementById("duvida-texto-input").value.trim();
  if (!pergunta) return;

  const btn = document.getElementById("btn-enviar-duvida");
  btn.disabled = true;
  btn.innerText = "Consultando banca...";

  try {
    const res = await fetch("/api/simulado/pergunta_candidata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: state.session,
        pergunta: pergunta
      })
    });
    const data = await res.json();
    document.getElementById("duvida-resposta-box").style.display = "block";
    document.getElementById("duvida-resposta-texto").innerText = data.resposta_banca;
    falarTexto(data.resposta_banca);
  } catch (err) {
    console.error("Erro ao perguntar à banca:", err);
  } finally {
    btn.disabled = false;
    btn.innerText = "Perguntar";
  }
}

// Modal Teste de Microfone
function abrirModalTesteMic() {
  document.getElementById("modal-test-mic").classList.add("active");
}
function fecharModalTesteMic() {
  pararTesteMicrofone();
  document.getElementById("modal-test-mic").classList.remove("active");
}

function testarVozExaminador() {
  falarTexto("Candidata Viviane Lima, a banca examinadora da Procuradoria Geral do Estado de Alagoas está pronta para iniciar a arguição oral.");
}

async function toggleTesteMicrofone() {
  if (state.testMicRecording) {
    pararTesteMicrofone();
  } else {
    iniciarTesteMicrofone();
  }
}

async function iniciarTesteMicrofone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.testMicRecording = true;
    document.getElementById("btn-toggle-test-mic").innerText = "Parar Teste";
    document.getElementById("test-mic-status").innerText = "🎤 Microfone captando som...";
    document.getElementById("test-mic-status").style.color = "#16a34a";

    // Visualizador no canvas do modal
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.testMicContext = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const canvas = document.getElementById("test-mic-waveform");
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawTest() {
      if (!state.testMicRecording) return;
      requestAnimationFrame(drawTest);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#16a34a";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    drawTest();

    // Transcrição de teste
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      state.testMicRecognition = new SpeechRecognition();
      state.testMicRecognition.continuous = true;
      state.testMicRecognition.interimResults = true;
      state.testMicRecognition.lang = "pt-BR";
      state.testMicRecognition.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; ++i) txt += e.results[i][0].transcript + " ";
        document.getElementById("test-mic-transcript").innerText = txt.trim() || "(Fale para testar a transcrição...)";
      };
      state.testMicRecognition.start();
    }
  } catch (err) {
    alert("Não foi possível acessar o microfone para teste.");
  }
}

function pararTesteMicrofone() {
  state.testMicRecording = false;
  document.getElementById("btn-toggle-test-mic").innerText = "Iniciar Teste";
  document.getElementById("test-mic-status").innerText = "Teste finalizado.";
  document.getElementById("test-mic-status").style.color = "var(--text-muted)";

  if (state.testMicContext) {
    try { state.testMicContext.close(); } catch (e) {}
  }
  if (state.testMicRecognition) {
    try { state.testMicRecognition.stop(); } catch (e) {}
  }
}
