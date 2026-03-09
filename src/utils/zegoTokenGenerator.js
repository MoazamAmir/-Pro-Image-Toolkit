import CryptoJS from 'crypto-js';

/**
 * Generate a ZegoCloud token (generateToken04) on the client side.
 * Note: This is an insecure method since it exposes the ServerSecret in the frontend.
 * Only use for testing/development. In production, tokens should be generated server-side.
 */
export function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || !userId || !secret) {
        console.error('Missing config for token generation');
        return '';
    }

    try {
        const createTime = Math.floor(Date.now() / 1000);
        const expireTime = createTime + effectiveTimeInSeconds;

        // Nonce is an 8 byte random hex string
        const nonce = CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex);

        // Random IV is 16 bytes
        const randomIV = CryptoJS.lib.WordArray.random(16);

        // Parse Secret string to key
        let secretString = secret;
        if (secretString.length !== 32) {
            console.warn('ServerSecret should be exactly 32 bytes/characters');
        }
        const key = CryptoJS.enc.Utf8.parse(secretString);

        // Build base plain JSON object
        const plainTextObj = {
            app_id: appId,
            user_id: userId,
            nonce: nonce,
            ctime: createTime,
            expire: expireTime,
            payload: payload || ''
        };

        const plainText = JSON.stringify(plainTextObj);

        // AES-CBC encryption with PKCS7 padding
        const encrypted = CryptoJS.AES.encrypt(plainText, key, {
            iv: randomIV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        const ivHex = randomIV.toString(CryptoJS.enc.Hex);

        const ivBytes = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const cipherBytes = new Uint8Array(cipherText.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        // Create binary buffer format for Zego:
        // expire_time(8) + iv_length(2) + iv(16) + cipher_length(2) + cipher(N)
        const buffer = new Uint8Array(28 + cipherBytes.length);
        const view = new DataView(buffer.buffer);

        view.setUint32(0, Math.floor(expireTime / 0x100000000), false);
        view.setUint32(4, expireTime % 0x100000000, false);

        view.setUint16(8, 16, false);
        buffer.set(ivBytes, 10);

        view.setUint16(26, cipherBytes.length, false);
        buffer.set(cipherBytes, 28);

        // Convert array to binary string, then base64 encode
        let binary = '';
        for (let i = 0; i < buffer.byteLength; i++) {
            binary += String.fromCharCode(buffer[i]);
        }

        const b64 = btoa(binary);
        return '04' + b64;
    } catch (e) {
        console.error('Token generation failed', e);
        return '';
    }
}
