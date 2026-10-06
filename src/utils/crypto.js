import forge from 'node-forge';
import { ec as EC } from 'elliptic';

const ec = new EC('p256');

const cleanB64 = (str) => (str || '').replace(/-----BEGIN[^-]+-----|-----END[^-]+-----|\s+/g, '');

/**
 * Client-Side Encryption Helper
 * Encrypts plaintext using ECDH P-256 key exchange with Server Public Key + AES-256-GCM.
 * Output: { encryptedData: string (Base64), clientPublicKey: string (Base64) }
 */
export function encryptText(plainText, serverPublicKeyB64) {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Plaintext must be a non-empty string');
  }
  if (!serverPublicKeyB64) {
    throw new Error('Server public key is required');
  }

  // 1. Parse Server Public Key (SPKI / Raw P-256 Point)
  const serverBytes = forge.util.decode64(cleanB64(serverPublicKeyB64));
  const serverHex = forge.util.bytesToHex(serverBytes);
  let serverPointHex = serverHex;
  if (serverHex.length === 182) {
    serverPointHex = serverHex.slice(52);
  }
  const serverKeyObj = ec.keyFromPublic(serverPointHex, 'hex');

  // 2. Generate Client Ephemeral Keypair (P-256)
  const clientKey = ec.genKeyPair();
  const clientPublicHex = clientKey.getPublic(false, 'hex');
  const clientPublicBytes = forge.util.hexToBytes(clientPublicHex);
  const clientPublicB64 = forge.util.encode64(clientPublicBytes);

  // 3. Derive ECDH Shared Secret
  const sharedSecretBN = clientKey.derive(serverKeyObj.getPublic());
  const sharedSecretHex = sharedSecretBN.toString(16).padStart(64, '0');
  const sharedSecretBytes = forge.util.hexToBytes(sharedSecretHex);

  // 4. AES-256-GCM Encryption
  const iv = forge.random.getBytesSync(12); // 12-byte IV
  const cipher = forge.cipher.createCipher('AES-GCM', sharedSecretBytes);
  cipher.start({
    iv: iv,
    tagLength: 128 // 16-byte tag
  });
  cipher.update(forge.util.createBuffer(plainText, 'utf8'));
  cipher.finish();

  const ciphertext = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // Layout: [ 12-byte IV ][ Ciphertext ][ 16-byte Tag ]
  const packedPayload = iv + ciphertext + tag;
  const encryptedDataB64 = forge.util.encode64(packedPayload);

  return {
    encryptedData: encryptedDataB64,
    clientPublicKey: clientPublicB64
  };
}

/**
 * Server-Side Decryption Helper
 * Decrypts AES-256-GCM payload using Server Private Key + Client Public Key.
 * Output: string (Decrypted Plaintext)
 * Note: Pure cryptographic decryption, does NOT hit PostgreSQL (PSQL).
 */
export function decryptText(encryptedDataB64, clientPublicKeyB64, serverPrivateKeyB64) {
  if (!encryptedDataB64 || !clientPublicKeyB64 || !serverPrivateKeyB64) {
    throw new Error('Missing encrypted payload, client public key, or server private key');
  }

  // 1. Parse Server Private Key
  let serverPrivHex = cleanB64(serverPrivateKeyB64);
  if (!/^[0-9a-fA-F]+$/.test(serverPrivHex)) {
    serverPrivHex = forge.util.bytesToHex(forge.util.decode64(serverPrivHex));
  }
  if (serverPrivHex.length > 64) {
    const octetIndex = serverPrivHex.indexOf('0420');
    if (octetIndex !== -1) {
      serverPrivHex = serverPrivHex.slice(octetIndex + 4, octetIndex + 4 + 64);
    } else {
      serverPrivHex = serverPrivHex.slice(-64);
    }
  }
  const serverKeyObj = ec.keyFromPrivate(serverPrivHex, 'hex');

  // 2. Parse Client Public Key
  const clientPubHex = forge.util.bytesToHex(forge.util.decode64(cleanB64(clientPublicKeyB64)));
  const clientKeyObj = ec.keyFromPublic(clientPubHex, 'hex');

  // 3. Derive ECDH Shared Secret
  const sharedSecretBN = serverKeyObj.derive(clientKeyObj.getPublic());
  const sharedSecretHex = sharedSecretBN.toString(16).padStart(64, '0');
  const sharedSecretBytes = forge.util.hexToBytes(sharedSecretHex);

  // 4. Unpack & Decrypt AES-256-GCM
  const packedPayload = forge.util.decode64(cleanB64(encryptedDataB64));
  if (packedPayload.length < 28) {
    throw new Error('Payload format invalid or too short');
  }

  const iv = packedPayload.substring(0, 12);
  const tag = packedPayload.substring(packedPayload.length - 16);
  const ciphertext = packedPayload.substring(12, packedPayload.length - 16);

  const decipher = forge.cipher.createDecipher('AES-GCM', sharedSecretBytes);
  decipher.start({
    iv: iv,
    tag: forge.util.createBuffer(tag),
    tagLength: 128
  });
  decipher.update(forge.util.createBuffer(ciphertext));
  const pass = decipher.finish();

  if (!pass) {
    throw new Error('AES-GCM Authentication failed! Invalid key or corrupted payload.');
  }

  return decipher.output.toString('utf8');
}
