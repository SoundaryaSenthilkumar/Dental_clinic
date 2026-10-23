#!/usr/bin/env python3
"""Writes frontend/src/data/frameManifest.json, mapping each web frame to its original file name.

Usage: python3 tools/generate-manifest.py /path/to/extracted/original/frames
The script checks that every frame exists in both output folders before writing the manifest.
"""
import hashlib, json, os, re, sys

src = sys.argv[1] if len(sys.argv) > 1 else sys.exit("Usage: generate-manifest.py <folder with original JPGs>")
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
names = sorted(
    (n for n in os.listdir(src) if n.lower().endswith(".jpg")),
    key=lambda n: int(re.search(r"(\d+)", n).group(1)),
)

frames, hashes = [], {}
for i, name in enumerate(names, start=1):
    file = f"frame_{i:03d}.jpg"
    for folder in ("frames", "frames-sm"):
        if not os.path.isfile(os.path.join(root, "public/assets", folder, file)):
            sys.exit(f"Missing {folder}/{file}. Run tools/build-frames.sh first.")
    frames.append({"index": i - 1, "file": file, "source": name})
    digest = hashlib.md5(open(os.path.join(src, name), "rb").read()).hexdigest()
    hashes.setdefault(digest, []).append(name)

manifest = {
    "description": "Web frame N is the N-th original frame, in numerical order. Desktop: 1920x1080, mobile: 1280x720.",
    "count": len(frames),
    "width": 1920,
    "height": 1080,
    "frames": frames,
    "identicalFrameGroups": [g for g in hashes.values() if len(g) > 1],
}
with open(os.path.join(root, "src/data/frameManifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2)
print(f"Manifest written: {len(frames)} frames, {len(manifest['identicalFrameGroups'])} groups of identical source frames")
