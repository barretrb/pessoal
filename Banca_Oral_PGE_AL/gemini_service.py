"""
Módulo Unificado de Inteligência Artificial para a Banca Oral PGE-AL.
Suporta Groq (openai/gpt-oss-120b e whisper-large-v3-turbo) e Google Gemini,
com fallback heurístico offline estruturado.
"""

import json
import os
import re
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

from typing import Dict, Any, List, Optional
import requests

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
        "groq_api_key": "",
        "gemini_api_key": "",
        "model_name": "openai/gpt-oss-120b",
        "audio_model": "whisper-large-v3-turbo",
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

class UnifiedBancaAIService:
    def __init__(self):
        self.config = load_config()
        self._init_providers()

    def _init_providers(self):
        self.groq_key = self.config.get("groq_api_key") or os.environ.get("GROQ_API_KEY", "")
        self.gemini_key = self.config.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY", "")
        self.has_groq = bool(self.groq_key)
        self.has_gemini = False

        if self.gemini_key and genai:
            try:
                genai.configure(api_key=self.gemini_key)
                self.has_gemini = True
            except Exception:
                self.has_gemini = False

        self.has_ai = self.has_groq or self.has_gemini
        provider_name = "Groq (openai/gpt-oss-120b)" if self.has_groq else ("Gemini" if self.has_gemini else "Modo Heurístico Offline")
        print(f"[BANCA AI] Provedor ativo: {provider_name}")

    def reload_config(self):
        self.config = load_config()
        self._init_providers()

    def _call_llm(self, prompt: str, system_prompt: str = "Você é a Banca Examinadora da Prova Oral da PGE-AL.", json_mode: bool = False) -> Optional[str]:
        """Chama Groq prioritariamente (ou Gemini como fallback)"""
        # 1. Tenta Groq
        if self.has_groq:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                }
                model_name = self.config.get("model_name", "openai/gpt-oss-120b")
                payload: Dict[str, Any] = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
                if json_mode:
                    payload["response_format"] = {"type": "json_object"}

                resp = requests.post(url, headers=headers, json=payload, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    print(f"[GROQ ERROR] Status {resp.status_code}: {resp.text}")
            except Exception as e:
                print(f"[GROQ CALL FAILED] {e}")

        # 2. Tenta Gemini
        if self.has_gemini and genai:
            try:
                model = genai.GenerativeModel(self.config.get("gemini_model_name", "gemini-2.5-flash"))
                full_prompt = f"{system_prompt}\n\n{prompt}"
                res = model.generate_content(full_prompt)
                return res.text.strip()
            except Exception as e:
                print(f"[GEMINI CALL FAILED] {e}")

        return None

    def verificar_necessidade_repergunta(self, questao: Dict[str, Any], resposta_candidata: str) -> Dict[str, Any]:
        """
        Analisa a resposta preliminar da candidata e formula uma repergunta se houver omissão relevante.
        """
        if not resposta_candidata or len(resposta_candidata.strip()) < 10:
            reperguntas = questao.get("reperguntas_padrao", [])
            pergunta_padrao = reperguntas[0]["pergunta"] if reperguntas else "Candidata, poderia fundamentar juridicamente sua resposta?"
            return {
                "deve_reperguntar": True,
                "repergunta": pergunta_padrao,
                "motivo": "Resposta excessivamente sucinta ou sem enfrentamento de mérito."
            }

        prompt = f"""
Avalie a resposta preliminar da candidata da PGE-AL abaixo:

QUESTÃO:
Disciplina: {questao.get('disciplina')}
Tema: {questao.get('topico')}
Enunciado: {questao.get('enunciado')}

PONTOS ESPERADOS:
{json.dumps(questao.get('pontos_esperados', []), ensure_ascii=False)}

RESPOSTA ESPERADA:
{questao.get('resposta_esperada')}

RESPOSTA TRANSCRITA DA CANDIDATA:
"{resposta_candidata}"

INSTRUÇÕES:
Verifique se a candidata omitiu algum ponto crucial ou se cabe uma repergunta técnica para aprofundar a resposta oral.
Retorne um JSON estrito no formato:
{{
  "deve_reperguntar": true,
  "repergunta": "Candidata, ...?",
  "motivo": "Justificativa..."
}}
"""
        raw = self._call_llm(prompt, json_mode=True)
        if raw:
            try:
                match = re.search(r'\{.*\}', raw, re.DOTALL)
                if match:
                    return json.loads(match.group())
            except Exception:
                pass

        # Fallback para reperguntas cadastradas na questão
        reperguntas = questao.get("reperguntas_padrao", [])
        if reperguntas:
            return {
                "deve_reperguntar": True,
                "repergunta": reperguntas[0]["pergunta"],
                "motivo": "Aprofundamento dogmático sobre ponto controvertido essencial ao espelho."
            }

        return {
            "deve_reperguntar": False,
            "repergunta": "",
            "motivo": "A candidata enfrentou os tópicos centrais com amplitude satisfatória."
        }

    def responder_duvida_candidata(self, questao: Dict[str, Any], pergunta_candidata: str) -> str:
        """Responde à indagação ou pedido de esclarecimento da candidata à banca"""
        prompt = f"""
A candidata acabou de formular uma solicitação/dúvida à banca examinadora:
"{pergunta_candidata}"

QUESTÃO EM ARGUIÇÃO:
{questao.get('enunciado')}

Responda de forma solene, estritamente institucional e objetiva, mantendo a postura de examinador de concurso público.
"""
        resposta = self._call_llm(prompt)
        if resposta:
            return resposta.strip()

        return f"Pois não, candidata. Reitero o comando da questão: {questao.get('enunciado_fala', questao.get('enunciado'))}"

    def avaliar_simulado_completo(self, dados_simulado: Dict[str, Any]) -> Dict[str, Any]:
        """Gera o relatório oficial nos moldes exatos da ProGrupo"""
        if self.has_ai:
            prompt = f"""
Você é a Banca Examinadora oficial da Prova Oral da PGE-AL (Procuradoria Geral do Estado de Alagoas), atuando no padrão rigoroso do relatório 'ProGrupo Cursos e Mentorias'.

Avalie o simulado da candidata: {dados_simulado.get('candidata', 'Viviane Lima')}
Duração total: {dados_simulado.get('duracao_formatada', '16:00')}

DADOS DAS QUESTÕES E RESPOSTAS:
{json.dumps(dados_simulado.get('questoes', []), ensure_ascii=False, indent=2)}

INSTRUÇÕES DE PONTUAÇÃO (PADRÃO PROGRUPO):
1. Cada questão possui critérios específicos com pontuação fracionada (ex: 1.5 / 2.0, 1.0 / 2.0) e parecer detalhado.
2. Além dos critérios de conteúdo, avalie:
   - Articulação do raciocínio (0.0 a 1.1)
   - Capacidade de argumentação (0.0 a 1.1)
   - Uso correto do vernáculo (0.0 a 0.8)
3. A nota final da questão varia de 0.0 a 100.0. Média geral >= 60.0 é 'Aprovado — média igual ou superior a 60', abaixo é 'Eliminado — média abaixo de 60'.
4. Crie um parecer geral da banca examinadora (Feedback da Banca) completo, em múltiplos parágrafos, analisando postura, serenidade, síntese, vocabulário e cada uma das matérias arguidas.

Retorne EXCLUSIVAMENTE um objeto JSON válido com a seguinte estrutura:
{{
  "media_geral": 65.0,
  "percentual": 65,
  "status": "Aprovado — média igual ou superior a 60",
  "status_tipo": "aprovado",
  "feedback_banca": "O candidato demonstrou uma postura condizente...\\n\\nNas matérias...",
  "notas_disciplinas": [
    {{"disciplina": "Direito Tributário", "nota": 65.0}}
  ],
  "questoes_detalhadas": [
    {{
      "numero": 1,
      "disciplina": "Direito Tributário",
      "topico": "EXTINÇÃO E EXCLUSÃO DO CRÉDITO TRIBUTÁRIO",
      "nota": 65.0,
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
          "justificativa": "Demonstrou organização..."
        }},
        {{
          "descricao": "Capacidade de argumentação: fundamenta as conclusões e enfrenta o ponto controvertido.",
          "nota_obtida": 0.8,
          "nota_maxima": 1.1,
          "justificativa": "Argumentou satisfatoriamente..."
        }},
        {{
          "descricao": "Uso correto do vernáculo: linguagem técnica precisa, concordância e regência corretas.",
          "nota_obtida": 0.7,
          "nota_maxima": 0.8,
          "justificativa": "Uso adequado do vernáculo..."
        }}
      ],
      "comentario_examinador": "Parecer do examinador...",
      "pontos_esperados": ["..."],
      "base_legal": ["..."],
      "resposta_esperada": "..."
    }}
  ]
}}
"""
            raw = self._call_llm(prompt, json_mode=True)
            if raw:
                try:
                    match = re.search(r'\{.*\}', raw, re.DOTALL)
                    if match:
                        return json.loads(match.group())
                except Exception as e:
                    print(f"[JSON PARSE ERROR] {e}")

        # Fallback para o avaliador heurístico
        return self._avaliar_heuristico(dados_simulado)

    def _avaliar_heuristico(self, dados_simulado: Dict[str, Any]) -> Dict[str, Any]:
        """Avaliador heurístico estruturado idêntico ao modelo ProGrupo"""
        questoes_detalhadas = []
        disciplinas_dict: Dict[str, List[float]] = {}

        for idx, q_info in enumerate(dados_simulado.get("questoes", []), 1):
            questao = q_info.get("questao", {})
            resp_candidata = q_info.get("resposta", "").strip()
            repergunta = q_info.get("repergunta", "")
            resp_repergunta = q_info.get("resposta_repergunta", "").strip()

            resp_lower = resp_candidata.lower() + " " + resp_repergunta.lower()
            palavras = resp_lower.split()
            qtd_palavras = len(palavras)

            criterios = []
            soma_obtida = 0.0
            soma_maxima = 0.0

            for crit in questao.get("criterios_correcao", []):
                peso = crit.get("peso", 2.0)
                desc_words = [w for w in re.findall(r'\b[a-zA-ZáéíóúãõçâêôÁÉÍÓÚÃÕÇÂÊÔ]{4,}\b', crit["descricao"].lower()) if w not in ("para", "sobre", "como", "com", "este", "essa", "pelo", "pela")]
                match_count = sum(1 for w in desc_words if w in resp_lower)
                proporcao = min(1.0, max(0.2, (match_count / max(1, len(desc_words) * 0.4)))) if qtd_palavras > 20 else 0.1

                nota_crit = round(peso * proporcao, 1)
                soma_obtida += nota_crit
                soma_maxima += peso

                if proporcao >= 0.8:
                    just = "Abordou com clareza e precisão técnica o ponto solicitado no comando da questão."
                elif proporcao >= 0.5:
                    just = "O candidato reconheceu os institutos principais, contudo deixou de aprofundar a fundamentação expressa."
                else:
                    just = "Omissão ou superficialidade no enfrentamento direto deste subitem exigido pela banca."

                criterios.append({
                    "descricao": crit["descricao"],
                    "nota_obtida": nota_crit,
                    "nota_maxima": peso,
                    "justificativa": just
                })

            nota_raciocinio = 0.9 if qtd_palavras > 60 else (0.6 if qtd_palavras > 25 else 0.3)
            soma_obtida += nota_raciocinio
            soma_maxima += 1.1
            criterios.append({
                "descricao": "Articulação do raciocínio: resposta organizada e na ordem do comando, com ligação lógica entre as partes.",
                "nota_obtida": nota_raciocinio,
                "nota_maxima": 1.1,
                "justificativa": "Demonstrou organização aceitável na linha de raciocínio, articulando as premissas com o desfecho."
            })

            nota_arg = 0.8 if len(resp_repergunta) > 15 else (0.5 if qtd_palavras > 50 else 0.3)
            soma_obtida += nota_arg
            soma_maxima += 1.1
            criterios.append({
                "descricao": "Capacidade de argumentação: fundamenta as conclusões e enfrenta o ponto controvertido.",
                "nota_obtida": nota_arg,
                "nota_maxima": 1.1,
                "justificativa": "Argumentou satisfatoriamente nos pontos enfrentados, aproveitando as provocações em sede de repergunta."
            })

            nota_vernaculo = 0.7 if qtd_palavras > 30 else 0.4
            soma_obtida += nota_vernaculo
            soma_maxima += 0.8
            criterios.append({
                "descricao": "Uso correto do vernáculo: linguagem técnica precisa, concordância e regência corretas, sem vícios de oralidade que comprometam a clareza.",
                "nota_obtida": nota_vernaculo,
                "nota_maxima": 0.8,
                "justificativa": "Uso adequado do vernáculo e vocabulário condizente com a sustentação oral para carreiras jurídicas de Estado."
            })

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

gemini_service = UnifiedBancaAIService()
