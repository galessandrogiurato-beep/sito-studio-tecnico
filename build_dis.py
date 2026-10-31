import os
import json

def process_dis():
    os.makedirs('data/dis', exist_ok=True)
    
    files = [('SR261024.dis', 'SR'), ('RG261024.dis', 'RG')]
    comune_baselines = {}
    
    for filename, prov in files:
        if not os.path.exists(filename):
            continue
        print(f"Processing {filename}...")
        with open(filename, 'r', encoding='latin-1') as f:
            for line in f:
                if len(line) < 55:
                    continue
                try:
                    c1 = line[0:4].strip().upper()
                    f1_str = line[4:10].strip()
                    a1 = line[10:12].strip()
                    p1_str = line[12:17].strip()
                    
                    c2 = line[18:22].strip().upper()
                    f2_str = line[22:28].strip()
                    a2 = line[28:30].strip()
                    p2_str = line[30:35].strip()
                    
                    prot = line[35:46].strip()
                    dist = float(line[46:63].strip())
                    
                    sqm_str = line[63:].strip()
                    sqm = float(sqm_str) if sqm_str else 0.02
                    
                    f1 = int(f1_str)
                    p1 = int(p1_str)
                    f2 = int(f2_str)
                    p2 = int(p2_str)
                    
                    id1 = f"PF{p1:02d}/{f1:04d}{a1}/{c1}"
                    id2 = f"PF{p2:02d}/{f2:04d}{a2}/{c2}"
                    
                    pair_key = "___".join(sorted([id1, id2]))
                    
                    for com in set([c1, c2]):
                        if com not in comune_baselines:
                            comune_baselines[com] = {}
                        if pair_key not in comune_baselines[com]:
                            comune_baselines[com][pair_key] = {
                                'count': 0,
                                'distSum': 0.0,
                                'sqmMin': 999.0,
                                'lastProt': prot
                            }
                        b = comune_baselines[com][pair_key]
                        b['count'] += 1
                        b['distSum'] += dist
                        if sqm < b['sqmMin']:
                            b['sqmMin'] = sqm
                        b['lastProt'] = prot
                except Exception:
                    continue
                    
    index = {}
    for com, baselines in comune_baselines.items():
        com_result = {}
        for pair_key, b in baselines.items():
            com_result[pair_key] = {
                'd': round(b['distSum'] / b['count'], 3),
                'n': b['count'],
                's': round(b['sqmMin'], 3) if b['sqmMin'] != 999.0 else 0.02,
                'p': b['lastProt']
            }
        json_path = f"data/dis/{com}.json"
        js_path = f"data/dis/{com}.js"
        with open(json_path, 'w', encoding='utf-8') as out:
            json.dump(com_result, out)
        with open(js_path, 'w', encoding='utf-8') as out:
            out.write(f'window.DIS_DATA = window.DIS_DATA || {{}}; window.DIS_DATA["{com}"] = {json.dumps(com_result)};\n')
        index[com] = len(com_result)
        
    with open('data/dis/index.json', 'w', encoding='utf-8') as out:
        json.dump(index, out, indent=2)
    with open('data/dis/index.js', 'w', encoding='utf-8') as out:
        out.write(f'window.DIS_INDEX = {json.dumps(index)};\n')
        
    print(f"DIS generation complete! {len(index)} communes. Rosolini (H574): {index.get('H574', 0)} baselines.")

if __name__ == '__main__':
    process_dis()
