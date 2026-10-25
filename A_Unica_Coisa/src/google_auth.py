# -*- coding: utf-8 -*-
"""
Gerenciador de Autenticação OAuth 2.0 do Google.
Centraliza as credenciais e escopos para Google Tasks API e Google Calendar API.
Suporta leitura a partir de arquivos locais ou variáveis de ambiente (GOOGLE_TOKEN_JSON) na nuvem.
"""

import os
import json
from typing import Optional
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/calendar"
]

class GoogleAuthManager:
    """Gerencia a autenticação e clientes de API do Google com suporte a nuvem."""

    def __init__(self, credentials_path="credentials.json", token_path="token.json"):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self._credentials = None

    def get_credentials(self) -> Optional[Credentials]:
        """Obtém ou renova as credenciais de acesso às APIs do Google."""
        creds = None

        # 1. Tenta carregar token direto de variável de ambiente (Padrão para Nuvem como Render)
        env_token = os.environ.get("GOOGLE_TOKEN_JSON")
        if env_token:
            try:
                token_data = json.loads(env_token)
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
            except Exception as e:
                print(f"[AUTH] Erro ao carregar GOOGLE_TOKEN_JSON da variável de ambiente: {e}")
                creds = None

        # 2. Tenta carregar token de arquivo local
        if not creds and os.path.exists(self.token_path):
            try:
                creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            except Exception as e:
                print(f"[AUTH] Erro ao carregar token existente: {e}.")
                creds = None

        # 3. Se expirado, tenta renovar via refresh_token
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"[AUTH] Falha ao renovar token expirado: {e}.")
                creds = None

        # 4. Se não há credenciais e estamos em ambiente interativo local, tenta fluxo OAuth
        if not creds:
            if not os.path.exists(self.credentials_path):
                print(f"[AUTH] Aviso: Nenhum token ou credentials.json configurado. Operando em modo offline.")
                return None

            try:
                with open(self.credentials_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if "web" in data and "installed" not in data:
                    installed_data = {"installed": data["web"]}
                    temp_cred_path = self.credentials_path + ".temp.json"
                    with open(temp_cred_path, "w", encoding="utf-8") as tf:
                        json.dump(installed_data, tf)
                    try:
                        flow = InstalledAppFlow.from_client_secrets_file(temp_cred_path, SCOPES)
                    finally:
                        if os.path.exists(temp_cred_path):
                            os.remove(temp_cred_path)
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)

                creds = flow.run_local_server(port=0)

                # Salva o token atualizado para as próximas execuções
                os.makedirs(os.path.dirname(os.path.abspath(self.token_path)), exist_ok=True)
                with open(self.token_path, "w", encoding="utf-8") as token_file:
                    token_file.write(creds.to_json())
            except Exception as e:
                print(f"[AUTH] Falha ao executar login interativo: {e}")
                return None

        self._credentials = creds
        return creds

    def get_tasks_service(self):
        """Retorna o cliente autenticado da Google Tasks API (v1) se autenticado."""
        creds = self.get_credentials()
        if not creds:
            return None
        return build("tasks", "v1", credentials=creds)

    def get_calendar_service(self):
        """Retorna o cliente autenticado da Google Calendar API (v3) se autenticado."""
        creds = self.get_credentials()
        if not creds:
            return None
        return build("calendar", "v3", credentials=creds)
