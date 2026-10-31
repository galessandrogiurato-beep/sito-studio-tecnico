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

    # Pages
    pages = []
    page_rows = re.findall(r'<tr[^>]*id="([a-zA-Z0-9_\-\/\.\?&=#%]+)"[^>]*>.*?<span class="count"[^>]*>([0-9\.,]+)</span>', html, re.DOTALL)
    for p, c in page_rows:
        if p != "TOTAL":
            pages.append({"path": p, "views": c})

    return {
        "connected": True,
        "total_visits": total_visits,
        "pages": pages
    }

if __name__ == "__main__":
    res = get_stats()
    print(json.dumps(res, indent=2))
