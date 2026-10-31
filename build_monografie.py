"""
build_monografie.py
Estrae le monografie ufficiali dell'Agenzia delle Entrate (PDF),
ritaglia le fotografie originali del PF, gli estratti di mappa e le pagine intere,
e genera un indice JSON e JS pronto per il WebGIS.
"""

import os
import shutil
import re
import json
import pypdfium2 as pdfium
import pdfplumber
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_DEST_DIR = os.path.join(BASE_DIR, "data", "monografie", "pdf")
IMG_DEST_DIR = os.path.join(BASE_DIR, "data", "monografie", "img")
INDEX_JSON_PATH = os.path.join(BASE_DIR, "data", "monografie", "index.json")
INDEX_JS_PATH = os.path.join(BASE_DIR, "data", "monografie", "index.js")

os.makedirs(PDF_DEST_DIR, exist_ok=True)
os.makedirs(IMG_DEST_DIR, exist_ok=True)

POTENTIAL_SOURCES = [
    os.path.join(BASE_DIR, "data", "monografie", "pdf"),
    r"C:\fiducial\monografie",
    r"C:\Users\giura\Downloads",
    r"C:\Users\giura\Downloads\3_Documentazione_Tecnica",
]

def find_all_official_pdfs():
    candidates = {}
    pattern = re.compile(r"^([A-Za-z]\d{3})-([0-9A-Za-z]{4})-([0-9A-Za-z]{2})\.pdf$", re.IGNORECASE)
    for sdir in POTENTIAL_SOURCES:
        if not os.path.exists(sdir):
            continue
        for fname in os.listdir(sdir):
            m = pattern.match(fname)
            if m and os.path.isfile(os.path.join(sdir, fname)):
                full_path = os.path.join(sdir, fname)
                if os.path.getsize(full_path) > 1000:
                    candidates[fname.upper()] = full_path
    return candidates

def parse_pf_id_from_text_or_name(fname, text):
    m = re.search(r"Punto\s+Fiduciale\s+([0-9A-Za-z]+)/([0-9A-Za-z]+)/([0-9A-Za-z]+)", text, re.IGNORECASE)
    if m:
        pf_num = m.group(1).strip()
        foglio_code = m.group(2).strip()
        comune_code = m.group(3).strip().upper()
    else:
        fn_match = re.match(r"^([A-Za-z0-9]{4})-([0-9A-Za-z]{4})-([0-9A-Za-z]{2})\.pdf$", fname, re.IGNORECASE)
        if not fn_match:
            return None
        comune_code = fn_match.group(1).upper()
        foglio_code = fn_match.group(2)
        pf_num = fn_match.group(3)

    pf_int = int(re.sub(r"\D", "", pf_num)) if re.sub(r"\D", "", pf_num) else 1
    pf_str = f"PF{pf_int:02d}"

    fg_digits = foglio_code[:3]
    all_char = foglio_code[3:] if len(foglio_code) > 3 else ""
    fg_num = int(fg_digits)
    all_clean = all_char if all_char != "0" else ""

    if all_clean:
        standard_id = f"{pf_str}/{fg_num:04d}{all_clean}/{comune_code}"
    else:
        standard_id = f"{pf_str}/{fg_num:04d}/{comune_code}"

    fs_key = f"{pf_str}_{fg_num:04d}{all_clean}_{comune_code}"

    return {
        "id": standard_id,
        "fs_key": fs_key,
        "pf": pf_str,
        "foglio": fg_num,
        "all": all_clean,
        "codComune": comune_code,
    }

