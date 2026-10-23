"""
Servidor FastAPI da Aplicação Simulador de Banca Examinadora - Prova Oral PGE-AL
"""

import os
import time
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from banco_questoes import banco
from gemini_service import gemini_service, load_config, save_config

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
HISTORICO_PATH = os.path.join(BASE_DIR, "historico_simulados.json")

os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI(title="Banca Examinadora PGE-AL - Prova Oral", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sessões ativas em memória
SESSOES: Dict[str, Dict[str, Any]] = {}

def carregar_historico() -> List[Dict[str, Any]]:
    if os.path.exists(HISTORICO_PATH):
        try:
            with open(HISTORICO_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def salvar_no_historico(relatorio: Dict[str, Any]):
    historico = carregar_historico()
    historico.insert(0, relatorio)
    try:
        with open(HISTORICO_PATH, "w", encoding="utf-8") as f:
            json.dump(historico, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erro ao salvar historico: {e}")

# Modelos Pydantic
class IniciarSimuladoRequest(BaseModel):
    candidata: Optional[str] = "Viviane Lima"
    disciplinas: List[str]
    qtd_questoes: Optional[int] = 4
    tempo_leitura: Optional[int] = 120
    tempo_resposta: Optional[int] = 300

class ConfigRequest(BaseModel):
    candidate_name: Optional[str] = None
    reading_time_seconds: Optional[int] = None
    response_time_seconds: Optional[int] = None
    gemini_api_key: Optional[str] = None
    model_name: Optional[str] = None
    auto_speak_examiner: Optional[bool] = None
    examiner_voice_speed: Optional[float] = None

class PerguntaCandidataRequest(BaseModel):
    session_id: str
    pergunta: str

class RespostaRequest(BaseModel):
    session_id: str
    questao_index: int
    transcricao: str

class ReperguntaRespostaRequest(BaseModel):
    session_id: str
    questao_index: int
    transcricao_repergunta: str

# Endpoints
@app.get("/api/status")
def get_status():
    cfg = load_config()
    total_extraidas = sum(len(v) for v in banco.questoes_extraidas.values())
    return {
        "status": "online",
        "has_gemini": gemini_service.has_gemini,
        "model": cfg.get("model_name"),
        "total_questoes_oficiais": len(banco.questoes_oficiais),
        "total_questoes_revisao": total_extraidas,
        "config": {
            "candidate_name": cfg.get("candidate_name"),
            "reading_time_seconds": cfg.get("reading_time_seconds"),
            "response_time_seconds": cfg.get("response_time_seconds"),
            "has_key": bool(cfg.get("gemini_api_key")),
            "auto_speak_examiner": cfg.get("auto_speak_examiner"),
            "examiner_voice_speed": cfg.get("examiner_voice_speed")
        }
    }

@app.get("/api/config")
def get_config():
    cfg = load_config()
    # Oculta chave completa para segurança
    masked = dict(cfg)
    if masked.get("gemini_api_key"):
        k = masked["gemini_api_key"]
        masked["gemini_api_key_masked"] = k[:6] + "..." + k[-4:] if len(k) > 10 else "***"
    return masked

@app.post("/api/config")
def set_config(req: ConfigRequest):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if save_config(update_data):
        gemini_service.reload_config()
        return {"success": True, "message": "Configurações salvas com sucesso!"}
    raise HTTPException(status_code=500, detail="Erro ao salvar configurações")

@app.get("/api/disciplinas")
def get_disciplinas():
    disciplinas = banco.get_disciplinas()
    result = []
    for disc in disciplinas:
        oficiais = len(banco.get_questoes_por_disciplina(disc))
        extraidas = len(banco.questoes_extraidas.get(disc, []))
        result.append({
            "nome": disc,
            "questoes_oficiais": oficiais,
            "questoes_revisao": extraidas,
            "total": oficiais + extraidas
        })
    return result

@app.post("/api/simulado/iniciar")
def iniciar_simulado(req: IniciarSimuladoRequest):
    session_id = str(uuid.uuid4())
    questoes = banco.obter_simulado(req.disciplinas, req.qtd_questoes)
    
    SESSOES[session_id] = {
        "id": session_id,
        "candidata": req.candidata or "Viviane Lima",
        "disciplinas": req.disciplinas,
        "tempo_leitura": req.tempo_leitura,
        "tempo_resposta": req.tempo_resposta,
        "questoes": questoes,
        "indice_atual": 0,
        "inicio_timestamp": time.time(),
        "respostas": [
            {
                "questao": q,
                "resposta": "",
                "repergunta": "",
                "resposta_repergunta": "",
                "duvidas_candidata": []
            }
            for q in questoes
        ]
    }
    
    return {
        "session_id": session_id,
        "total_questoes": len(questoes),
        "disciplinas": req.disciplinas,
        "primeira_questao": questoes[0] if questoes else None
    }

@app.get("/api/simulado/{session_id}/questao_atual")
def obter_questao_atual(session_id: str):
    sessao = SESSOES.get(session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    idx = sessao["indice_atual"]
    if idx >= len(sessao["questoes"]):
        return {"concluido": True}
    
    q = sessao["questoes"][idx]
    return {
        "concluido": False,
        "indice": idx,
        "numero": idx + 1,
        "total": len(sessao["questoes"]),
        "questao": q,
        "tempo_leitura": sessao["tempo_leitura"],
        "tempo_resposta": sessao["tempo_resposta"]
    }

@app.post("/api/simulado/submeter_resposta")
def submeter_resposta(req: RespostaRequest):
    sessao = SESSOES.get(req.session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    if req.questao_index < 0 or req.questao_index >= len(sessao["respostas"]):
        raise HTTPException(status_code=400, detail="Índice de questão inválido")
    
    sessao["respostas"][req.questao_index]["resposta"] = req.transcricao
    return {"success": True, "message": "Resposta registrada com sucesso"}

@app.post("/api/simulado/verificar_repergunta")
def verificar_repergunta(session_id: str = Form(...), questao_index: int = Form(...)):
    sessao = SESSOES.get(session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    item_resp = sessao["respostas"][questao_index]
    questao = item_resp["questao"]
    resposta_candidata = item_resp["resposta"]
    
    analise = gemini_service.verificar_necessidade_repergunta(questao, resposta_candidata)
    if analise.get("deve_reperguntar") and analise.get("repergunta"):
        item_resp["repergunta"] = analise["repergunta"]
    
    return analise

@app.post("/api/simulado/submeter_repergunta")
def submeter_repergunta(req: ReperguntaRespostaRequest):
    sessao = SESSOES.get(req.session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    sessao["respostas"][req.questao_index]["resposta_repergunta"] = req.transcricao_repergunta
    return {"success": True, "message": "Resposta à repergunta registrada"}

@app.post("/api/simulado/pergunta_candidata")
def pergunta_candidata(req: PerguntaCandidataRequest):
    sessao = SESSOES.get(req.session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    idx = sessao["indice_atual"]
    questao = sessao["questoes"][idx]
    
    resposta_banca = gemini_service.responder_duvida_candidata(questao, req.pergunta)
    sessao["respostas"][idx]["duvidas_candidata"].append({
        "pergunta": req.pergunta,
        "resposta_banca": resposta_banca
    })
    
    return {"resposta_banca": resposta_banca}

@app.post("/api/simulado/{session_id}/avancar")
def avancar_questao(session_id: str):
    sessao = SESSOES.get(session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    sessao["indice_atual"] += 1
    concluido = sessao["indice_atual"] >= len(sessao["questoes"])
    return {
        "concluido": concluido,
        "proximo_indice": sessao["indice_atual"]
    }

@app.post("/api/simulado/{session_id}/finalizar")
def finalizar_simulado(session_id: str):
    sessao = SESSOES.get(session_id)
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    duracao_segundos = int(time.time() - sessao["inicio_timestamp"])
    minutos = duracao_segundos // 60
    segundos = duracao_segundos % 60
    duracao_formatada = f"{minutos:02d}:{segundos:02d}"
    
    dados_simulado = {
        "id": session_id,
        "candidata": sessao["candidata"],
        "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "duracao_formatada": duracao_formatada,
        "duracao_segundos": duracao_segundos,
        "total_perguntas": len(sessao["questoes"]),
        "questoes": sessao["respostas"]
    }
    
    # Avaliação completa estilo ProGrupo
    avaliacao = gemini_service.avaliar_simulado_completo(dados_simulado)
    
    relatorio_completo = {
        "id": session_id,
        "aluno": sessao["candidata"],
        "data": dados_simulado["data"],
        "duracao": duracao_formatada,
        "perguntas_avaliadas": f"{len(sessao['questoes'])} de {len(sessao['questoes'])} avaliadas",
        "disciplinas_titulo": " · ".join(sessao["disciplinas"]),
        "media_disciplinas": avaliacao["media_geral"],
        "percentual": avaliacao["percentual"],
        "status": avaliacao["status"],
        "status_tipo": avaliacao["status_tipo"],
        "notas_disciplinas": avaliacao["notas_disciplinas"],
        "feedback_banca": avaliacao["feedback_banca"],
        "questoes_detalhadas": avaliacao["questoes_detalhadas"]
    }
    
    salvar_no_historico(relatorio_completo)
    return relatorio_completo

@app.get("/api/simulado/historico")
def get_historico():
    historico = carregar_historico()
    # Retorna resumo para listagem
    resumos = [
        {
            "id": h["id"],
            "aluno": h["aluno"],
            "data": h["data"],
            "duracao": h["duracao"],
            "media_disciplinas": h["media_disciplinas"],
            "status": h["status"],
            "status_tipo": h["status_tipo"],
            "disciplinas_titulo": h["disciplinas_titulo"]
        }
        for h in historico
    ]
    return resumos

@app.get("/api/simulado/relatorio/{report_id}")
def get_relatorio(report_id: str):
    historico = carregar_historico()
    for h in historico:
        if h["id"] == report_id:
            return h
    raise HTTPException(status_code=404, detail="Relatório não encontrado")

@app.get("/api/banco_questoes")
def pesquisar_banco_questoes(disciplina: Optional[str] = None, busca: Optional[str] = None, limite: int = 50):
    todas = []
    
    # Adiciona oficiais
    for q in banco.questoes_oficiais:
        todas.append({
            "tipo": "oficial_progrupo",
            "disciplina": q["disciplina"],
            "topico": q["topico"],
            "pergunta": q["enunciado"],
            "resposta": q["resposta_esperada"],
            "base_legal": q.get("base_legal", [])
        })
        
    # Adiciona extraídas
    for disc, lista in banco.questoes_extraidas.items():
        for q in lista:
            todas.append({
                "tipo": "revisao_docx",
                "disciplina": disc,
                "topico": q.get("topico", "Geral"),
                "pergunta": q.get("pergunta", ""),
                "resposta": q.get("resposta_esperada", ""),
                "base_legal": []
            })
            
    # Filtros
    if disciplina:
        todas = [q for q in todas if q["disciplina"].lower() == disciplina.lower()]
    if busca:
        busca_l = busca.lower()
        todas = [q for q in todas if busca_l in q["pergunta"].lower() or busca_l in q["resposta"].lower()]
        
    return {
        "total_encontrado": len(todas),
        "resultados": todas[:limite]
    }

# Monta arquivos estáticos
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Simulador de Prova Oral PGE-AL</h1><p>Frontend sendo inicializado...</p>"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
