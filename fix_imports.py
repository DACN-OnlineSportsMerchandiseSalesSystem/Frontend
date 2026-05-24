import os, re

for r, d, f in os.walk(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src'):
    for file in f:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(r, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f_obj:
                    content = f_obj.read()
                
                # Use regex to match import { optimizeImage } from ".../imageOptimizer"
                # And replace with import { optimizeImage } from "@/utils/imageOptimizer"
                new_content = re.sub(
                    r'import\s*{\s*optimizeImage\s*}\s*from\s*["\']([^"\']+)imageOptimizer["\'];?', 
                    'import { optimizeImage } from "@/utils/imageOptimizer";', 
                    content
                )
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f_obj:
                        f_obj.write(new_content)
                    print(f"Fixed imports in {filepath}")
            except Exception as e:
                pass
