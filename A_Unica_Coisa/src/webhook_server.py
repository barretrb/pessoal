# -*- coding: utf-8 -*-
"""
Servidor Webhook HTTP (FastAPI).
Permite hospedar o agente em nuvem (Render / Railway / Docker) ou rodar localmente.
Recebe mensagens do WhatsApp, dispara crons e executa o processador de intenções.
"""

import os
import sys
import json
import traceback
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse

# Garante saída UTF-8 compatível sem quebras de encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from src.orchestrator import Orchestrator
from src.inbound_handler import InboundHandler

app = FastAPI(
    title="Agente A Única Coisa - Webhook API",
    description="Servidor de Mensageria e Orquestração do Priorizador A Única Coisa",
    version="1.0.0"
)

# Inicializa orchestrator e handler
orchestrator = Orchestrator()
inbound_handler = InboundHandler(orchestrator)

def safe_send_whatsapp(message: str):
    """Envia mensagem no WhatsApp em background capturando qualquer exceção."""
    try:
        orchestrator.whatsapp.send_message(message)
    except Exception as e:
        print(f"[BACKGROUND WHATSAPP ERROR] {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "agent": "A Única Coisa",
        "description": "One Thing Prioritizer & Tracker Webhook"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Recebe payloads de WhatsApp.
    Compatível com Evolution API, Z-API, Twilio e simuladores JSON simples.
    """
    try:
        body_bytes = await request.body()
        try:
            body_str = body_bytes.decode("utf-8")
        except UnicodeDecodeError:
            body_str = body_bytes.decode("latin-1", errors="replace")

        try:
            payload = json.loads(body_str) if body_str else {}
        except Exception:
            form = await request.form()
            payload = dict(form)

        # Extração flexível de mensagem de texto
        incoming_text = ""
        if isinstance(payload, dict):
            incoming_text = (
                payload.get("text") or
                payload.get("message") or
                payload.get("body") or
                payload.get("data", {}).get("message", {}).get("conversation") or
                payload.get("data", {}).get("message", {}).get("extendedTextMessage", {}).get("text") or
                payload.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}).get("messages", [{}])[0].get("text", {}).get("body") or
                ""
            )

        if not incoming_text:
            return JSONResponse(status_code=200, content={"status": "ignored", "reason": "No text content found"})

        # Processa a mensagem com o InboundHandler
        result = inbound_handler.process_incoming_message(incoming_text)

        # Envia a resposta de volta ao WhatsApp de forma segura
        reply_text = result.get("reply")
        if reply_text:
            background_tasks.add_task(safe_send_whatsapp, reply_text)

        return JSONResponse(status_code=200, content=result)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

@app.get("/cron/morning")
def trigger_morning_cron(force: bool = False):
    """Disparo do ritual matinal das 08:15."""
    try:
        result = orchestrator.run_morning_routine(force=force)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cron/lunch")
def trigger_lunch_cron():
    """Disparo da pílula do livro no horário do almoço (12:30)."""
    try:
        sent = orchestrator.run_lunch_pill()
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cron/night")
def trigger_night_cron():
    """Disparo do fechamento noturno das 18:00."""
    try:
        sent = orchestrator.run_night_checkin()
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cron/weekly")
def trigger_weekly_cron():
    """Disparo do planejamento semanal de segunda-feira."""
    try:
        msg = orchestrator.whatsapp.format_weekly_planning()
        sent = orchestrator.whatsapp.send_message(msg)
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
