"""
Costruisce l'archivio dei Punti Fiduciali reali per il WebGIS a partire dai file TAF
ufficiali dell'Agenzia delle Entrate (es. SIRACUSA.taf, RAGUSA.taf).
Usa un parser a larghezza fissa (100% delle righe riconosciute) e RANSAC per la rototraslazione.
"""
import json
import math
import os
import random
import re
import sys
from collections import defaultdict

from pyproj import Transformer

to_utm = Transformer.from_crs("EPSG:4326", "EPSG:32633", always_xy=True)
utm_to_wgs = Transformer.from_crs("EPSG:32633", "EPSG:4326", always_xy=True)
gb_to_wgs = Transformer.from_crs("EPSG:3004", "EPSG:4326", always_xy=True)

comuni_info = json.load(open("data/comuni_sicilia.json", encoding="utf-8"))


def parse_taf_line(l):
    if len(l) < 240:
        return None
    try:
        return {
            "com": l[0:4].strip().upper(),
            "sez": l[4:5].strip(),
            "fg": int(l[5:11].strip()),
            "all": l[11:12].strip(),
            "pf": int(l[12:18].strip()),
            "part": l[18:30].strip(),
            "desc": l[30:100].strip(),
            "x": float(l[100:114].strip()),
            "y": float(l[114:126].strip()),
            "attp": int(l[126:129].strip() or "0"),
            "date": l[142:148].strip(),
            "caus": l[148:164].strip(),
            "descq": l[164:236].strip(),
            "atta": int(l[236:240].strip() or "0"),
            "quota": float(l[240:251].strip() or "0.0"),
        }
    except Exception:
        return None


def parse_taf(path):
    out = []
    with open(path, encoding="latin-1") as fh:
        for line in fh:
            p = parse_taf_line(line.rstrip("\r\n"))
            if p:
                out.append(p)
    print(f"{path}: {len(out)} PF reali letti")
    return out


