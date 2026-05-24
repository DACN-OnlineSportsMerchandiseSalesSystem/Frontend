import os, re

def update_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original = content
        for pattern, repl in replacements:
            content = re.sub(pattern, repl, content)
            
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

# 1. Home.tsx
home_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\pages\Home.tsx"
home_replacements = [
    # Carousel dots aria-label and touch target size
    (r'<button\s*\n\s*key=\{i\}\s*\n\s*onClick=\{', r'<button aria-label={`Chuyển đến slide ${i + 1}`}\n              key={i}\n              onClick={'),
    # Contrast: text-blue-200 -> text-blue-100 on blue-700
    (r'text-blue-200', 'text-blue-100'),
    # Carousel buttons aria-label missing? (already have them in previous edits)
]
update_file(home_path, home_replacements)

# 2. ProductCard.tsx
card_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\components\ProductCard.tsx"
card_replacements = [
    # Contrast: bg-red-500 -> bg-red-600
    (r'bg-red-500', 'bg-red-600'),
    # Accessible names for buttons/links inside
    (r'<button\s*className="w-8 h-8 rounded-full([^>]*?)(?:>)\s*(<Heart|<ShoppingCart|<Eye)', r'<button aria-label="Thao tác" className="w-8 h-8 rounded-full\1>\n                \2'),
    # Wait, replace the generic ones
]
# I will use a more robust script for ProductCard since it has multiple buttons
try:
    with open(card_path, 'r', encoding='utf-8') as f:
        card_content = f.read()
    
    card_content = card_content.replace('bg-red-500', 'bg-red-600')
    card_content = card_content.replace('<button className="w-8 h-8 rounded-full', '<button aria-label="Nút hành động" className="w-8 h-8 rounded-full')
    card_content = card_content.replace('<button className="w-full py-2.5', '<button aria-label="Thêm vào giỏ" className="w-full py-2.5')
    card_content = card_content.replace('<a className="w-8 h-8 bg-white', '<a aria-label="Xem chi tiết" className="w-8 h-8 bg-white')
    
    with open(card_path, 'w', encoding='utf-8') as f:
        f.write(card_content)
    print("Updated ProductCard.tsx")
except: pass

# 3. Footer.tsx
footer_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\components\Footer.tsx"
try:
    with open(footer_path, 'r', encoding='utf-8') as f:
        footer_content = f.read()
    
    footer_content = footer_content.replace('text-gray-500', 'text-gray-400')
    
    with open(footer_path, 'w', encoding='utf-8') as f:
        f.write(footer_content)
    print("Updated Footer.tsx")
except: pass

# 4. Chatbot.tsx
chatbot_path = r"C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src\app\components\Chatbot.tsx"
try:
    with open(chatbot_path, 'r', encoding='utf-8') as f:
        chatbot_content = f.read()
    
    # Send button
    chatbot_content = chatbot_content.replace('<button\n                    type="submit"', '<button aria-label="Gửi tin nhắn"\n                    type="submit"')
    chatbot_content = chatbot_content.replace('<button type="submit"', '<button aria-label="Gửi tin nhắn" type="submit"')
    
    # Minimize/close buttons
    chatbot_content = chatbot_content.replace('className="w-7 h-7 rounded-lg hover:bg-white/20', 'aria-label="Thu nhỏ/Đóng" className="w-7 h-7 rounded-lg hover:bg-white/20')
    chatbot_content = chatbot_content.replace('<button onClick={() => setIsOpen(false)}', '<button aria-label="Đóng Chatbot" onClick={() => setIsOpen(false)}')
    chatbot_content = chatbot_content.replace('<button onClick={() => setIsMinimized', '<button aria-label="Thu nhỏ Chatbot" onClick={() => setIsMinimized')
    
    with open(chatbot_path, 'w', encoding='utf-8') as f:
        f.write(chatbot_content)
    print("Updated Chatbot.tsx")
except: pass

