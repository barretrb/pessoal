import os
import time
import fitz

def split_english_file_advanced():
    start_time = time.time()
    pdf_path = r"C:\Users\rafae\Meu Drive\Inglês\Advanced\English File 4th Edition Advanced Students Book.pdf"
    output_dir = r"C:\Users\rafae\Meu Drive\Inglês\Advanced\English_File_Advanced_por_Capitulo"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Abrindo PDF original...")
    doc = fitz.open(pdf_path)
    
    # Lista de todas as seções/capítulos com pasta, nome do arquivo e páginas de início/fim (1-indexed)
    sections = [
        # Front Matter
        ("00 - Front Matter", "00 - Title and Contents (Pages 1-5).pdf", 1, 5),
        
        # File 1
        ("01 - File 1", "01 - 1A We are family (Pages 6-9).pdf", 6, 9),
        ("01 - File 1", "02 - 1B A job for life (Pages 10-13).pdf", 10, 13),
        ("01 - File 1", "03 - Colloquial English 1 (Pages 14-15).pdf", 14, 15),
        
        # File 2
        ("02 - File 2", "01 - 2A Do you remember (Pages 16-19).pdf", 16, 19),
        ("02 - File 2", "02 - 2B On the tip of my tongue (Pages 20-23).pdf", 20, 23),
        ("02 - File 2", "03 - Revise and Check 1&2 (Pages 24-25).pdf", 24, 25),
        
        # File 3
        ("03 - File 3", "01 - 3A A love-hate relationship (Pages 26-29).pdf", 26, 29),
        ("03 - File 3", "02 - 3B Dramatic licence (Pages 30-33).pdf", 30, 33),
        ("03 - File 3", "03 - Colloquial English 2&3 (Pages 34-35).pdf", 34, 35),
        
        # File 4
        ("04 - File 4", "01 - 4A An open book (Pages 36-39).pdf", 36, 39),
        ("04 - File 4", "02 - 4B The sound of silence (Pages 40-43).pdf", 40, 43),
        ("04 - File 4", "03 - Revise and Check 3&4 (Pages 44-45).pdf", 44, 45),
        
        # File 5
        ("05 - File 5", "01 - 5A No time for anything (Pages 46-49).pdf", 46, 49),
        ("05 - File 5", "02 - 5B Not for profit (Pages 50-53).pdf", 50, 53),
        ("05 - File 5", "03 - Colloquial English 4&5 (Pages 54-55).pdf", 54, 55),
        
        # File 6
        ("06 - File 6", "01 - 6A Help, I need somebody (Pages 56-59).pdf", 56, 59),
        ("06 - File 6", "02 - 6B Can't give it up (Pages 60-63).pdf", 60, 63),
        ("06 - File 6", "03 - Revise and Check 5&6 (Pages 64-65).pdf", 64, 65),
        
        # File 7
        ("07 - File 7", "01 - 7A As a matter of fact (Pages 66-69).pdf", 66, 69),
        ("07 - File 7", "02 - 7B A masterpiece (Pages 70-73).pdf", 70, 73),
        ("07 - File 7", "03 - Colloquial English 6&7 (Pages 74-75).pdf", 74, 75),
        
        # File 8
        ("08 - File 8", "01 - 8A The best medicine (Pages 76-79).pdf", 76, 79),
        ("08 - File 8", "02 - 8B A must-see attraction (Pages 80-83).pdf", 80, 83),
        ("08 - File 8", "03 - Revise and Check 7&8 (Pages 84-85).pdf", 84, 85),
        
        # File 9
        ("09 - File 9", "01 - 9A Pet hates (Pages 86-89).pdf", 86, 89),
        ("09 - File 9", "02 - 9B How to cook, how to eat (Pages 90-93).pdf", 90, 93),
        ("09 - File 9", "03 - Colloquial English 8&9 (Pages 94-95).pdf", 94, 95),
        
        # File 10
        ("10 - File 10", "01 - 10A On your marks, set, go (Pages 96-99).pdf", 96, 99),
        ("10 - File 10", "02 - 10B No direction home (Pages 100-103).pdf", 100, 103),
        ("10 - File 10", "03 - Revise and Check 9&10 (Pages 104-105).pdf", 104, 105),
        
        # Reference and Bank Sections
        ("11 - Reference and Bank Sections", "01 - Communication (Pages 106-115).pdf", 106, 115),
        ("11 - Reference and Bank Sections", "02 - Writing (Pages 116-129).pdf", 116, 129),
        ("11 - Reference and Bank Sections", "03 - Listening (Pages 130-141).pdf", 130, 141),
        ("11 - Reference and Bank Sections", "04 - Grammar Bank (Pages 142-161).pdf", 142, 161),
        ("11 - Reference and Bank Sections", "05 - Vocabulary Bank (Pages 162-172).pdf", 162, 172),
        ("11 - Reference and Bank Sections", "06 - Appendix (Page 173).pdf", 173, 173),
        ("11 - Reference and Bank Sections", "07 - Sound Bank (Pages 174-176).pdf", 174, 176),
    ]
    
    report_lines = []
    
    print(f"Dividindo em {len(sections)} capítulos/seções...")
    
    for folder_name, filename, start_p, end_p in sections:
        folder_path = os.path.join(output_dir, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        out_filepath = os.path.join(folder_path, filename)
        
        new_doc = fitz.open()
        new_doc.insert_pdf(doc, from_page=start_p - 1, to_page=end_p - 1)
        new_doc.save(out_filepath, garbage=4, deflate=True)
        new_doc.close()
        
        num_pages = end_p - start_p + 1
        report_lines.append(f"{folder_name};{filename};{start_p};{end_p};{num_pages}")
        print(f"[ OK ] {folder_name:<32} | {filename:<48} | Págs {start_p}-{end_p} ({num_pages} págs)")
        
    doc.close()
    
    csv_path = os.path.join(output_dir, "indice_capitulos.csv")
    with open(csv_path, "w", encoding="utf-8-sig") as f:
        f.write("Pasta;Arquivo;Pagina_Inicio;Pagina_Fim;Total_Paginas\n")
        f.write("\n".join(report_lines))
        
    elapsed = time.time() - start_time
    print("-" * 75)
    print(f"CONCLUÍDO COM SUCESSO em {elapsed:.2f} segundos!")
    print(f"Total de arquivos PDF gerados: {len(sections)}")
    print(f"Pasta de saída: {output_dir}")
    print(f"Relatório gerado em: {csv_path}")

if __name__ == "__main__":
    split_english_file_advanced()
