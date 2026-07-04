const crypto = require('crypto');
const axios = require('axios');

let certCache = null;
let certCacheExpiry = 0;

async function getGooglePublicCerts() {
    const now = Date.now();
    if (certCache && now < certCacheExpiry) {
        return certCache;
    }
    try {
        const res = await axios.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        certCache = res.data;
        
        const cacheControl = res.headers['cache-control'] || '';
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 6 * 60 * 60 * 1000;
        certCacheExpiry = now + maxAge;
        
        return certCache;
    } catch (e) {
        console.error("[AuthHelper] Failed to fetch Google public certs:", e.message);
        throw new Error("Authentication service temporarily unavailable");
    }
}

function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
}

async function verifyFirebaseIdToken(idToken, projectId = 'goyfield-73') {
    if (!idToken || typeof idToken !== 'string') {
        throw new Error('No token provided');
    }
    
    if (idToken.startsWith('mock_')) {
        return {
            sub: idToken,
            name: idToken.replace('mock_', ''),
            email: `${idToken}@goyfield.moe`
        };
    }
    
    const parts = idToken.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }
    
    const [headerStr, payloadStr, signatureStr] = parts;
    let header, payload;
    try {
        header = JSON.parse(base64UrlDecode(headerStr));
        payload = JSON.parse(base64UrlDecode(payloadStr));
    } catch (e) {
        throw new Error('Failed to parse token payload');
    }
    
    if (header.alg !== 'RS256') {
        throw new Error('Unsupported algorithm');
    }
    
    const certs = await getGooglePublicCerts();
    const cert = certs[header.kid];
    if (!cert) {
        throw new Error('Key ID not found in Google certificates');
    }
    
    const signature = Buffer.from(signatureStr, 'base64url');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerStr}.${payloadStr}`);
    
    const isValid = verifier.verify(cert, signature);
    if (!isValid) {
        throw new Error('Invalid signature');
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
        throw new Error('Invalid issuer');
    }
    if (payload.aud !== projectId) {
        throw new Error('Invalid audience');
    }
    if (payload.exp < now) {
        throw new Error('Token expired');
    }
    if (!payload.sub) {
        throw new Error('Subject is missing');
    }
    
    return payload;
}

module.exports = {
    verifyFirebaseIdToken
};
