import os
import json
import pandas as pd

url = "https://raw.githubusercontent.com/ondata/dati_catastali/main/S_0000_ITALIA/anagrafica/19_Sicilia.parquet"
print("Reading parquet file from OnData...")
df = pd.read_parquet(url)

target_comuni = ["H574", "F943", "E366", "F258", "H163", "A522", "I535", "G211", "G953", "I754"]
code_mapping = {"G224": "G211", "G923": "G953"}

comune_col = "comune" if "comune" in df.columns else [c for c in df.columns if "comun" in c.lower()][0]
foglio_col = "foglio" if "foglio" in df.columns else [c for c in df.columns if "fogli" in c.lower()][0]
particella_col = "particella" if "particella" in df.columns else [c for c in df.columns if "particell" in c.lower()][0]
x_col = "x" if "x" in df.columns else [c for c in df.columns if c.lower() == 'x'][0]
y_col = "y" if "y" in df.columns else [c for c in df.columns if c.lower() == 'y'][0]

os.makedirs("catasto", exist_ok=True)

for comune in target_comuni:
    sub = df[df[comune_col].astype(str).str.upper() == comune]
    if sub.empty:
        print(f"Warning: No data found for comune {comune}")
        continue
    
    fogli_dict = {}
    particelle_dict = {}
    
    sub = sub.copy()
    sub['lon'] = sub[x_col] / 1000000.0
    sub['lat'] = sub[y_col] / 1000000.0
    
    for foglio_raw, group in sub.groupby(foglio_col):
        foglio_clean = str(foglio_raw).strip().lstrip('0')
        if not foglio_clean:
            foglio_clean = '0'
            
        mean_lat = round(float(group['lat'].mean()), 6)
        mean_lon = round(float(group['lon'].mean()), 6)
        fogli_dict[foglio_clean] = [mean_lat, mean_lon]
        
        part_map = {}
        for _, row in group.iterrows():
            part_raw = str(row[particella_col]).strip().lstrip('0')
            if not part_raw or part_raw.lower() == 'nan':
                continue
            lat_p = round(float(row['lat']), 6)
            lon_p = round(float(row['lon']), 6)
            part_map[part_raw] = [lat_p, lon_p]
            
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
        
    print(f"Saved {comune}.json & {comune}.js ({len(fogli_dict)} fogli, {sum(len(v) for v in particelle_dict.values())} particelle)")

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

# Print exact coordinates for H574 Foglio 29 Particella 299
h574_path = os.path.join("catasto", "H574.json")
if os.path.exists(h574_path):
    with open(h574_path, "r", encoding="utf-8") as f:
        h574_data = json.load(f)
    coords_299 = h574_data.get("particelle", {}).get("29", {}).get("299")
    print(f"\n>>> VERIFICA H574 (Rosolini) Foglio 29 Particella 299: {coords_299}")

print("Cadastral index generation & JS export complete!")
