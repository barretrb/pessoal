import json, csv

json_path = r'C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Plano_Leitura_Biblia_1_Ano\plano_leitura_365_dias.json'
csv_path = r'C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Plano_Leitura_Biblia_1_Ano\plano_leitura_365_dias.csv'
md_path = r'C:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Plano_Leitura_Biblia_1_Ano\plano_leitura_365_dias.md'

with open(json_path, 'r', encoding='utf-8') as f:
    days = json.load(f)

for d in days:
    day_id = d['id']
    if day_id <= 296:
        d['completed'] = True
        d['completedAt'] = d['date']
    else:
        d['completed'] = False
        d['completedAt'] = None

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(days, f, ensure_ascii=False, indent=2)

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
        status = 'Sim' if d['completed'] else 'Não'
        dt_comp = d['completedAt'] or ''
        writer.writerow([d['id'], d['date'], d['dayOfWeek'], d['chaptersCount'], readings_str, r1, r2, r3, r4, status, dt_comp, ''])

with open(md_path, 'w', encoding='utf-8') as f:
    f.write('# Plano de Leitura Bíblica em 1 Ano (Paulo Won)\n\n')
    f.write('Acompanhamento diário dos 365 dias do plano de leitura anual.\n\n')
    f.write('> [!NOTE]\n')
    f.write('> Dias 1 a 296 marcados como **Concluídos**.\n')
    f.write('> **Dia 297 (Lucas 10–12):** Pendente.\n')
    f.write('> **Dia 298 (Lucas 13–15):** Leitura de Hoje.\n\n')
    f.write('| Status | Dia | Data | Dia da Semana | Leituras do Dia |\n')
    f.write('| :---: | :---: | :---: | :--- | :--- |\n')
    for d in days:
        readings_str = ', '.join(d['readings'])
        parts = d['date'].split('-')
        formatted_date = f'{parts[2]}/{parts[1]}'
        mark = '[x]' if d['completed'] else '[ ]'
        day_num = d['id']
        dow = d['dayOfWeek'].capitalize()
        f.write(f'| {mark} | {day_num:03d} | {formatted_date} | {dow} | {readings_str} |\n')

print('Tracking files updated successfully! Days 1-296 completed.')
