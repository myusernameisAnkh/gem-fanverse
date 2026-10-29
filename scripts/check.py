"""Check static references without third-party packages or network access."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys

root = Path(__file__).resolve().parent.parent
errors = []

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                errors.append("Duplicate HTML id: " + attrs["id"])
            self.ids.add(attrs["id"])
        for name in ["src", "href"]:
            if name in attrs:
                self.links.append(attrs[name])

page = Page()
page.feed((root / "index.html").read_text(encoding="utf-8"))
for ref in page.links:
    if ref.startswith("#"):
        if ref[1:] and ref[1:] not in page.ids:
            errors.append("Missing anchor: " + ref)
        continue
    parts = urlsplit(ref)
    if parts.scheme or parts.netloc:
        continue
    if parts.path.startswith("/"):
        errors.append("Absolute site path is not GitHub-project friendly: " + ref)
    if parts.path and not (root / unquote(parts.path)).is_file():
        errors.append("Missing HTML resource: " + ref)

data = (root / "data.js").read_text(encoding="utf-8")
for cover in set(re.findall(r'cover:"([\w-]+)"', data)):
    if not (root / "assets/covers" / (cover + ".jpg")).is_file():
        errors.append("Missing song cover: " + cover)
for ref in re.findall(r'file:"([^"]+)"', data):
    if not (root / ref).is_file():
        errors.append("Missing data asset: " + ref)
for name in ["rock-star", "silver-stage", "guitar-dream"]:
    if not (root / "assets/art" / (name + ".png")).is_file():
        errors.append("Missing fan art: " + name)
for filename in ["photo-credits.json", "cover-credits.json"]:
    records = json.loads((root / "assets" / filename).read_text(encoding="utf-8"))
    for item in records:
        if "error" in item:
            errors.append("Unresolved source record: " + str(item))
        if not (root / item["file"]).is_file():
            errors.append("Missing credited asset: " + item["file"])
for filename in [".nojekyll", "config.js", "LICENSE", "README.md"]:
    if not (root / filename).is_file():
        errors.append("Missing project file: " + filename)
if errors:
    print("Static checks FAILED:\n" + "\n".join(errors))
    sys.exit(1)
print(f"Static checks passed: {len(page.ids)} HTML IDs, local assets, anchors and credit manifests.")
