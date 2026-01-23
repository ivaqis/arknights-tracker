// src/lib/utils/imageUtils.js

export function normalizeId(str) {
    if (!str) return "";
    // If it is a URL, return as is (don't strip characters)
    if (str.toString().startsWith("http")) return str;
    
    // Keep letters, numbers, _, -, and . (for file extensions)
    return str.toString().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
}

/**
 * Path logic.
 * 1. If it's a URL, use it.
 * 2. If it has an image extension (.jpg), use it.
 * 3. Default to .png
 */
export function getImagePath(idOrName, variant = 'operator-icon') {
    if (!idOrName) return "";

    // 1. Check if it is an external URL (Fix for Banners)
    if (idOrName.toString().startsWith("http")) {
        return idOrName;
    }

    const name = normalizeId(idOrName);

    // 2. Check for existing extension (Fix for Events jpg)
    // RegExp checks for .png, .jpg, .jpeg, .webp at the end of string
    const withExt = (n) => {
        if (/\.(png|jpg|jpeg|webp|gif)$/i.test(n)) {
            return n;
        }
        return `${n}.png`;
    };

    switch (variant) {
        case 'operator-splash':
            return `/images/operators/splash/${withExt(name)}`;
        
        case 'item':
            return `/images/items/${withExt(name)}`;
        
        case 'currency':
            return `/images/items/currencies/${withExt(name)}`;

        case 'banner-icon':
            return `/images/banners/icon/${withExt(name)}`;

        case 'banner-mini':
            return `/images/banners/miniIcon/${withExt(name)}`;

        case 'event-icon':
            return `/images/events/icon/${withExt(name)}`; 
            
        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}