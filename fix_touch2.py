import os

# 1. Home.tsx
home_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\pages\Home.tsx"
try:
    with open(home_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # fix contrast
    content = content.replace('text-orange-600', 'text-orange-700')
    
    # fix dots touch target
    # current: className="h-2 w-8 py-2 box-content bg-clip-content rounded-full transition-all duration-500"
    content = content.replace('className="h-2 w-8 py-2 box-content bg-clip-content rounded-full transition-all duration-500"', 'className="h-2 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 box-content bg-clip-content rounded-full transition-all duration-500"')
    
    with open(home_path, 'w', encoding='utf-8') as f:
        f.write(content)
except: pass

# 2. Header.tsx
header_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\components\Header.tsx"
try:
    with open(header_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # fix input height
    content = content.replace('py-3', 'py-3 min-h-[44px]')
    
    # fix button touch target
    content = content.replace('className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"', 'className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] text-blue-200 hover:text-white transition-colors flex items-center justify-center"')
    
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(content)
except: pass
