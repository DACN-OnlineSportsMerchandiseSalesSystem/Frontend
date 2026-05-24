export function optimizeImage(url: string | undefined, width = 600): string {
    if (!url) return '';
    // Tự động chuyển đổi format, quality và resize cho link Cloudinary
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        if (url.includes('f_auto') || url.includes('q_auto')) return url;
        return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
    return url;
}
