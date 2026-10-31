import os
import glob
import json
import math
import random
import re
import sys
from collections import defaultdict
from pyproj import Transformer

print("==========================================================")
print("  BUILDER PUNTI FIDUCIALI (TAF) REGIONE SICILIANA (9 PROV)")
print("==========================================================")

# 1. Proiezioni Geodetiche
to_utm = Transformer.from_crs("EPSG:4326", "EPSG:32633", always_xy=True)
utm_to_wgs = Transformer.from_crs("EPSG:32633", "EPSG:4326", always_xy=True)
gb_est_to_wgs = Transformer.from_crs("EPSG:3004", "EPSG:4326", always_xy=True)
gb_ovest_to_wgs = Transformer.from_crs("EPSG:3003", "EPSG:4326", always_xy=True)

# 2. Carica anagrafica comuni Sicilia (391 comuni)
with open("data/comuni_sicilia.json", encoding="utf-8") as f:
    comuni_info = json.load(f)
print(f"Anagrafica comuni caricata: {len(comuni_info)} comuni siciliani.")

# 3. Parsing di tutti i 9 file TAF provinciali ufficiali
taf_files = sorted(glob.glob("taf_raw/*.taf"))
print(f"File TAF provinciali rilevati: {len(taf_files)}")
if not taf_files:
    print("ERRORE: Nessun file .taf trovato in taf_raw/")
    sys.exit(1)

def parse_taf_line(l):
    if len(l) < 240:
        return None
    try:
        x_val = float(l[100:114].strip())
        y_val = float(l[114:126].strip())
        if abs(x_val) < 0.001 and abs(y_val) < 0.001:
            return None # Salta punti non calcolati (0, 0)
        return {
            "com": l[0:4].strip().upper(),
            "sez": l[4:5].strip(),
            "fg": int(l[5:11].strip()),
            "all": l[11:12].strip(),
            "pf": int(l[12:18].strip()),
            "part": l[18:30].strip(),
            "desc": l[30:100].strip(),
            "x": x_val,
            "y": y_val,
            "attp": int(l[126:129].strip() or "0"),
            "date": l[142:148].strip(),
            "caus": l[148:164].strip(),
            "descq": l[164:236].strip(),
            "atta": int(l[236:240].strip() or "0"),
            "quota": float(l[240:251].strip() or "0.0"),
        }
    except Exception:
        return None

all_records = []
for tf in taf_files:
    count = 0
    with open(tf, encoding="latin-1") as fh:
        for line in fh:
            p = parse_taf_line(line.rstrip("\r\n"))
            if p:
                all_records.append(p)
                count += 1
    print(f" -> {os.path.basename(tf)}: {count:,} PF validi letti")

print(f"Totale PF analizzati: {len(all_records):,}")

# Raggruppa per comune
by_com = defaultdict(list)
needed_parcels = defaultdict(dict)
for r in all_records:
    by_com[r["com"]].append(r)
    part = re.split(r"[/\s]", r["part"].lstrip("*").strip())[0].lstrip("0")
    if part:
        needed_parcels[r["com"]][(str(r["fg"]), part)] = (r["y"], r["x"])

# 4. Carica particelle di riferimento OnData (19_Sicilia.parquet)
print("\nCaricamento particelle di riferimento da 19_Sicilia.parquet...")
import pandas as pd
parquet_path = "taf_raw/19_Sicilia.parquet"
if not os.path.exists(parquet_path):
    print("Download 19_Sicilia.parquet...")
    import urllib.request
    urllib.request.urlretrieve(
        "https://raw.githubusercontent.com/ondata/dati_catastali/main/S_0000_ITALIA/anagrafica/19_Sicilia.parquet",
        parquet_path
    )

df = pd.read_parquet(parquet_path)
df["comune"] = df["comune"].astype(str).str.upper()
df["foglio"] = df["foglio"].astype(str).str.strip().str.lstrip("0")
df["particella"] = df["particella"].astype(str).str.strip().str.lstrip("0")

df["lon"] = (df["x"] / 1000000.0).round(6)
df["lat"] = (df["y"] / 1000000.0).round(6)

print("Creazione indice spaziale di controllo...")
df = df[df["comune"].isin(by_com.keys())]
df = df.drop_duplicates(subset=["comune", "foglio", "particella"])
df_indexed = df.set_index(["comune", "foglio", "particella"])
available_centroids = df_indexed[["lon", "lat"]].to_dict(orient="index")
print(f"Indice particellare pronto con {len(available_centroids):,} particelle catastali.")

# 5. RANSAC 2D Helmert Solver
def solve_helmert_2pts(s1, s2, d1, d2):
    dxs, dys = s2[0] - s1[0], s2[1] - s1[1]
    dxd, dyd = d2[0] - d1[0], d2[1] - d1[1]
    den = dxs * dxs + dys * dys
    if den == 0:
        return None
    a = (dxs * dxd + dys * dyd) / den
    b = (dxs * dyd - dys * dxd) / den
    tx = d1[0] - (a * s1[0] - b * s1[1])
    ty = d1[1] - (b * s1[0] + a * s1[1])
    return (a, b, tx, ty)

