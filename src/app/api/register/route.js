import { sql } from '../../../utils/db';

const MAYAR_API_URL = process.env.MAYAR_API_URL || '';
const MAYAR_PRODUCT_ID = process.env.MAYAR_PRODUCT_ID || '';
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || '';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: 'Body request harus berformat JSON valid.' },
        { status: 400 }
      );
    }

    const { email, license } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return Response.json(
        { success: false, message: 'Parameter "email" wajib diisi.' },
        { status: 400 }
      );
    }

    if (!license || typeof license !== 'string' || !license.trim()) {
      return Response.json(
        { success: false, message: 'Parameter "license" wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanLicense = license.trim();

    // 1. Check if license is already registered in the database
    const existingLicense = await sql`
      SELECT id FROM users WHERE license = ${cleanLicense} LIMIT 1;
    `;

    if (existingLicense && existingLicense.length > 0) {
      return Response.json(
        { success: false, message: 'Lisensi sudah digunakan' },
        { status: 400 }
      );
    }

    // Prepare headers (attach Bearer token if MAYAR_API_KEY is configured in environment)
    const headers = {
      'Content-Type': 'application/json'
    };
    if (MAYAR_API_KEY) {
      headers['Authorization'] = `Bearer ${MAYAR_API_KEY}`;
    }

    // 2. Fetch license verification from Mayar API (POST request)
    const externalResponse = await fetch(MAYAR_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        licenseCode: cleanLicense,
        productId: MAYAR_PRODUCT_ID
      }),
      cache: 'no-store'
    });

    if (!externalResponse.ok) {
      return Response.json(
        { success: false, message: 'Terjadi kesalahan, kami sedang memperbaikinya' },
        { status: 500 }
      );
    }

    const externalData = await externalResponse.json();

    // 2. Validate statusCode == 200 and message contains cleanLicense
    const responseMessage = externalData?.message || (typeof externalData === 'object' ? JSON.stringify(externalData) : '');
    const containsLicense = responseMessage.includes(cleanLicense);
    const isStatus200 = externalData?.statusCode === 200;

    if (!isStatus200 || !containsLicense) {
      // Case: responseMessage does not include cleanLicense AND statusCode != 200
      if (!containsLicense && !isStatus200) {
        return Response.json(
          { success: false, message: 'Terjadi kesalahan, kami sedang memperbaikinya' },
          { status: 500 }
        );
      }

      return Response.json(
        { success: false, message: 'Kode Lisensi tidak valid' },
        { status: 400 }
      );
    }

    // 3. Insert into Neon PostgreSQL users table (id bigserial PRIMARY KEY auto-generated)
    const rows = await sql`
      INSERT INTO users (email, license)
      VALUES (${cleanEmail}, ${cleanLicense})
      ON CONFLICT (email) 
      DO UPDATE SET license = EXCLUDED.license
      RETURNING id, email, license, created_at;
    `;

    const registeredUser = rows[0];

    return Response.json(
      {
        success: true,
        message: 'Registrasi berhasil disimpan ke database.',
        data: registeredUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/register endpoint:', error);
    return Response.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server backend.',
        error: error.message
      },
      { status: 500 }
    );
  }
}
