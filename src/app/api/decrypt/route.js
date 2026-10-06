import { decryptText } from '../../../utils/crypto';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: 'Body request harus berformat JSON valid.' },
        { status: 400 }
      );
    }

    const { data: encryptedData, clientPublicKey: bodyClientPubKey } = body || {};

    // Get client public key from JSON body or X-Client-Public-Key header
    const headerClientPubKey = request.headers.get('X-Client-Public-Key');
    const clientPublicKey = bodyClientPubKey || headerClientPubKey;

    if (!encryptedData || typeof encryptedData !== 'string') {
      return Response.json(
        { success: false, error: 'Parameter "data" (Base64) wajib diisi.' },
        { status: 400 }
      );
    }

    if (!clientPublicKey || typeof clientPublicKey !== 'string') {
      return Response.json(
        { success: false, error: 'Client Public Key (Base64) wajib disertakan.' },
        { status: 400 }
      );
    }

    const serverPrivateKey = process.env.SERVER_PRIVATE_KEY;
    if (!serverPrivateKey) {
      return Response.json(
        { success: false, error: 'SERVER_PRIVATE_KEY belum dikonfigurasi pada environment server.' },
        { status: 500 }
      );
    }

    // Pure cryptographic decryption (does NOT touch PostgreSQL)
    const decrypted = decryptText(encryptedData, clientPublicKey, serverPrivateKey);

    return Response.json(
      {
        success: true,
        decrypted: decrypted
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/decrypt endpoint:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Decryption failed'
      },
      { status: 400 }
    );
  }
}
