import json
import os

achv_dir = r"c:\Users\makiv\Desktop\Переводы 2\achv"
versions = ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5"]

seen_ids = set()
version_added = {}

for v in versions:
    filepath = os.path.join(achv_dir, f"Achievments{v}.json")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    current_ids = set(data.keys())
    new_in_version = [aid for aid in data.keys() if aid not in seen_ids]
    version_added[v] = new_in_version
    seen_ids.update(current_ids)
    print(f"Version {v}: total in file = {len(current_ids)}, newly added = {len(new_in_version)}")

print(f"\nTotal unique achievements across all versions: {len(seen_ids)}")

# Compare with achievements in achievements.ts
with open(r"c:\Users\makiv\Desktop\ArknightProject\arknights-tracker\src\lib\data\achievements.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re
ach_match = re.search(r'export const achievements: Record<string, AchievementData> = (\{[\s\S]*?\n\};)', content)
if ach_match:
    ts_achs = json.loads(ach_match.group(1).rstrip(';'))
    ts_ids = set(ts_achs.keys())
    print(f"Total in achievements.ts: {len(ts_ids)}")
    missing = ts_ids - seen_ids
    extra = seen_ids - ts_ids
    print(f"In ts but not in achv files: {missing}")
    print(f"In achv files but not in ts: {extra}")

for v in versions:
    print(f"\n--- Version {v} ({len(version_added[v])}) ---")
    print(json.dumps(version_added[v], indent=2))
