# -*- coding: utf-8 -*-
"""
Gerenciador de Autenticação OAuth 2.0 do Google.
Centraliza as credenciais e escopos para Google Tasks API e Google Calendar API.
"""

import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/calendar"
]

class GoogleAuthManager:
    """Gerencia a autenticação e clientes de API do Google."""

    def __init__(self, credentials_path="credentials.json", token_path="token.json"):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self._credentials = None

    def get_credentials(self) -> Credentials:
        """Obtém ou renova as credenciais de acesso às APIs do Google."""
        creds = None

        if os.path.exists(self.token_path):
            try:
                creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            except Exception as e:
                print(f"[AUTH] Erro ao carregar token existente: {e}. Um novo login será solicitado.")
                creds = None

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"[AUTH] Falha ao renovar token expirado: {e}. Refazendo login.")
                    creds = None

            if not creds:
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(
                        f"Arquivo de credenciais OAuth do Google não encontrado em: {self.credentials_path}\n"
                        f"Por favor, configure o client_secret baixado do Google Cloud Console."
                    )

                # Suporta tanto arquivos client_secret com formato 'installed' quanto 'web'
                with open(self.credentials_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Se for do tipo 'web', o InstalledAppFlow pode precisar de redirect_uri ou conversão
                if "web" in data and "installed" not in data:
                    # Permite usar client de web no fluxo local de desktop
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

        self._credentials = creds
        return creds

    def get_tasks_service(self):
        """Retorna o cliente autenticado da Google Tasks API (v1)."""
        creds = self.get_credentials()
        return build("tasks", "v1", credentials=creds)

    def get_calendar_service(self):
        """Retorna o cliente autenticado da Google Calendar API (v3)."""
        creds = self.get_credentials()
        return build("calendar", "v3", credentials=creds)
