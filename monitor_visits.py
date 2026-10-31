import urllib.request
import re
import json

def get_stats():
    url = "https://alessandro.goatcounter.com"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return {"error": str(e)}

    # Total visits
    total_match = re.search(r'class="hide js-total">([0-9\.,]+)<', html)
    total_visits = total_match.group(1) if total_match else "0"

    # Extract pages from table rows
    pages = []
    # Match rows like <tr id="/" ... data-count="4"
    for m in re.finditer(r'<tr\s+id="([^"]+)"[^>]*data-count="([0-9]+)"', html):
        path = m.group(1).strip()
        count = m.group(2).strip()
        if not path.startswith("TOTAL") and not path.isdigit():
            pages.append({"path": path, "views": int(count)})

    return {
        "connected": True,
        "total_visits": int(total_visits) if total_visits.isdigit() else total_visits,
        "pages": pages
    }

if __name__ == "__main__":
    res = get_stats()
    print(json.dumps(res, indent=2))
