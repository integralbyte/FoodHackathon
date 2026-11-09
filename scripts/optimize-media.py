"""Create web renditions without changing the original artwork. Requires Pillow."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
destination = root / "assets/web"
destination.mkdir(exist_ok=True)
products = json.loads((root / "src/shelf-products.json").read_text())
jobs = {
    f"assets/competitors/{p['image']}": (768, 85, False)
    for p in products
    if p.get("image") and not p.get("illustration") and p["id"] != "sorami"
}
jobs.update({
    "assets/sorami-logo-transparent.png": (1254, 100, True),
    "assets/sorami-opening-shelf.png": (1672, 88, False),
    "assets/sorami-package-reference.png": (1536, 94, False),
    "assets/sorami-spicy-garlic-kit.png": (1536, 94, False),
    "assets/cornell-university-seal.png": (222, 100, True),
    "assets/sorami-spicy-garlic-cutout.png": (768, 90, False),
    "assets/sorami-umami-chicken-cutout.png": (768, 90, False),
})
manifest = {}
before = after = 0
for source, (size, quality, lossless) in sorted(jobs.items()):
    image = Image.open(root / source).convert("RGBA")
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, "WEBP", quality=quality, lossless=lossless, method=6, exact=True)
    content = buffer.getvalue()
    name = f"{Path(source).stem}.{sha256(content).hexdigest()[:12]}.webp"
    (destination / name).write_bytes(content)
    manifest[source] = {"src": f"assets/web/{name}", "width": image.width, "height": image.height}
    before += (root / source).stat().st_size
    after += len(content)
(destination / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Web images: {before / 1e6:.2f} MB → {after / 1e6:.2f} MB. Originals retained.")
