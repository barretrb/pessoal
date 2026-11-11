import glob
import json
import os
import re
import sys
import pymupdf

sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PDF_DIR = os.path.join(ROOT_DIR, "Biblia_NVT_por_Livro")
BIBLIA_DIR = os.path.join(ROOT_DIR, "devocional-biblia", "public", "biblia")
LUCAS_SRC_PATH = os.path.join(ROOT_DIR, "devocional-biblia", "src", "data", "lucas_nvt.json")
STUDY_INFO_PATH = os.path.join(ROOT_DIR, "devocional-biblia", "src", "data", "bibleBooksStudyInfo.js")

JESUS_WORDS_EXTRA = {
    ("mateus", "10", 35),
    ("mateus", "11", 17),
    ("mateus", "15", 8),
    ("mateus", "20", 12),
    ("mateus", "22", 32),
    ("mateus", "22", 44),
    ("marcos", "10", 7),
}


def load_books_meta():
    study_txt = open(STUDY_INFO_PATH, encoding="utf-8").read()
    books = []
    for m in re.finditer(
        r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",.*?"chapters":\s*(\d+)',
        study_txt,
        re.S,
    ):
        books.append({"id": m.group(1), "name": m.group(2), "chapters": int(m.group(3))})
    assert len(books) == 66, f"Expected 66 books in study info, got {len(books)}"
    return books


def is_footnote_def_line(spans):
    non_empty = [s for s in spans if s["text"].strip()]
    if len(non_empty) >= 2:
        s0, s1 = non_empty[0], non_empty[1]
        if s0["color"] == 0xF0003E and round(s0["size"], 1) <= 9.5:
            if s1["color"] == 0x000000 and "ChaparralPro-Bold" in s1["font"] and round(s1["size"], 1) <= 12.0:
                return True
    return False


def clean_text(txt):
    txt = txt.replace("\xad", "").replace("\xa0", " ")
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt


