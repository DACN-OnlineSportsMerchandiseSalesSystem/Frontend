import os, re

# 1. Home.tsx
home_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\pages\Home.tsx"
try:
    with open(home_path, 'r', encoding='utf-8') as f:
        home_content = f.read()
    
    # Touch target for dots
    home_content = home_content.replace('className="h-2 rounded-full transition-all duration-500"', 'className="h-2 w-8 py-2 box-content bg-clip-content rounded-full transition-all duration-500"')
    
    with open(home_path, 'w', encoding='utf-8') as f:
        f.write(home_content)
    print("Updated touch target in Home.tsx")
except: pass

# 2. Header.tsx (Search input)
header_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\components\Header.tsx"
try:
    with open(header_path, 'r', encoding='utf-8') as f:
        header_content = f.read()
    
    # Increase height to meet touch target 44px minimum
    header_content = header_content.replace('py-2.5', 'py-3')
    
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(header_content)
    print("Updated touch target in Header.tsx")
except: pass

