"""Replace em-dashes in all brief JSON files with safe alternatives."""
import os, json, re

BRIEFS_DIR = os.path.dirname(os.path.abspath(__file__))

def fix_emdash_in_text(text: str) -> str:
    # Replace " — " (with surrounding spaces) with ". " or ", "
    # Use ". " when preceded by a lowercase letter completing a clause
    # Use ", " as the safer default
    return text.replace(" — ", ", ")

def fix_node(node):
    """Recursively fix em-dashes in TipTap JSON nodes."""
    if not isinstance(node, dict):
        return node
    if node.get("type") == "text" and isinstance(node.get("text"), str):
        node["text"] = fix_emdash_in_text(node["text"])
    if "content" in node and isinstance(node["content"], list):
        node["content"] = [fix_node(n) for n in node["content"]]
    if "attrs" in node and isinstance(node["attrs"], dict):
        for k, v in node["attrs"].items():
            if isinstance(v, str):
                node["attrs"][k] = fix_emdash_in_text(v)
    return node

fixed_count = 0
for fname in sorted(os.listdir(BRIEFS_DIR)):
    if not fname.endswith(".json") or fname.startswith("_"):
        continue
    path = os.path.join(BRIEFS_DIR, fname)
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    changed = False

    # Fix excerpt
    if "excerpt" in data and isinstance(data["excerpt"], str):
        fixed = fix_emdash_in_text(data["excerpt"])
        if fixed != data["excerpt"]:
            data["excerpt"] = fixed
            changed = True

    # Fix subtitle
    if "subtitle" in data and isinstance(data["subtitle"], str):
        fixed = fix_emdash_in_text(data["subtitle"])
        if fixed != data["subtitle"]:
            data["subtitle"] = fixed
            changed = True

    # Fix body
    if "body" in data:
        before = json.dumps(data["body"])
        data["body"] = fix_node(data["body"])
        after = json.dumps(data["body"])
        if before != after:
            changed = True

    if changed:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Fixed: {fname}")
        fixed_count += 1

print(f"\nTotal files fixed: {fixed_count}")