def ransac_helmert(src, dst):
    """
    RANSAC per Similarita' 2D: trova la scala (~1.0), rotazione e traslazione
    tra coordinate Cassini-Soldner (Est, Nord) e UTM EPSG:32633 (Est, Nord).
    """
    n = len(src)
    if n < 3:
        return None, 999.0, 0

    best_inliers = []
    best_params = None
    random.seed(42)

    # Campionamento di coppie di punti distanti almeno 250m
    for _ in range(300):
        i1, i2 = random.sample(range(n), 2)
        s1, s2 = src[i1], src[i2]
        d1, d2 = dst[i1], dst[i2]
        d_src = math.hypot(s2[0] - s1[0], s2[1] - s1[1])
        d_dst = math.hypot(d2[0] - d1[0], d2[1] - d1[1])
        if d_src < 250:
            continue
        scale = d_dst / d_src
        if abs(scale - 1.0) > 0.015:  # La scala Cassini-UTM e' sempre entro 1.5%
            continue

        # Parametri Helmert (a, b)
        dxs, dys = s2[0] - s1[0], s2[1] - s1[1]
        dxd, dyd = d2[0] - d1[0], d2[1] - d1[1]
        den = dxs * dxs + dys * dys
        a = (dxs * dxd + dys * dyd) / den
        b = (dxs * dyd - dys * dxd) / den
        tx = d1[0] - (a * s1[0] - b * s1[1])
        ty = d1[1] - (b * s1[0] + a * s1[1])

        # Conta inlier entro 35 metri (distanza tipica tra baricentro particella e vertice PF)
        inl = []
        for k in range(n):
            ux = a * src[k][0] - b * src[k][1] + tx
            uy = b * src[k][0] + a * src[k][1] + ty
            res = math.hypot(ux - dst[k][0], uy - dst[k][1])
            if res <= 35.0:
                inl.append(res)

        if len(inl) > len(best_inliers):
            best_inliers = inl
            best_params = (a, b, tx, ty)

    if not best_params or len(best_inliers) < 4:
        return None, 999.0, 0

    best_inliers.sort()
    med_err = best_inliers[len(best_inliers) // 2]
    return best_params, med_err, len(best_inliers)


def apply_helmert(params, x, y):
    a, b, tx, ty = params
    return a * x - b * y + tx, b * x + a * y + ty


def main(files):
    records = []
    for f in files:
        records.extend(parse_taf(f))

    by_com = defaultdict(list)
    for r in records:
        by_com[r["com"]].append(r)

    os.makedirs("data/pf", exist_ok=True)
    index = {}
    report = []
    all_combined_pfs = []
    helmert_by_com = {}

    for com, pts in sorted(by_com.items()):
        cad_path = os.path.join("catasto", f"{com}.json")
        cad = json.load(open(cad_path, encoding="utf-8")) if os.path.exists(cad_path) else None
        info = comuni_info.get(com, {})
        name = info.get("shortName", com)
        prov = info.get("prov", "")

        cs_pts = [p for p in pts if abs(p["x"]) < 1_000_000 and abs(p["y"]) < 1_000_000]
        gb_pts = [p for p in pts if p not in cs_pts]

        params, med_err, n_inl = None, None, 0
        if cad and len(cs_pts) >= 4:
            src, dst = [], []
            for p in cs_pts:
                part = re.split(r"[/\s]", p["part"].lstrip("*").strip())[0]
                fg_key = str(p["fg"])
                coords = (cad.get("particelle", {}).get(fg_key, {}) or {}).get(part)
                if coords:
                    e, n = to_utm.transform(coords[1], coords[0])
                    # In TAF Cassini: Y = Est, X = Nord
                    src.append((p["y"], p["x"]))
                    dst.append((e, n))

            if len(src) >= 4:
                params, med_err, n_inl = ransac_helmert(src, dst)
                if params:
                    helmert_by_com[com] = [float(x) for x in params]
                    scale = math.hypot(params[0], params[1])
                    report.append(
                        f"{com} {name:28s} PF={len(pts):5d} controlli={len(src):5d} "
                        f"inlier={n_inl:5d} err_med={med_err:5.1f}m scala={scale:.5f}"
                    )

        out = []
        for p in pts:
            lat = lon = None
            acc = None
            sistema = "Cassini-Soldner"
            if p in gb_pts:
                sistema = "Gauss-Boaga"
                lon, lat = gb_to_wgs.transform(p["y"], p["x"])
                acc = 3
            elif params:
                # Se il punto e' invertito (anomalia storica di inserimento tipo X > Y positivo)
                e_src, n_src = p["y"], p["x"]
                if p["x"] > 0 and p["y"] < 0:
                    e_src, n_src = p["x"], p["y"]
                e, n = apply_helmert(params, e_src, n_src)
                lon, lat = utm_to_wgs.transform(e, n)
                acc = round(med_err, 1)

            if lat is None:
                continue

            fg_code = f"{p['fg']:04d}{p['all']}"
            date_str = p['date']
            formatted_date = ""
            if len(date_str) == 6:
                formatted_date = f"{date_str[0:2]}/{date_str[2:4]}/20{date_str[4:6]}"

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
            all_combined_pfs.append(pf_obj)

        if out:
            json_str = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
            with open(f"data/pf/{com}.json", "w", encoding="utf-8") as fh:
                fh.write(json_str)
            with open(f"data/pf/{com}.js", "w", encoding="utf-8") as fh:
                fh.write(f'window.PF_DATA=window.PF_DATA||{{}};window.PF_DATA["{com}"]={json_str};')
            lats = [o["lat"] for o in out]
            lons = [o["lon"] for o in out]
            index[com] = {
                "name": name,
                "prov": prov,
                "n": len(out),
                "acc": round(med_err, 1) if med_err else None,
                "bbox": [min(lats), min(lons), max(lats), max(lons)],
            }

    with open("data/pf/index.json", "w", encoding="utf-8") as fh:
        json.dump(index, fh, ensure_ascii=False, separators=(",", ":"))
    with open("data/pf/index.js", "w", encoding="utf-8") as fh:
        fh.write("window.PF_INDEX=" + json.dumps(index, ensure_ascii=False, separators=(",", ":")) + ";")

    with open("data/pf/helmert.json", "w", encoding="utf-8") as fh:
        json.dump(helmert_by_com, fh, ensure_ascii=False, separators=(",", ":"))
    with open("data/pf/helmert.js", "w", encoding="utf-8") as fh:
        fh.write("window.HELMERT_PARAMS=" + json.dumps(helmert_by_com, ensure_ascii=False, separators=(",", ":")) + ";")

    # Salva anche il file combinato data/punti_fiduciali.json e .js per compatibilita'
    combined_json = json.dumps(all_combined_pfs, ensure_ascii=False, separators=(",", ":"))
    with open("data/punti_fiduciali.json", "w", encoding="utf-8") as fh:
        fh.write(combined_json)
    with open("data/punti_fiduciali.js", "w", encoding="utf-8") as fh:
        fh.write("window.ALL_PF_DATA=" + combined_json + ";")

    print("\n--- REPORT TRASFORMAZIONE CASISTICA TAF UFFICIALE ---")
    print("\n".join(report))
    print(f"\nComuni elaborati: {len(index)}  |  PF totali georeferenziati: {len(all_combined_pfs)}")


if __name__ == "__main__":
    main(sys.argv[1:] or ["SIRACUSA.taf", "RAGUSA.taf"])
