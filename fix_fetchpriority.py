import os, re

for r, d, f in os.walk(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src'):
    for file in f:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            filepath = os.path.join(r, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f_obj:
                    content = f_obj.read()
                
                # fix fetchpriority="high" to fetchPriority="high"
                new_content = content.replace('fetchpriority="high"', 'fetchPriority="high"')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f_obj:
                        f_obj.write(new_content)
                    print(f"Fixed fetchPriority in {filepath}")
            except Exception as e:
                pass
