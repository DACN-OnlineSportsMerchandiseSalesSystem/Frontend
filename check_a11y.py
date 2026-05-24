import os, re
res = ""
for r, d, f in os.walk(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src'):
  for file in f:
    if file.endswith('.tsx') or file.endswith('.jsx'):
      path = os.path.join(r, file)
      try:
        lines = open(path, encoding='utf-8').readlines()
        for i, l in enumerate(lines):
          # Look for button or Link/a without text or aria-label
          if re.search(r'<button', l) and 'aria-label' not in l and '>' in l:
             # Just collect all buttons to inspect
             res += f"{file}:{i+1}:{l.strip()}\n"
          if re.search(r'<(a|Link)\b', l) and 'aria-label' not in l:
             res += f"{file}:{i+1}:{l.strip()}\n"
      except:
        pass
open(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\accessibility_check.txt', 'w', encoding='utf-8').write(res)
