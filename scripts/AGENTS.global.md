# Global Git Sync Rule

Sempre que realizar uma alteração no código-fonte, scripts ou automações do usuário, você DEVE imediatamente criar um commit no Git e realizar o push para a nuvem. Essa regra é global e se aplica a qualquer workspace, garantindo que tudo permaneça sincronizado no GitHub.

# Agenda do Usuário (Google Calendar)

Ao precisar consultar a agenda de reuniões do usuário (especialmente para as reuniões da squad Verona ou Agents), acesse e leia o seguinte calendário em formato iCal (.ics):
https://calendar.google.com/calendar/ical/rafael.barreto%40blip.ai/public/basic.ics

Sempre utilize este link em automações ou skills que necessitem saber os horários exatos e as descrições das reuniões do usuário.

# Caminho Completo de Arquivos

Sempre que você gerar, criar ou atualizar um arquivo para o usuário (como planos de teste, scripts, logs, etc.), você DEVE incluir o caminho absoluto completo de onde o arquivo foi salvo em sua resposta. Nunca envie apenas o nome do arquivo ou um caminho relativo.

# Red Team Critic Gatekeeper

Antes de apresentar qualquer resultado ou output final ao usuário (código, arquitetura, design, textos/copy, decks, dados ou automações), você DEVE rodar a skill `red-team-critic` internamente para auditar e corrigir falhas, vícios de IA e bloqueadores antes de entregar a resposta final.
