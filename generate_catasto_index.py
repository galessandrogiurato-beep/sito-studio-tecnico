import os
import json
import pandas as pd

url = "https://raw.githubusercontent.com/ondata/dati_catastali/main/S_0000_ITALIA/anagrafica/19_Sicilia.parquet"
print("Reading parquet file from OnData...")
df = pd.read_parquet(url)

target_comuni = [
    # Provincia di Siracusa (21 comuni)
    "A494", # Augusta
    "A522", # Avola
    "B237", # Buccheri
    "B287", # Buscemi
    "B603", # Canicattini Bagni
    "B787", # Carlentini
    "C006", # Cassaro
    "D540", # Ferla
    "D636", # Floridia
    "D768", # Francofonte
    "E532", # Lentini
    "F107", # Melilli
    "F943", # Noto
    "G211", # Pachino
    "G267", # Palazzolo Acreide
    "M257", # Portopalo di Capo Passero
    "M279", # Priolo Gargallo
    "H574", # Rosolini
    "I754", # Siracusa
    "I785", # Solarino
    "I864", # Sortino
    # Provincia di Ragusa (12 comuni)
    "A014", # Acate
    "C612", # Chiaramonte Gulfi
    "C927", # Comiso
    "E016", # Giarratana
    "E366", # Ispica
    "F258", # Modica
    "F610", # Monterosso Almo
    "G953", # Pozzallo
    "H163", # Ragusa
    "I178", # Santa Croce Camerina
    "I535", # Scicli
    "M088", # Vittoria
]
code_mapping = {"G224": "G211", "G923": "G953"}

comune_col = "comune" if "comune" in df.columns else [c for c in df.columns if "comun" in c.lower()][0]
foglio_col = "foglio" if "foglio" in df.columns else [c for c in df.columns if "fogli" in c.lower()][0]
particella_col = "particella" if "particella" in df.columns else [c for c in df.columns if "particell" in c.lower()][0]
x_col = "x" if "x" in df.columns else [c for c in df.columns if c.lower() == 'x'][0]
y_col = "y" if "y" in df.columns else [c for c in df.columns if c.lower() == 'y'][0]

os.makedirs("catasto", exist_ok=True)

df[comune_col] = df[comune_col].astype(str).str.upper()
df_sub = df[df[comune_col].isin(target_comuni)].copy()
df_sub['lon'] = (df_sub[x_col] / 1000000.0).round(6)
df_sub['lat'] = (df_sub[y_col] / 1000000.0).round(6)

for comune in target_comuni:
    sub = df_sub[df_sub[comune_col] == comune]
    if sub.empty:
        print(f"Warning: No data found for comune {comune}")
        continue
    
    fogli_dict = {}
    particelle_dict = {}
    
    for foglio_raw, group in sub.groupby(foglio_col):
        foglio_clean = str(foglio_raw).strip().lstrip('0')
        if not foglio_clean:
            foglio_clean = '0'
            
        mean_lat = round(float(group['lat'].mean()), 6)
        mean_lon = round(float(group['lon'].mean()), 6)
        fogli_dict[foglio_clean] = [mean_lat, mean_lon]
        
        part_map = {}
        for p_raw, lat_p, lon_p in zip(group[particella_col], group['lat'], group['lon']):
            part_clean = str(p_raw).strip().lstrip('0')
            if not part_clean or part_clean.lower() == 'nan':
                continue
            part_map[part_clean] = [float(lat_p), float(lon_p)]
            
        if part_map:
            if foglio_clean not in particelle_dict:
                particelle_dict[foglio_clean] = {}
            particelle_dict[foglio_clean].update(part_map)
            
    out_data = {
        "fogli": fogli_dict,
        "particelle": particelle_dict
    }
    
    json_path = os.path.join("catasto", f"{comune}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False)
        
    js_path = os.path.join("catasto", f"{comune}.js")
    js_content = f"window.CATASTO_INDEX = window.CATASTO_INDEX || {{}};\nwindow.CATASTO_INDEX[\"{comune}\"] = {json.dumps(out_data, ensure_ascii=False)};"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    c_lat = round(float(sub['lat'].mean()), 5)
    c_lon = round(float(sub['lon'].mean()), 5)
    print(f"Saved {comune}.json & {comune}.js ({len(fogli_dict)} fogli, {sum(len(v) for v in particelle_dict.values())} particelle) center=[{c_lat}, {c_lon}]")

# Also save aliases for G224 -> G211 and G923 -> G953
for alias, real in code_mapping.items():
    real_json = os.path.join("catasto", f"{real}.json")
    alias_json = os.path.join("catasto", f"{alias}.json")
    real_js = os.path.join("catasto", f"{real}.js")
    alias_js = os.path.join("catasto", f"{alias}.js")
    
    if os.path.exists(real_json):
        with open(real_json, "r", encoding="utf-8") as rf:
            content_json = rf.read()
        with open(alias_json, "w", encoding="utf-8") as wf:
            wf.write(content_json)
            
    if os.path.exists(real_js):
        with open(real_js, "r", encoding="utf-8") as rf:
            content_js = rf.read().replace(f'["{real}"]', f'["{alias}"]')
        with open(alias_js, "w", encoding="utf-8") as wf:
            wf.write(content_js)
        print(f"Created alias {alias} from {real}")

print("Cadastral index generation & JS export complete!")
