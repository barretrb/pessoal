"""
Módulo de Inteligência Artificial para a Banca Oral PGE-AL.
Integração com Google Gemini (multimodal, áudio e texto)
com fallback inteligente para modo offline / heurístico estruturado.
"""

import json
import os
import re
from typing import Dict, Any, List, Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

def load_config() -> Dict[str, Any]:
    default_config = {
        "candidate_name": "Viviane Lima",
        "reading_time_seconds": 120,
        "response_time_seconds": 300,
        "gemini_api_key": "",
        "model_name": "gemini-2.5-flash",
        "auto_speak_examiner": True,
        "examiner_voice_speed": 0.95
    }
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
                default_config.update(saved)
        except Exception:
            pass
    return default_config

def save_config(config_data: Dict[str, Any]) -> bool:
    try:
        current = load_config()
        current.update(config_data)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Erro ao salvar config: {e}")
        return False

class GeminiBancaService:
    def __init__(self):
        self.config = load_config()
        self._init_gemini()

    def _init_gemini(self):
        api_key = self.config.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY", "")
        if api_key and genai:
            try:
                genai.configure(api_key=api_key)
                self.has_gemini = True
            except Exception as e:
                print(f"Falha ao configurar Gemini: {e}")
                self.has_gemini = False
        else:
            self.has_gemini = False

    def reload_config(self):
        self.config = load_config()
        self._init_gemini()

    def verificar_necessidade_repergunta(self, questao: Dict[str, Any], resposta_candidata: str) -> Dict[str, Any]:
        """
        Analisa a resposta da candidata frente aos pontos esperados da questão.
        Decide se a banca examinadora deve fazer uma repergunta para aprofundar ou esclarecer.
        """
        if not resposta_candidata or len(resposta_candidata.strip()) < 10:
            reperguntas = questao.get("reperguntas_padrao", [])
            pergunta_padrao = reperguntas[0]["pergunta"] if reperguntas else "Candidata, poderia fundamentar juridicamente sua resposta?"
            return {
                "deve_reperguntar": True,
                "repergunta": pergunta_padrao,
                "motivo": "Resposta excessivamente sucinta ou ausente, necessitando provocação da banca."
            }

        # Se Gemini estiver disponível
        if self.has_gemini:
            try:
                model = genai.GenerativeModel(self.config.get("model_name", "gemini-2.5-flash"))
                prompt = f"""
Você é um membro rigoroso, porém sereno e polido, da Banca Examinadora da Prova Oral para Procurador do Estado de Alagoas (PGE-AL).
Avalie a resposta preliminar da candidata abaixo em relação aos pontos esperados e ao gabarito da questão.

QUESTÃO:
Disciplina: {questao.get('disciplina')}
Tema: {questao.get('topico')}
Enunciado: {questao.get('enunciado')}

PONTOS ESPERADOS:
{json.dumps(questao.get('pontos_esperados', []), ensure_ascii=False)}

RESPOSTA ESPERADA / ESPELHO:
{questao.get('resposta_esperada')}

RESPOSTA TRANSCRITA DA CANDIDATA:
"{resposta_candidata}"

INSTRUÇÕES PARA A BANCA:
Verifique se a candidata omitiu algum ponto crucial, se gerou alguma ambiguidade doutrinária ou se cabe um questionamento complementar de aprofundamento (repergunta), exatamente como fazem os examinadores da ProGrupo / CESPE / PGE.
Retorne EXCLUSIVAMENTE um objeto JSON no seguinte formato:
{{
  "deve_reperguntar": true/false,
  "repergunta": "Texto direto e formal da repergunta da banca (ex: 'Candidata, a propriedade privada é um direito absoluto na Constituição de 1988?') ou vazio se não houver repergunta",
  "motivo": "Breve justificativa técnica do porquê desta repergunta"
}}
"""
                response = model.generate_content(prompt)
                txt = response.text.strip()
                # Extrai JSON
                match = re.search(r'\{.*\}', txt, re.DOTALL)
                if match:
                    return json.loads(match.group())
            except Exception as e:
                print(f"Erro ao consultar Gemini para repergunta: {e}")

        # Fallback inteligente (reperguntas padrão cadastradas na questão)
        reperguntas = questao.get("reperguntas_padrao", [])
        if reperguntas:
            escolhida = reperguntas[0]
            return {
                "deve_reperguntar": True,
                "repergunta": escolhida["pergunta"],
                "motivo": "Aprofundamento dogmático sobre ponto controvertido essencial ao espelho de prova oral."
            }

        return {
            "deve_reperguntar": False,
            "repergunta": "",
            "motivo": "A candidata enfrentou os tópicos centrais com amplitude satisfatória."
        }

    def responder_duvida_candidata(self, questao: Dict[str, Any], pergunta_candidata: str) -> str:
        """
        Responde a uma indagação feita pela candidata à banca durante a arguição (ex: pedido de repetição de enunciado).
        """
        if self.has_gemini:
            try:
                model = genai.GenerativeModel(self.config.get("model_name", "gemini-2.5-flash"))
                prompt = f"""
Você é a Banca Examinadora da Prova Oral da PGE-AL.
A candidata acabou de formular uma pergunta ou solicitação à banca:
"{pergunta_candidata}"

QUESTÃO EM ARGUIÇÃO:
{questao.get('enunciado')}

Responda à candidata de forma solene, estritamente institucional e objetiva, mantendo a postura de examinador de concurso público.
"""
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Erro ao responder candidata via Gemini: {e}")

        return f"Pois não, candidata. Reitero o comando da questão: {questao.get('enunciado_fala', questao.get('enunciado'))}"

    def avaliar_simulado_completo(self, dados_simulado: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gera a avaliação completa do simulado nos moldes exatos do relatório ProGrupo:
        - Média geral (0 a 100) e status (Aprovado >= 60 / Eliminado < 60)
        - Notas por disciplina
        - Feedback geral da banca (postura, serenidade, síntese, vocabulário)
        - Desempenho detalhado pergunta por pergunta (critérios com pontuações fracionadas, raciocínio, argumentação, vernáculo, comentário, pontos esperados, base legal, resposta esperada)
        """
        questoes_avaliadas = dados_simulado.get("questoes", [])
        nome_candidata = dados_simulado.get("candidata", self.config.get("candidate_name", "Viviane Lima"))

        if self.has_gemini and questoes_avaliadas:
            try:
                return self._avaliar_com_gemini(dados_simulado)
            except Exception as e:
                print(f"Erro na avaliação via Gemini, recorrendo ao avaliador heurístico: {e}")

        return self._avaliar_heuristico(dados_simulado)

    def _avaliar_com_gemini(self, dados_simulado: Dict[str, Any]) -> Dict[str, Any]:
        model = genai.GenerativeModel(self.config.get("model_name", "gemini-2.5-flash"))
        prompt = f"""
Você é uma Banca Examinadora de alto nível da Prova Oral para Procurador do Estado de Alagoas (PGE-AL), atuando com a mesma metodologia de pontuação detalhada da 'ProGrupo Cursos e Mentorias'.

Avalie as respostas da candidata no simulado oral realizado.
CANDIDATA: {dados_simulado.get('candidata', 'Viviane Lima')}
DURAÇÃO TOTAL: {dados_simulado.get('duracao_formatada', '16:00')}

DADOS DAS QUESTÕES E RESPOSTAS:
{json.dumps(dados_simulado.get('questoes', []), ensure_ascii=False, indent=2)}

DIRETRIZES DE AVALIAÇÃO (PADRÃO PROGRUPO):
1. Cada pergunta possui critérios de mérito/conteúdo pontuados fracionadamente (ex: 1.5/2.0, 1.0/2.0), além de:
   - Articulação do raciocínio (escala 0.0 a 1.1)
   - Capacidade de argumentação (escala 0.0 a 1.1)
   - Uso correto do vernáculo (escala 0.0 a 0.8)
   A soma dos pesos de cada pergunta resulta em sua nota normalizada de 0.0 a 100.0.
2. Seja justa e precisa: avalie se a candidata acertou os conceitos jurídicos, a fundamentação constitucional e legal, e a jurisprudência do STF/STJ. Considere também as respostas dadas na fase de repergunta.
3. Elabore um Feedback da Banca geral com tom profissional e construtivo, analisando postura, serenidade, capacidade de síntese e vocabulário, além de análise por disciplina e recomendações para as próximas arguições.

Retorne EXCLUSIVAMENTE um objeto JSON estritamente válido com a seguinte estrutura:
{{
  "media_geral": 64.5,
  "percentual": 65,
  "status": "Aprovado — média igual ou superior a 60",
  "status_tipo": "aprovado",
  "feedback_banca": "Texto amplo em múltiplos parágrafos analisando postura, serenidade, síntese, vocabulário e matérias arguidas, conforme padrão ProGrupo.",
  "notas_disciplinas": [
    {{"disciplina": "Direito Constitucional", "nota": 64.0}},
    {{"disciplina": "Direito Tributário", "nota": 50.0}}
  ],
  "questoes_detalhadas": [
    {{
      "numero": 1,
      "disciplina": "Direito Constitucional",
      "topico": "17. ORDEM ECONÔMICA E FINANCEIRA",
      "nota": 64.0,
      "enunciado": "...",
      "resposta_candidata": "...",
      "repergunta": "...",
      "resposta_repergunta": "...",
      "criterios": [
        {{
          "descricao": "Texto do critério...",
          "nota_obtida": 1.5,
          "nota_maxima": 2.0,
          "justificativa": "O candidato reconheceu que..."
        }},
        {{
          "descricao": "Articulação do raciocínio: resposta organizada e na ordem do comando, com ligação lógica entre as partes.",
          "nota_obtida": 0.9,
          "nota_maxima": 1.1,
          "justificativa": "Demonstrou organização aceitável..."
        }},
        {{
          "descricao": "Capacidade de argumentação: fundamenta as conclusões e enfrenta o ponto controvertido.",
          "nota_obtida": 0.8,
          "nota_maxima": 1.1,
          "justificativa": "Argumentou de forma satisfatória..."
        }},
        {{
          "descricao": "Uso correto do vernáculo: linguagem técnica precisa, concordância e regência corretas, sem vícios de oralidade.",
          "nota_obtida": 0.7,
          "nota_maxima": 0.8,
          "justificativa": "Uso adequado do vernáculo..."
        }}
      ],
      "comentario_examinador": "Parecer do examinador sobre o desempenho neste ponto...",
      "pontos_esperados": ["..."],
      "base_legal": ["..."],
      "resposta_esperada": "..."
    }}
  ]
}}
"""
        response = model.generate_content(prompt)
        txt = response.text.strip()
        match = re.search(r'\{.*\}', txt, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Não foi possível decodificar JSON da resposta do Gemini")

    def _avaliar_heuristico(self, dados_simulado: Dict[str, Any]) -> Dict[str, Any]:
        """Avaliador heurístico estruturado idêntico ao modelo ProGrupo"""
        questoes_detalhadas = []
        disciplinas_dict: Dict[str, List[float]] = {}

        for idx, q_info in enumerate(dados_simulado.get("questoes", []), 1):
            questao = q_info.get("questao", {})
            resp_candidata = q_info.get("resposta", "").strip()
            repergunta = q_info.get("repergunta", "")
            resp_repergunta = q_info.get("resposta_repergunta", "").strip()
            
            # Análise de densidade e vocabulário
            resp_lower = resp_candidata.lower() + " " + resp_repergunta.lower()
            palavras = resp_lower.split()
            qtd_palavras = len(palavras)
            
            # Cálculo de critérios
            criterios = []
            soma_obtida = 0.0
            soma_maxima = 0.0
            
            # Critérios de conteúdo da questão
            for crit in questao.get("criterios_correcao", []):
                peso = crit.get("peso", 2.0)
                # Verifica menção a palavras-chave
                desc_words = [w for w in re.findall(r'\b[a-zA-ZáéíóúãõçâêôÁÉÍÓÚÃÕÇÂÊÔ]{4,}\b', crit["descricao"].lower()) if w not in ("para", "sobre", "como", "com", "este", "essa", "pelo", "pela")]
                match_count = sum(1 for w in desc_words if w in resp_lower)
                proporcao = min(1.0, max(0.2, (match_count / max(1, len(desc_words) * 0.4)))) if qtd_palavras > 20 else 0.1
                
                nota_crit = round(peso * proporcao, 1)
                soma_obtida += nota_crit
                soma_maxima += peso
                
                if proporcao >= 0.8:
                    just = f"Abordou com clareza e precisão técnica o ponto solicitado no comando da questão."
                elif proporcao >= 0.5:
                    just = f"O candidato reconheceu os institutos principais, contudo deixou de aprofundar a fundamentação expressa."
                else:
                    just = f"Omissão ou superficialidade no enfrentamento direto deste subitem exigido pela banca."
                    
                criterios.append({
                    "descricao": crit["descricao"],
                    "nota_obtida": nota_crit,
                    "nota_maxima": peso,
                    "justificativa": just
                })

            # Critérios formais padrão ProGrupo
            # 1. Articulação do raciocínio (1.1)
            nota_raciocinio = 0.9 if qtd_palavras > 60 else (0.6 if qtd_palavras > 25 else 0.3)
            soma_obtida += nota_raciocinio
            soma_maxima += 1.1
            criterios.append({
                "descricao": "Articulação do raciocínio: resposta organizada e na ordem do comando, com ligação lógica entre as partes.",
                "nota_obtida": nota_raciocinio,
                "nota_maxima": 1.1,
                "justificativa": "Demonstrou organização aceitável na linha de raciocínio, articulando as premissas com o desfecho."
            })

            # 2. Capacidade de argumentação (1.1)
            nota_arg = 0.8 if len(resp_repergunta) > 15 else (0.5 if qtd_palavras > 50 else 0.3)
            soma_obtida += nota_arg
            soma_maxima += 1.1
            criterios.append({
                "descricao": "Capacidade de argumentação: fundamenta as conclusões e enfrenta o ponto controvertido.",
                "nota_obtida": nota_arg,
                "nota_maxima": 1.1,
                "justificativa": "Argumentou satisfatoriamente nos pontos enfrentados, aproveitando as provocações em sede de repergunta."
            })

            # 3. Uso correto do vernáculo (0.8)
            nota_vernaculo = 0.7 if qtd_palavras > 30 else 0.4
            soma_obtida += nota_vernaculo
            soma_maxima += 0.8
            criterios.append({
                "descricao": "Uso correto do vernáculo: linguagem técnica precisa, concordância e regência corretas, sem vícios de oralidade que comprometam a clareza.",
                "nota_obtida": nota_vernaculo,
                "nota_maxima": 0.8,
                "justificativa": "Uso adequado do vernáculo e vocabulário condizente com a sustentação oral para carreiras jurídicas de Estado."
            })

            # Nota normalizada da questão (0 a 100)
            nota_questao = round((soma_obtida / max(0.1, soma_maxima)) * 100, 1)
            disc = questao.get("disciplina", "Geral")
            disciplinas_dict.setdefault(disc, []).append(nota_questao)

            questoes_detalhadas.append({
                "numero": idx,
                "disciplina": disc,
                "topico": questao.get("topico", "PONTOS DA PROVA ORAL"),
                "nota": nota_questao,
                "enunciado": questao.get("enunciado", ""),
                "resposta_candidata": resp_candidata or "(Resposta não registrada ou silenciosa)",
                "repergunta": repergunta,
                "resposta_repergunta": resp_repergunta,
                "criterios": criterios,
                "comentario_examinador": (
                    f"A candidata revelou postura adequada e segurança ao enfrentar a matéria. "
                    f"Recomenda-se maior rigor na citação dos dispositivos normativos e precedentes dos Tribunais Superiores, "
                    f"assegurando o esgotamento metódico de todos os subitens formulados no enunciado."
                ),
                "pontos_esperados": questao.get("pontos_esperados", []),
                "base_legal": questao.get("base_legal", []),
                "resposta_esperada": questao.get("resposta_esperada", "")
            })

        # Média das disciplinas
        notas_disciplinas = []
        todas_notas = []
        for disc, lista_notas in disciplinas_dict.items():
            media_disc = round(sum(lista_notas) / len(lista_notas), 1)
            notas_disciplinas.append({"disciplina": disc, "nota": media_disc})
            todas_notas.extend(lista_notas)

        media_geral = round(sum(todas_notas) / max(1, len(todas_notas)), 1)
        percentual = int(round(media_geral))
        aprovado = media_geral >= 60.0
        status_texto = "Aprovado — média igual ou superior a 60" if aprovado else "Eliminado — média abaixo de 60"
        status_tipo = "aprovado" if aprovado else "eliminado"

        feedback_geral = (
            f"O candidato demonstrou uma postura condizente com a prova oral, mantendo a serenidade "
            f"e aproveitando os questionamentos feitos nas reperguntas pela banca examinadora. "
            f"Revelou capacidade de síntese e vocabulário jurídico adequado ao nível exigido para Procurador do Estado.\n\n"
            f"Nas matérias de pontuação mais destacada, evidenciou segurança doutrinária e concatenamento dos pressupostos legais. "
            f"Todavia, deve atentar para o esgotamento rigoroso de todos os comandos da questão, evitando a omissão "
            f"de requisitos cumulativos ou artigos expressos da ordem constitucional e infraconstitucional.\n\n"
            f"Para as próximas arguições, recomenda-se organizar mentalmente uma estrutura de tópicos antes de iniciar a resposta, "
            f"assegurando que nenhum subitem do questionamento do examinador fique sem enfrentamento direto."
        )

        return {
            "media_geral": media_geral,
            "percentual": percentual,
            "status": status_texto,
            "status_tipo": status_tipo,
            "feedback_banca": feedback_geral,
            "notas_disciplinas": notas_disciplinas,
            "questoes_detalhadas": questoes_detalhadas
        }

gemini_service = GeminiBancaService()
