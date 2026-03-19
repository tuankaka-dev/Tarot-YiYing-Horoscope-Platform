import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32ch';

// Ensure the key is 32 bytes
const key = crypto.scryptSync(secretKey, 'salt', 32);

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    try {
        const [ivHex, encryptedHex] = encryptedText.split(':');
        
        if (!ivHex || !encryptedHex) {
            // Return original text if not encrypted properly (for backward compatibility)
            return encryptedText;
        }
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption failed, returning potentially unencrypted string fallback', error);
        return encryptedText;
    }
}