def parse_pdf_book(pdf_path, book_id, book_name):
    doc = pymupdf.open(pdf_path)
    chapters = {}
    current_ch = None
    current_sec_title = ""
    current_verses = []
    current_sections = []
    current_v_num = None
    current_v_parts = []
    last_verse_num_in_ch = None
    started = False
    in_footnotes = False
    psalm_inscription_parts = []
    in_psalm_inscription = False

    def flush_verse():
        nonlocal current_v_num, current_v_parts, last_verse_num_in_ch
        if current_v_num is not None and current_ch is not None:
            txt = clean_text("".join(current_v_parts))
            if txt:
                current_verses.append(
                    {
                        "number": current_v_num,
                        "text": txt,
                        "isJesusWords": False,
                        "crossReferences": [],
                    }
                )
                last_verse_num_in_ch = current_v_num
        current_v_num = None
        current_v_parts = []

    def flush_section():
        nonlocal current_sec_title, current_verses
        flush_verse()
        if current_verses:
            current_sections.append(
                {
                    "title": clean_text(current_sec_title),
                    "verses": current_verses,
                }
            )
            current_sec_title = ""
            current_verses = []

    def flush_chapter():
        nonlocal current_ch, current_sections, last_verse_num_in_ch
        flush_section()
        if current_ch is not None:
            chapters[str(current_ch)] = {
                "book": book_name,
                "chapter": str(current_ch),
                "verified": True,
                "sections": current_sections,
            }
        current_ch = None
        current_sections = []
        last_verse_num_in_ch = None

    for page in doc:
        if in_footnotes:
            break
        d = page.get_text("dict")
        for b in d["blocks"]:
            if in_footnotes:
                break
            for l in b.get("lines", []):
                spans = l["spans"]
                if not spans:
                    continue
                if is_footnote_def_line(spans):
                    in_footnotes = True
                    break

                line_text_strip = "".join(s["text"] for s in spans).strip()
                if not line_text_strip:
                    continue

                non_empty_spans = [s for s in spans if s["text"].strip()]
                if not non_empty_spans:
                    continue
                first_ne = non_empty_spans[0]

                if first_ne["color"] == 0x0000EE:
                    continue
                if round(first_ne["size"], 1) in (25.0, 30.0):
                    continue
                if "ChaparralPro-Bold" in first_ne["font"] and round(first_ne["size"], 1) == 15.0 and first_ne["color"] == 0x000000:
                    continue
                if all((s["color"] == 0xF0003E and round(s["size"], 1) == 15.0) or (s["text"].strip() in ("•", "")) for s in spans):
                    continue

                # Whole-line section subtitle (#008674) or Salmos 119 acrostic letter
                if all(s["color"] == 0x008674 for s in non_empty_spans):
                    started = True
                    title_line = "".join(s["text"] for s in spans).strip()
                    if current_verses or "".join(current_v_parts).strip():
                        flush_section()
                    current_sec_title = (current_sec_title + " " + title_line).strip() if current_sec_title else title_line
                    continue

                if book_id == "salmos" and all(s["font"] == "ChaparralPro-Italic" and round(s["size"], 1) == 15.0 and s["color"] == 0x000000 for s in non_empty_spans):
                    started = True
                    title_line = "".join(s["text"] for s in spans).strip()
                    if current_verses or "".join(current_v_parts).strip():
                        flush_section()
                    current_sec_title = (current_sec_title + " " + title_line).strip() if current_sec_title else title_line
                    continue

                line_has_added_text = False
                for s in spans:
                    txt = s["text"]
                    col = s["color"]
                    sz = round(s["size"], 1)
                    font = s["font"]

                    if col == 0xF0003E or col == 0x0000EE:
                        continue

                    # Chapter drop-cap
                    if col == 0x0D52A0 and sz >= 20.0:
                        started = True
                        ch_num = txt.strip()
                        if ch_num.isdigit():
                            flush_chapter()
                            current_ch = int(ch_num)
                            current_v_num = 1
                            current_v_parts = []
                            psalm_inscription_parts = []
                            in_psalm_inscription = False
                        continue

                    if not started:
                        continue

                    # Inline section subtitle (#008674) or Salmos 119 inline acrostic letter
                    if col == 0x008674 or (book_id == "salmos" and font == "ChaparralPro-Italic" and sz == 15.0 and col == 0x000000):
                        t_clean = txt.strip()
                        if t_clean:
                            if current_verses or "".join(current_v_parts).strip():
                                flush_section()
                            current_sec_title = (current_sec_title + " " + t_clean).strip() if current_sec_title else t_clean
                        continue

                    # Verse number
                    if col == 0x0D52A0 and 10.0 <= sz < 20.0:
                        v_str = txt.strip()
                        if v_str.isdigit():
                            v_num = int(v_str)
                            if in_psalm_inscription and v_num == 1 and current_v_num == 1 and not "".join(current_v_parts).strip():
                                insc = clean_text("".join(psalm_inscription_parts))
                                psalm_inscription_parts = []
                                in_psalm_inscription = False
                                if insc:
                                    current_sec_title = f"{current_sec_title} — {insc}" if current_sec_title else insc
                                current_v_num = 1
                                current_v_parts = []
                            else:
                                flush_verse()
                                current_v_num = v_num
                                current_v_parts = []
                        continue

                    # Psalm inscription right after chapter drop-cap
                    if book_id == "salmos" and current_v_num == 1 and not "".join(current_v_parts).strip() and not current_verses and font == "LucernaNw-ItalicPS" and sz == 11.3:
                        in_psalm_inscription = True
                        psalm_inscription_parts.append(txt)
                        line_has_added_text = True
                        continue

                    if in_psalm_inscription and not "".join(current_v_parts).strip() and font in ("LucernaNw-ItalicPS", "LucernaNwPS") and sz == 11.3:
                        psalm_inscription_parts.append(txt)
                        line_has_added_text = True
                        continue

                    # Skip Canticos editorial footnote about speaker headings
                    if book_id == "canticos" and sz == 11.3 and ("subtítulos identificam" in txt or "não fazem parte" in txt):
                        continue

                    if col == 0x000000:
                        if not txt.strip():
                            if current_v_num is not None:
                                current_v_parts.append(txt)
                            continue
                        if current_v_num is None and last_verse_num_in_ch is not None:
                            current_v_num = last_verse_num_in_ch
                            current_v_parts = []
                        if current_v_num is not None:
                            current_v_parts.append(txt)
                            line_has_added_text = True

                if line_has_added_text:
                    target = psalm_inscription_parts if (in_psalm_inscription and not "".join(current_v_parts).strip()) else current_v_parts
                    if target:
                        last = target[-1]
                        if not last.endswith(" ") and not re.search(r"[A-Za-zÀ-Úà-ú]-$", last):
                            target.append(" ")

    flush_chapter()
    return chapters


def split_joao_ch1_filipe(joao_data):
    """Preserve curated 5-section split in João 1 for 'Jesus chama Filipe e Natanael' (v43-51)."""
    ch1 = joao_data.get("1")
    if not ch1:
        return
    new_sections = []
    for sec in ch1["sections"]:
        if sec["title"] == "Os primeiros discípulos":
            v_before = [v for v in sec["verses"] if v["number"] < 43]
            v_after = [v for v in sec["verses"] if v["number"] >= 43]
            if v_before and v_after:
                new_sections.append({"title": "Os primeiros discípulos", "verses": v_before})
                new_sections.append({"title": "Jesus chama Filipe e Natanael", "verses": v_after})
            else:
                new_sections.append(sec)
        else:
            new_sections.append(sec)
    ch1["sections"] = new_sections


def clean_preview(text):
    if not text:
        return None
    if len(text) > 250:
        return text[:220].rstrip(",;: ") + "..."
    return text


