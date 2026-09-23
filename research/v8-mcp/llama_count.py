"""Count Llama-2 tokens for the transcripts cost.mjs measured, so published
Llama-2 conversation sizes (LENGTHS.md) can be converted to Claude tokens with a
ratio measured on identical text.

Rebuilds each transcript exactly as cost.mjs does: the first successful record
per (scenario, model), rendered as "User: ...\n\nAssistant: ..." turns.

    pip install tokenizers
    curl -L -o llama2-tokenizer.json \
      https://huggingface.co/hf-internal-testing/llama-tokenizer/resolve/main/tokenizer.json
    python3 llama_count.py capture.jsonl llama2-tokenizer.json > llama_counts.json
"""
import json
import sys
from pathlib import Path

from tokenizers import Tokenizer

here = Path(__file__).parent
capture, tok_path = sys.argv[1], sys.argv[2]
tok = Tokenizer.from_file(tok_path)
scenarios = {s["id"]: s for s in json.loads((here / "scenarios.json").read_text())["scenarios"]}

seen, out = set(), {}
for line in Path(capture).read_text().splitlines():
    r = json.loads(line)
    key = f'{r["scenario"]}|{r["model"]}'
    if not r["ok"] or key in seen:
        continue
    seen.add(key)
    s = scenarios[r["scenario"]]
    text = "\n\n".join(f'User: {s["turns"][i]}\n\nAssistant: {t.get("reply") or ""}' for i, t in enumerate(r["turns"]))
    out[key] = {"chars": len(text), "llama2_tokens": len(tok.encode(text, add_special_tokens=False).ids)}

json.dump(out, sys.stdout, indent=1)
