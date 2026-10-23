"""Builds a single-file copy of the game (no online play) from public/index.html and public/game.js.
Usage: python3 tools/build_artifact.py OUTPUT.html"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
page = (root / 'public/index.html').read_text()
art = (root / 'public/art.js').read_text().replace('export const ART', 'const ART', 1)
game = art + '\n' + (root / 'public/game.js').read_text().replace("import {ART} from './art.js';\n", '', 1).replace('export function createGame', 'function createGame', 1)
head = re.search(r'<head>(.*)</head>', page, re.S).group(1)
body = re.search(r'<body>(.*)</body>', page, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head).strip()
title = re.search(r'<title>.*?</title>', head).group(0)
head = head.replace(title, '').strip()
body = re.sub(r'<script type="module">.*?</script>', '', body, flags=re.S).strip()
out = f'{title}\n<meta name="claude:viewport-fit-sides" content="cover">\n{head}\n{body}\n<script>\n{game}\ncreateGame();\n</script>\n'
pathlib.Path(sys.argv[1]).write_text(out)
print('wrote', sys.argv[1], len(out), 'bytes')
