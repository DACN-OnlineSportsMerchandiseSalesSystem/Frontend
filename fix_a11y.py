import os, re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Add aria-label to specific icon buttons based on common patterns
    content = content.replace('<button type="submit" className="absolute right-3 top-1/2', '<button type="submit" aria-label="Tìm kiếm" className="absolute right-3 top-1/2')
    content = content.replace('<button onClick={onClose} className="p-1.5', '<button onClick={onClose} aria-label="Đóng" className="p-1.5')
    content = content.replace('<button onClick={prevSlide} className="absolute', '<button onClick={prevSlide} aria-label="Trang trước" className="absolute')
    content = content.replace('<button onClick={nextSlide} className="absolute', '<button onClick={nextSlide} aria-label="Trang sau" className="absolute')
    content = content.replace('onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10', 'onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Giảm" className="w-10 h-10')
    content = content.replace('onClick={() => setQty(qty + 1)} className="w-10 h-10', 'onClick={() => setQty(qty + 1)} aria-label="Tăng" className="w-10 h-10')
    
    # Header icons
    content = content.replace('className="relative p-2 text-white hover:bg-blue-600', 'aria-label="Menu icon" className="relative p-2 text-white hover:bg-blue-600')
    content = content.replace('className="hidden sm:flex p-2 text-white hover:bg-blue-600', 'aria-label="Menu icon desktop" className="hidden sm:flex p-2 text-white hover:bg-blue-600')

    # Social icons in footer
    content = content.replace('<a href="#" className="w-9 h-9 bg-blue-600', '<a href="#" aria-label="Facebook" className="w-9 h-9 bg-blue-600')
    content = content.replace('<a href="#" className="w-9 h-9 bg-red-600', '<a href="#" aria-label="YouTube" className="w-9 h-9 bg-red-600')
    content = content.replace('<a href="#" className="w-9 h-9 bg-pink-600', '<a href="#" aria-label="Instagram" className="w-9 h-9 bg-pink-600')

    # 2. Add loading="lazy" decoding="async" to images (except those with loading="lazy" already)
    # Be careful not to double add
    def img_replacer(m):
        img_tag = m.group(0)
        if 'loading=' not in img_tag:
            # If it's a Hero image (large sizes or specific classes in Home), use fetchpriority="high"
            if 'object-cover' in img_tag and 'w-full h-full' in img_tag and 'absolute' in img_tag:
                return img_tag.replace('<img', '<img fetchpriority="high" decoding="async"')
            return img_tag.replace('<img', '<img loading="lazy" decoding="async"')
        return img_tag
    
    content = re.sub(r'<img\s+[^>]*>', img_replacer, content)

    # 3. Footer headings h4 -> h3
    if 'Footer.tsx' in filepath:
        content = content.replace('<h4', '<h3').replace('</h4>', '</h3>')

    # 4. Improve contrast text-gray-400 -> text-gray-500
    content = content.replace('text-gray-400', 'text-gray-500')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for r, d, f in os.walk(r'C:\Users\ADMIN\Dropbox\PC\Downloads\DACN\Frontend\src'):
    for file in f:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            process_file(os.path.join(r, file))

