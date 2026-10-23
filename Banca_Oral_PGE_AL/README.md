# Simulador de Banca Examinadora de Prova Oral — PGE-AL (Procuradoria Geral do Estado de Alagoas)

Aplicação desenvolvida sob medida para a preparação intensiva de **Viviane Lima** para a Prova Oral de Procurador do Estado de Alagoas.

---

## 🎯 Metodologia e Dinâmica da Banca Oral

A aplicação replica com fidelidade o processo de arguição oral das principais bancas de advocacia pública (CESPE / Cebraspe / FCC / ProGrupo):

1. **Apresentação e Leitura da Questão**: A banca apresenta um texto ou caso hipotético na tela. A candidata conta com tempo de leitura estipulado (ex: 2 minutos configuráveis) e opção de ouvir a leitura solene pelo examinador em voz alta.
2. **Sustentação Oral & Captação Contínua**: Ao iniciar a fala, o microfone é acionado com visualizador dinâmico de ondas sonoras (waveform) e transcrição ao vivo. O sistema suporta gravações longas (5 minutos ou mais contínuos), com cronômetro regressivo e alerta sonoro/visual.
3. **Botão de Envio Garantido**: Botão verde destacado `FINALIZAR RESPOSTA E ENVIAR ÁUDIO` para a candidata encerrar a qualquer momento com total segurança de envio.
4. **Repergunta da Banca**: O sistema analisa a resposta frente aos pontos esperados da questão. Se houver omissão de requisitos cumulativos, jurisprudência relevante ou ambiguidade, a banca gera uma **repergunta verbal (áudio do examinador + texto)** para a candidata responder.
5. **Interação com a Banca**: A candidata pode solicitar esclarecimentos ou pedir repetição de trechos do enunciado caso necessite.
6. **Relatório Oficial ProGrupo**: Ao término, a aplicação gera o relatório detalhado idêntico ao modelo da ProGrupo anexado:
   - Média das disciplinas (0 a 100) e percentual.
   - Status oficial: `Aprovado — média igual ou superior a 60` ou `Eliminado — média abaixo de 60`.
   - Tabela de notas por matéria.
   - Parecer geral da banca examinadora (postura, serenidade, síntese, vocabulário e matérias).
   - Desempenho detalhado pergunta por pergunta com critérios fracionados (`1.5 / 2.0`), `Articulação do raciocínio (1.1)`, `Capacidade de argumentação (1.1)`, `Uso correto do vernáculo (0.8)`, parecer do examinador, pontos esperados, base legal e resposta modelo completa.
   - Botão para **Imprimir ou Salvar em PDF** formatado perfeitamente para folha A4.

---

## 📚 Disciplinas e Material de Revisão Integrado

O simulador indexou **3.963 questões e tópicos de prova oral** extraídos diretamente dos 6 arquivos de revisão da candidata:

- **Direito Administrativo** (Licitações Lei 14.133/21, Contratos, Improbidade Lei 14.230/21, Intervenção do Estado, Serviços Públicos)
- **Direito Constitucional** (Controle de Constitucionalidade, Repartição de Competências, Direitos Fundamentais, Ordem Econômica e Fazenda Pública)
- **Direito Processual Civil** (Fazenda Pública em Juízo, Prerrogativas, Execução contra a Fazenda, Precatórios, Tema 1.076 STJ)
- **Direito Tributário** (Denúncia Espontânea e Súmula 360 STJ, Cautelar Fiscal, Prescrição Intercorrente, Relação Fisco-Contribuinte)
- **Direito Financeiro** (Princípio da Anualidade, Restos a Pagar, LRF, Despesas e Receitas Públicas, Precatórios)
- **Direito Civil** (Responsabilidade Civil do Estado por Ato Lícito / Estado de Necessidade, Bens Públicos, Contratos)

---

## 🚀 Como Iniciar a Aplicação

### Modo 1: Pelo Atalho (Windows)
Dê um duplo clique no arquivo:
`C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Banca_Oral_PGE_AL\iniciar_simulador.bat`

O navegador abrirá automaticamente em `http://127.0.0.1:8000`.

### Modo 2: Via Terminal (PowerShell)
```powershell
cd C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Banca_Oral_PGE_AL
python app.py
```

---

## ⚙️ Configurações Opcionais
- **Modo Offline**: O simulador funciona 100% de forma autônoma sem requerer chave de API.
- **Modo IA Google Gemini**: Você pode adicionar sua `GEMINI_API_KEY` na tela de configurações (`⚙️ Configurações`) para avaliações dinâmicas e transcrição multimodal ultra-precisa com os modelos Gemini 2.5 Flash.