def process_monografia(fname, src_path):
    dest_pdf = os.path.join(PDF_DEST_DIR, fname)
    if not os.path.exists(dest_pdf) or os.path.getmtime(src_path) > os.path.getmtime(dest_pdf):
        shutil.copy2(src_path, dest_pdf)

    with pdfplumber.open(dest_pdf) as pl:
        num_pages = len(pl.pages)
        full_text = "\n".join([p.extract_text() or "" for p in pl.pages])
        pf_info = parse_pf_id_from_text_or_name(fname, full_text)
        if not pf_info:
            print(f"Skipping {fname}: could not identify PF")
            return None

        fs_key = pf_info["fs_key"]
        pf_img_dir = os.path.join(IMG_DEST_DIR, fs_key)
        os.makedirs(pf_img_dir, exist_ok=True)

        part_match = re.search(r"Particella/e:\s*([^\n\r]+)", full_text, re.IGNORECASE)
        particelle = part_match.group(1).strip() if part_match else ""

        comune_match = re.search(r"Comune\s+di\s+([^\n\r]+)", full_text, re.IGNORECASE)
        comune_name = comune_match.group(1).strip().title() if comune_match else ""

        ufficio_match = re.search(r"Ufficio\s+Provinciale\s+(?:di\s+Sportello\s+di\s+)?([A-Za-z]+)", full_text, re.IGNORECASE)
        ufficio_str = ufficio_match.group(1).strip().title() if ufficio_match else "Siracusa"

        tecnico_match = re.search(r"Il\s+tecnico:\s*([^\n\r]+)", full_text, re.IGNORECASE)
        tecnico_str = tecnico_match.group(1).strip() if tecnico_match else ""

        qualifica_match = re.search(r"Qualifica:\s*([^\n\r]+)", full_text, re.IGNORECASE)
        if qualifica_match and tecnico_str:
            tecnico_str += f" ({qualifica_match.group(1).strip()})"

        desc_plani_match = re.search(r"Planimetrico:\s*([^\n\r]+)", full_text, re.IGNORECASE)
        desc_plani = desc_plani_match.group(1).strip() if desc_plani_match else ""

        desc_alti_match = re.search(r"Altimetrico:\s*([^\n\r]+)", full_text, re.IGNORECASE)
        desc_alti = desc_alti_match.group(1).strip() if desc_alti_match else ""

        notes_match = re.search(r"Note[:\s]*([^\n\r]+)", full_text, re.IGNORECASE)
        notes_str = notes_match.group(1).strip() if notes_match else ""

        x_match = re.search(r"X:\s*([-\d.]+)", full_text)
        y_match = re.search(r"Y:\s*([-\d.]+)", full_text)
        q_match = re.search(r"Quota(?:\s+s\.l\.m)?:\s*([\d.]+)", full_text, re.IGNORECASE)
        att_match = re.search(r"Attendibilit[àa]?:\s*([0-9]+)", full_text, re.IGNORECASE)

        doc = pdfium.PdfDocument(dest_pdf)
        page_images = []
        for p_idx in range(len(doc)):
            page_render = doc[p_idx].render(scale=2).to_pil()
            page_rel_path = f"data/monografie/img/{fs_key}/pagina_{p_idx+1}.jpg"
            page_abs_path = os.path.join(BASE_DIR, page_rel_path.replace("/", os.sep))
            page_render.save(page_abs_path, "JPEG", quality=88)
            page_images.append(page_rel_path)

        page0 = pl.pages[0]
        p0_render = doc[0].render(scale=2).to_pil()
        scale_x = p0_render.width / page0.width
        scale_y = p0_render.height / page0.height

        content_imgs = [im for im in page0.images if not (im['top'] < 100 and im['x0'] < 160)]

        estratto_mappa_rel = None
        foto_panoramica_rel = None
        foto_dettaglio_rel = None

        for im in content_imgs:
            bbox = (
                max(0, int(im['x0'] * scale_x)),
                max(0, int(im['top'] * scale_y)),
                min(p0_render.width, int(im['x1'] * scale_x)),
                min(p0_render.height, int(im['bottom'] * scale_y))
            )
            cropped = p0_render.crop(bbox)

            if im['top'] < 450:
                estratto_mappa_rel = f"data/monografie/img/{fs_key}/estratto_mappa.jpg"
                cropped.save(os.path.join(BASE_DIR, estratto_mappa_rel.replace("/", os.sep)), "JPEG", quality=90)
            elif im['x0'] < 300:
                foto_panoramica_rel = f"data/monografie/img/{fs_key}/foto_panoramica.jpg"
                cropped.save(os.path.join(BASE_DIR, foto_panoramica_rel.replace("/", os.sep)), "JPEG", quality=90)
            else:
                foto_dettaglio_rel = f"data/monografie/img/{fs_key}/foto_dettaglio.jpg"
                cropped.save(os.path.join(BASE_DIR, foto_dettaglio_rel.replace("/", os.sep)), "JPEG", quality=90)

        if not foto_panoramica_rel and foto_dettaglio_rel:
            foto_panoramica_rel = foto_dettaglio_rel
            foto_dettaglio_rel = None

        entry = {
            "id": pf_info["id"],
            "fs_key": fs_key,
            "pf": pf_info["pf"],
            "foglio": pf_info["foglio"],
            "all": pf_info["all"],
            "codComune": pf_info["codComune"],
            "comune": comune_name or ("Rosolini" if pf_info["codComune"] == "H574" else ("Noto" if pf_info["codComune"] == "F943" else "")),
            "ufficio": ufficio_str,
            "particelle": particelle,
            "tecnico": tecnico_str,
            "desc_plani": desc_plani,
            "desc_alti": desc_alti,
            "note": notes_str,
            "pdf": f"data/monografie/pdf/{fname}",
            "pdf_name": fname,
            "has_official_mono": True,
            "estratto_mappa": estratto_mappa_rel,
            "foto_panoramica": foto_panoramica_rel,
            "foto_dettaglio": foto_dettaglio_rel,
            "pagine": page_images,
            "num_pagine": num_pages,
            "cassini_x": float(x_match.group(1)) if x_match else None,
            "cassini_y": float(y_match.group(1)) if y_match else None,
            "quota": float(q_match.group(1)) if q_match else None,
            "attendibilita": att_match.group(1) if att_match else None
        }

        print(f"Processed {fname} -> {entry['id']}: Mappa={bool(estratto_mappa_rel)}, FotoPan={bool(foto_panoramica_rel)}, FotoDet={bool(foto_dettaglio_rel)}, Pagine={len(page_images)}")
        return entry

def main():
    print("=== SCANSIONE MONOGRAFIE UFFICIALI AGENZIA DELLE ENTRATE ===")
    pdf_files = find_all_official_pdfs()
    print(f"Trovati {len(pdf_files)} PDF validi da elaborare.")

    index = {}
    for fname, fpath in pdf_files.items():
        try:
            entry = process_monografia(fname, fpath)
            if entry:
                index[entry["id"]] = entry
        except Exception as e:
            print(f"Errore su {fname}: {e}")

    with open(INDEX_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    with open(INDEX_JS_PATH, "w", encoding="utf-8") as f:
        f.write("/* Archivio Monografie Originali Agenzia delle Entrate - Studio Tecnico Giurato & Iacono */\n")
        f.write(f"window.MONOGRAFIE_INDEX = {json.dumps(index, ensure_ascii=False)};\n")

    print(f"\nCOMPLETATO: {len(index)} monografie originali con foto archiviate con successo!")
    print(f"Indice salvato in: {INDEX_JSON_PATH} e {INDEX_JS_PATH}")

if __name__ == "__main__":
    main()
