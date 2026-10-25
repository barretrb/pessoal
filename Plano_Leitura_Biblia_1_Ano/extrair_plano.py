import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import json
import csv
import re
import os

url = 'https://abibliaemumano.lovable.app/assets/index-CUOH2-rx.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_bytes = urllib.request.urlopen(req).read()

needle = b'[{id:1,date:"2026-01-01"'
start = raw_bytes.find(needle)

depth = 0
end = -1
for i in range(start, len(raw_bytes)):
    if raw_bytes[i:i+1] == b'[':
        depth += 1
    elif raw_bytes[i:i+1] == b']':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

array_bytes = raw_bytes[start:end]
txt = array_bytes.decode('utf-8')

fixed_json = re.sub(r'([{,])([a-zA-Z0-9_]+):', r'\1"\2":', txt)
days = json.loads(fixed_json)

target_dir = r'C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Plano_Leitura_Biblia_1_Ano'
os.makedirs(target_dir, exist_ok=True)

# 1. Save JSON
json_path = os.path.join(target_dir, 'plano_leitura_365_dias.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(days, f, ensure_ascii=False, indent=2)

# 2. Save CSV (with tracking columns for Excel / Google Sheets / Notion)
csv_path = os.path.join(target_dir, 'plano_leitura_365_dias.csv')
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    writer.writerow(['Dia', 'Data_Planejada', 'Dia_Semana', 'Qtd_Capitulos', 'Leituras', 'Leitura_1', 'Leitura_2', 'Leitura_3', 'Leitura_4', 'Concluido', 'Data_Conclusao', 'Anotacoes'])
    for d in days:
        readings = d['readings']
        r1 = readings[0] if len(readings) > 0 else ''
        r2 = readings[1] if len(readings) > 1 else ''
        r3 = readings[2] if len(readings) > 2 else ''
        r4 = readings[3] if len(readings) > 3 else ''
        readings_str = ' | '.join(readings)
        writer.writerow([d['id'], d['date'], d['dayOfWeek'], d['chaptersCount'], readings_str, r1, r2, r3, r4, 'Não', '', ''])

# 3. Save Markdown (with checklist format [ ])
md_path = os.path.join(target_dir, 'plano_leitura_365_dias.md')
with open(md_path, 'w', encoding='utf-8') as f:
    f.write('# Plano de Leitura Bíblica em 1 Ano (Paulo Won)\n\n')
    f.write('Acompanhamento diário dos 365 dias do plano de leitura anual.\n\n')
    f.write('| Status | Dia | Data | Dia da Semana | Leituras do Dia |\n')
    f.write('| :---: | :---: | :---: | :--- | :--- |\n')
    for d in days:
        readings_str = ', '.join(d['readings'])
        # Format date as DD/MM
        parts = d['date'].split('-')
        formatted_date = f"{parts[2]}/{parts[1]}"
        f.write(f"| [ ] | {d['id']:03d} | {formatted_date} | {d['dayOfWeek'].capitalize()} | {readings_str} |\n")

print(f"Generated successfully:")
print(f"JSON: {json_path}")
print(f"CSV:  {csv_path}")
print(f"MD:   {md_path}")
