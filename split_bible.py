import os
import fitz

pdf_path = r"C:\Users\rafae\Downloads\Bíblia Sagrada NVT (Nova Versão Transformadora).pdf"
output_dir = r"c:\Users\rafae\.gemini\antigravity\playground\PESSOAL\Biblia_NVT_por_Livro"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
toc = doc.get_toc()

# Exact canonical Portuguese book names for the 66 books (indices 5 to 70 in TOC)
BOOKS = [
    "01 - Gênesis",
    "02 - Êxodo",
    "03 - Levítico",
    "04 - Números",
    "05 - Deuteronômio",
    "06 - Josué",
    "07 - Juízes",
    "08 - Rute",
    "09 - 1 Samuel",
    "10 - 2 Samuel",
    "11 - 1 Reis",
    "12 - 2 Reis",
    "13 - 1 Crônicas",
    "14 - 2 Crônicas",
    "15 - Esdras",
    "16 - Neemias",
    "17 - Ester",
    "18 - Jó",
    "19 - Salmos",
    "20 - Provérbios",
    "21 - Eclesiastes",
    "22 - Cântico dos Cânticos",
    "23 - Isaías",
    "24 - Jeremias",
    "25 - Lamentações",
    "26 - Ezequiel",
    "27 - Daniel",
    "28 - Oseias",
    "29 - Joel",
    "30 - Amós",
    "31 - Obadias",
    "32 - Jonas",
    "33 - Miqueias",
    "34 - Naum",
    "35 - Habacuque",
    "36 - Sofonias",
    "37 - Ageu",
    "38 - Zacarias",
    "39 - Malaquias",
    "40 - Mateus",
    "41 - Marcos",
    "42 - Lucas",
    "43 - João",
    "44 - Atos dos Apóstolos",
    "45 - Romanos",
    "46 - 1 Coríntios",
    "47 - 2 Coríntios",
    "48 - Gálatas",
    "49 - Efésios",
    "50 - Filipenses",
    "51 - Colossenses",
    "52 - 1 Tessalonicenses",
    "53 - 2 Tessalonicenses",
    "54 - 1 Timóteo",
    "55 - 2 Timóteo",
    "56 - Tito",
    "57 - Filemom",
    "58 - Hebreus",
    "59 - Tiago",
    "60 - 1 Pedro",
    "61 - 2 Pedro",
    "62 - 1 João",
    "63 - 2 João",
    "64 - 3 João",
    "65 - Judas",
    "66 - Apocalipse",
]

# Build sections: Intro (00), Books 01..66, Outro (67)
sections = []

# 00 - Introdução e Sumário
intro_end_page = toc[5][2] - 1  # page before Gênesis
sections.append({
    "filename": "00 - Introdução e Sumário.pdf",
    "start_page": 1,
    "end_page": intro_end_page
})

# 66 Books
for idx, book_name in enumerate(BOOKS):
    toc_idx = 5 + idx
    start_page = toc[toc_idx][2]
    if idx < len(BOOKS) - 1:
        end_page = toc[toc_idx + 1][2] - 1
    else:
        # For Apocalipse, end page is the page before TOC index 71 ("Plano anual de leitura")
        end_page = toc[71][2] - 1
    sections.append({
        "filename": f"{book_name}.pdf",
        "start_page": start_page,
        "end_page": end_page
    })

# 67 - Plano Anual de Leitura e Anexos
sections.append({
    "filename": "67 - Plano Anual de Leitura e Anexos.pdf",
    "start_page": toc[71][2],
    "end_page": len(doc)
})

print("Divisão programada:")
print(f"{'Arquivo':<35} | {'Pág Início':<10} | {'Pág Fim':<10} | {'Total Págs':<10}")
print("-" * 73)

for sec in sections:
    out_path = os.path.join(output_dir, sec["filename"])
    start_0idx = sec["start_page"] - 1
    end_0idx = sec["end_page"] - 1
    
    new_doc = fitz.open()
    new_doc.insert_pdf(doc, from_page=start_0idx, to_page=end_0idx)
    new_doc.save(out_path, garbage=4, deflate=True)
    new_doc.close()
    
    num_pages = sec["end_page"] - sec["start_page"] + 1
    print(f"{sec['filename']:<35} | {sec['start_page']:<10} | {sec['end_page']:<10} | {num_pages:<10}")

doc.close()
print(f"\nConcluído com sucesso! {len(sections)} arquivos criados na pasta:\n{output_dir}")