def ransac_helmert(src, dst):
    n = len(src)
    if n < 3:
        return None, 999.0, 0
    best_inliers = []
    best_params = None
    random.seed(42)

    for _ in range(300):
        i1, i2 = random.sample(range(n), 2)
        s1, s2 = src[i1], src[i2]
        d1, d2 = dst[i1], dst[i2]
        d_src = math.hypot(s2[0] - s1[0], s2[1] - s1[1])
        d_dst = math.hypot(d2[0] - d1[0], d2[1] - d1[1])
        if d_src < 150:
            continue
        scale = d_dst / d_src
        if abs(scale - 1.0) > 0.02:
            continue

        params = solve_helmert_2pts(s1, s2, d1, d2)
        if not params:
            continue
        a, b, tx, ty = params

        inl = []
        for k in range(n):
            ux = a * src[k][0] - b * src[k][1] + tx
            uy = b * src[k][0] + a * src[k][1] + ty
            res = math.hypot(ux - dst[k][0], uy - dst[k][1])
            if res <= 45.0:
                inl.append(res)

        if len(inl) > len(best_inliers):
            best_inliers = inl
            best_params = params

    if not best_params or len(best_inliers) < 3:
        return None, 999.0, 0

    best_inliers.sort()
    med_err = best_inliers[len(best_inliers) // 2]
    return best_params, med_err, len(best_inliers)

def apply_helmert(params, x, y):
    a, b, tx, ty = params[0], params[1], params[2], params[3]
    return a * x - b * y + tx, b * x + a * y + ty

def transform_gb(x_val, y_val):
    # Rileva ordinata Nord (~4.000.000 - 4.300.000) e coordinata Est
    if abs(x_val) > 3_000_000:
        northing, easting = x_val, y_val
    else:
        northing, easting = y_val, x_val

    if 1_000_000 <= easting < 2_000_000:
        return gb_ovest_to_wgs.transform(easting, northing)
    elif 2_000_000 <= easting < 3_200_000:
        return gb_est_to_wgs.transform(easting, northing)
    return None, None

# 6. Elaborazione Helmert per tutti i comuni siciliani
os.makedirs("data/pf", exist_ok=True)
index_pf = {}
helmert_by_com = {}
prov_fallbacks = {} # prov -> [params, axis]

print("\nCalcolo parametri Helmert per ogni comune...")

for com, pts in sorted(by_com.items()):
    info = comuni_info.get(com, {})
    prov = info.get("prov", "")

    cs_pts = [p for p in pts if abs(p["x"]) < 500_000 and abs(p["y"]) < 500_000]
    
    # Prova configurazione standard: TAF Y=Est, X=Nord
    src_yx, dst = [], []
    src_xy = []
    for p in cs_pts:
        part = re.split(r"[/\s]", p["part"].lstrip("*").strip())[0].lstrip("0")
        k = (com, str(p["fg"]), part)
        coords = available_centroids.get(k)
        if coords:
            e, n = to_utm.transform(coords["lon"], coords["lat"])
            src_yx.append((p["y"], p["x"]))
            src_xy.append((p["x"], p["y"]))
            dst.append((e, n))

    best_p, best_inl, best_axis = None, 0, "YX"
    if len(src_yx) >= 4:
        p_yx, err_yx, n_yx = ransac_helmert(src_yx, dst)
        if p_yx and n_yx > best_inl:
            best_p, best_inl, best_axis = p_yx, n_yx, "YX"

        p_xy, err_xy, n_xy = ransac_helmert(src_xy, dst)
        if p_xy and n_xy > best_inl:
            best_p, best_inl, best_axis = p_xy, n_xy, "XY"

    if best_p:
        helmert_by_com[com] = [float(x) for x in best_p] + [best_axis]
        if prov and prov not in prov_fallbacks:
            prov_fallbacks[prov] = helmert_by_com[com]

print(f"Helmert calcolato direttamente con RANSAC per {len(helmert_by_com)} comuni.")
print(f"Fallback provinciali disponibili per {len(prov_fallbacks)} province.")

# 7. Generazione file PF per ciascuno dei 391 comuni
print("\nGenerazione file geo-referenziati per tutti i 391 comuni...")
processed_comuni = 0
total_georeferenced = 0
all_combined = []

for com, pts in sorted(by_com.items()):
    info = comuni_info.get(com, {})
    name = info.get("shortName", com)
    prov = info.get("prov", "")

    h_entry = helmert_by_com.get(com) or prov_fallbacks.get(prov)
    params = h_entry[:4] if h_entry else None
    axis = h_entry[4] if (h_entry and len(h_entry) > 4) else "YX"

    out = []
    for p in pts:
        lat = lon = None
        acc = None
        sistema = "Cassini-Soldner"

        # Controlla se Gauss-Boaga
        if abs(p["x"]) > 1_000_000 or abs(p["y"]) > 1_000_000:
            sistema = "Gauss-Boaga"
            lon_gb, lat_gb = transform_gb(p["x"], p["y"])
            if lon_gb is not None and lat_gb is not None:
                lon, lat = lon_gb, lat_gb
                acc = 3.0
        elif params:
            # Cassini-Soldner via Helmert
            if axis == "XY":
                src_e, src_n = p["x"], p["y"]
            else:
                src_e, src_n = p["y"], p["x"]

            e, n = apply_helmert(params, src_e, src_n)
            lon, lat = utm_to_wgs.transform(e, n)
            acc = 15.0

        # Validazione geografica per la Sicilia (isole incluse: Pelagie 35.5N a Messina 38.3N)
        if lat is None or lon is None or not (35.0 <= lat <= 38.9 and 11.8 <= lon <= 15.8):
            continue

        fg_code = f"{p['fg']:04d}{p['all']}"
        date_str = p["date"]
        formatted_date = ""
        if len(date_str) == 6:
            yy = int(date_str[4:6])
            yr = 1900 + yy if yy > 50 else 2000 + yy
            formatted_date = f"{date_str[0:2]}/{date_str[2:4]}/{yr}"

        pf_obj = {
            "id": f"PF{p['pf']:02d}/{fg_code}/{com}",
            "pf": f"PF{p['pf']:02d}",
            "foglio": p["fg"],
            "all": p["all"],
            "codComune": com,
            "comune": name,
            "prov": prov,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "acc": acc,
            "sis": sistema,
            "nord": p["x"],
            "est": p["y"],
            "x": p["x"],
            "y": p["y"],
            "quota": p["quota"],
            "desc": p["desc"],
            "descq": p["descq"],
            "attp": p["attp"],
            "atta": p["atta"],
            "attendibilita": f"Livello {p['attp']} (Catasto Terreni)" if p["attp"] else "Attendibilità Ordinaria",
            "part": p["part"],
            "data": formatted_date,
            "caus": p["caus"],
        }
        out.append(pf_obj)
        all_combined.append(pf_obj)

    if out:
        json_str = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
        with open(f"data/pf/{com}.json", "w", encoding="utf-8") as fh:
            fh.write(json_str)
        with open(f"data/pf/{com}.js", "w", encoding="utf-8") as fh:
            fh.write(f'window.PF_DATA=window.PF_DATA||{{}};window.PF_DATA["{com}"]={json_str};')

        lats = [o["lat"] for o in out]
        lons = [o["lon"] for o in out]
        index_pf[com] = {
            "name": name,
            "prov": prov,
            "n": len(out),
            "bbox": [min(lats), min(lons), max(lats), max(lons)],
        }
        processed_comuni += 1
        total_georeferenced += len(out)

# 8. Salvataggio indici globali
with open("data/pf/index.json", "w", encoding="utf-8") as fh:
    json.dump(index_pf, fh, ensure_ascii=False, separators=(",", ":"))
with open("data/pf/index.js", "w", encoding="utf-8") as fh:
    fh.write("window.PF_INDEX=" + json.dumps(index_pf, ensure_ascii=False, separators=(",", ":")) + ";")

with open("data/pf/helmert.json", "w", encoding="utf-8") as fh:
    json.dump(helmert_by_com, fh, ensure_ascii=False, separators=(",", ":"))
with open("data/pf/helmert.js", "w", encoding="utf-8") as fh:
    fh.write("window.HELMERT_PARAMS=" + json.dumps(helmert_by_com, ensure_ascii=False, separators=(",", ":")) + ";")

# File combinato compatibile ottimizzato (<50MB per compatibilità totale con GitHub)
print(f"Salvataggio archivio combinato: {len(all_combined):,} punti fiduciali...")
comb_opt = []
for p in all_combined:
    comb_opt.append({
        "id": p["id"], "pf": p["pf"], "foglio": p["foglio"], "all": p["all"],
        "codComune": p["codComune"], "comune": p["comune"], "prov": p["prov"],
        "lat": p["lat"], "lon": p["lon"], "acc": p["acc"], "sis": p["sis"],
        "nord": p["nord"], "est": p["est"], "quota": p["quota"],
        "desc": p["desc"], "descq": p["descq"], "attp": p["attp"], "atta": p["atta"],
        "part": p["part"], "data": p["data"], "caus": p["caus"]
    })
combined_json = json.dumps(comb_opt, ensure_ascii=False, separators=(",", ":"))
with open("data/punti_fiduciali.json", "w", encoding="utf-8") as fh:
    fh.write(combined_json)
with open("data/punti_fiduciali.js", "w", encoding="utf-8") as fh:
    fh.write("window.ALL_PF_DATA=" + combined_json + ";")

print("\n==========================================================")
print(f" ELABORAZIONE COMPLETATA CON SUCCESSO!")
print(f" - Comuni siciliani completati: {processed_comuni} / 391")
print(f" - Punti Fiduciali totali georeferenziati: {total_georeferenced:,}")
print("==========================================================")
