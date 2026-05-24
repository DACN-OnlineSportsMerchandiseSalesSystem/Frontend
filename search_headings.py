import os, re
res = ""
for r, d, f in os.walk(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src'):
  for file in f:
    if file.endswith('.tsx') or file.endswith('.jsx'):
      path = os.path.join(r, file)
      try:
        lines = open(path, encoding='utf-8').readlines()
        for i, l in enumerate(lines):
          if re.search(r'<h[1-6]', l):
            res += f"{file}:{i+1}:{l.strip()}\n"
      except:
        pass
open(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\headings.txt', 'w', encoding='utf-8').write(res)