def main():
    books_meta = load_books_meta()
    pdfs = sorted(glob.glob(os.path.join(PDF_DIR, "[0-9][0-9] - *.pdf")))
    pdfs = [p for p in pdfs if not os.path.basename(p).startswith(("00 ", "67 "))]
    assert len(pdfs) == 66, f"Expected 66 book PDFs, found {len(pdfs)}"

    # Map normalized book names to book IDs for refreshing cross-reference previews
    name_to_id = {}
    for m in books_meta:
        name_to_id[m["name"]] = m["id"]
    name_to_id["Atos"] = "atos"
    name_to_id["Atos dos Apóstolos"] = "atos"
    name_to_id["Cânticos"] = "canticos"
    name_to_id["Cântico dos Cânticos"] = "canticos"
    name_to_id["Oséias"] = "oseias"
    name_to_id["Oseias"] = "oseias"

    rebuilt_books = {}
    verse_text_map = {}

    for idx, pdf_path in enumerate(pdfs):
        meta = books_meta[idx]
        bid = meta["id"]
        old_path = os.path.join(BIBLIA_DIR, f"{bid}.json")
        old_data = json.load(open(old_path, encoding="utf-8")) if os.path.exists(old_path) else {}

        # Preserve existing canonical 'book' string if present
        old_book_name = meta["name"]
        if old_data:
            first_ch = next(iter(old_data.values()))
            if isinstance(first_ch, dict) and first_ch.get("book"):
                old_book_name = first_ch["book"]

        new_data = parse_pdf_book(pdf_path, bid, old_book_name)
        assert len(new_data) == meta["chapters"], f"{bid}: got {len(new_data)} chapters, expected {meta['chapters']}"

        if bid == "joao":
            split_joao_ch1_filipe(new_data)

        # Merge isJesusWords & crossReferences from old_data
        for ch_k, ch_d in new_data.items():
            old_ch = old_data.get(ch_k, {})
            old_meta_by_num = {}
            for s in old_ch.get("sections", []):
                for v in s.get("verses", []):
                    num = v.get("number")
                    if num is None:
                        continue
                    existing = old_meta_by_num.get(num)
                    if existing is None:
                        old_meta_by_num[num] = {
                            "isJesusWords": bool(v.get("isJesusWords", False)),
                            "crossReferences": v.get("crossReferences", []),
                        }
                    else:
                        existing["isJesusWords"] = existing["isJesusWords"] or bool(v.get("isJesusWords", False))
                        if not existing["crossReferences"] and v.get("crossReferences"):
                            existing["crossReferences"] = v.get("crossReferences", [])

            for s in ch_d["sections"]:
                for v in s["verses"]:
                    vn = v["number"]
                    if (bid, ch_k, vn) in JESUS_WORDS_EXTRA:
                        v["isJesusWords"] = True
                    elif vn in old_meta_by_num:
                        v["isJesusWords"] = old_meta_by_num[vn]["isJesusWords"]
                        v["crossReferences"] = old_meta_by_num[vn]["crossReferences"]

                    verse_text_map.setdefault((bid, ch_k, vn), v["text"])

        rebuilt_books[bid] = new_data

    # Refresh crossReferences[].text previews using clean verse_text_map
    ref_pattern = re.compile(r"^(.+?)\s+(\d+):(\d+)(?:–(\d+))?$")
    refreshed_count = 0
    for bid, book_data in rebuilt_books.items():
        for ch_k, ch_d in book_data.items():
            for s in ch_d["sections"]:
                for v in s["verses"]:
                    for ref_obj in v.get("crossReferences", []):
                        m = ref_pattern.match(ref_obj.get("ref", ""))
                        if not m:
                            continue
                        t_book = name_to_id.get(m.group(1))
                        if not t_book:
                            continue
                        t_ch = m.group(2)
                        t_v1 = int(m.group(3))
                        t_v2 = int(m.group(4)) if m.group(4) else None
                        txt1 = verse_text_map.get((t_book, t_ch, t_v1))
                        if txt1:
                            combined = txt1
                            if t_v2 and t_v2 == t_v1 + 1:
                                txt2 = verse_text_map.get((t_book, t_ch, t_v2))
                                if txt2 and (len(txt1) + len(txt2) < 220):
                                    combined = f"{txt1} {txt2}"
                            new_prev = clean_preview(combined)
                            if new_prev and new_prev != ref_obj.get("text"):
                                ref_obj["text"] = new_prev
                                refreshed_count += 1

    # Write all 66 JSONs + src/data/lucas_nvt.json
    for bid, book_data in rebuilt_books.items():
        out_path = os.path.join(BIBLIA_DIR, f"{bid}.json")
        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(book_data, f, ensure_ascii=False, indent=2)
            f.write("\n")

    with open(LUCAS_SRC_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(rebuilt_books["lucas"], f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Rebuilt all {len(rebuilt_books)} books + lucas_nvt.json cleanly. Refreshed {refreshed_count} cross-reference previews.")


if __name__ == "__main__":
    main()
