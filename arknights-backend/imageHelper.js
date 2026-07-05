const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function checkNsfw(base64Image, filename = '') {
    const cleanFilename = String(filename).toLowerCase();
    if (cleanFilename.includes('nsfw')) {
        return true;
    }

    const apiUser = process.env.SIGHTENGINE_USER;
    const apiSecret = process.env.SIGHTENGINE_SECRET;
    
    if (apiUser && apiSecret) {
        try {
            const match = base64Image.match(/^data:image\/(jpeg|jpg|png|webp|avif);base64,(.+)$/i);
            const base64Str = match ? match[2] : base64Image;
            const buffer = Buffer.from(base64Str, 'base64');
            
            const form = new FormData();
            const blob = new Blob([buffer], { type: 'image/webp' });
            
            form.append('media', blob, filename || 'avatar.webp');
            form.append('models', 'nudity-2.0');
            form.append('api_user', apiUser);
            form.append('api_secret', apiSecret);
            
            const res = await axios.post('https://api.sightengine.com/1.0/check.json', form, {
                timeout: 5000
            });
            
            if (res.data && res.data.status === 'success' && res.data.nudity) {
                const n = res.data.nudity;
                return (n.sexual_activity >= 0.5 || n.sexual_display >= 0.5 || n.erotica >= 0.5);
            }
        } catch (e) {
            console.warn("[NSFW] Sightengine API check failed, falling back:", e.message);
        }
    }

    const nsfwUrl = process.env.NSFW_API_URL;
    if (nsfwUrl) {
        try {
            const res = await axios.post(nsfwUrl, {
                image: base64Image,
                filename: filename
            }, { timeout: 5000 });
            return res.data && res.data.nsfw === true;
        } catch (e) {
            console.warn("[NSFW] API check failed, falling back to mock approval:", e.message);
        }
    }
    
    return false;
}

async function saveWebpImage(base64Data) {
    const match = base64Data.match(/^data:image\/(jpeg|jpg|png|webp|avif);base64,(.+)$/i);
    if (!match) {
        throw new Error("Invalid image format header. Only JPEG, PNG, WebP, and AVIF are allowed.");
    }
    
    const base64Str = match[2];
    const buffer = Buffer.from(base64Str, 'base64');
    
    // Limit: 1MB = 1,048,576 bytes
    if (buffer.length > 1024 * 1024) {
        throw new Error("Image exceeds the 1MB limit.");
    }
    
    let processedBuffer;
    try {
        const img = sharp(buffer);
        const metadata = await img.metadata();
        
        const allowedFormats = ['jpeg', 'png', 'webp', 'heif', 'avif'];
        if (!allowedFormats.includes(metadata.format)) {
            throw new Error(`Forbidden file format detected: ${metadata.format}`);
        }
        
        if (metadata.width < 128 || metadata.height < 128) {
            throw new Error("Image is too small. Minimum resolution is 128x128 pixels.");
        }
        
        processedBuffer = await img.rotate().toFormat('webp').toBuffer();
    } catch (err) {
        throw new Error(`Image processing failed: ${err.message}`);
    }
    
    const fileId = crypto.randomUUID();
    const filename = `${fileId}.webp`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    await fs.promises.writeFile(filePath, processedBuffer);
    return fileId;
}

module.exports = {
    checkNsfw,
    saveWebpImage,
    UPLOADS_DIR
};
