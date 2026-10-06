import { sql } from '../../../utils/db';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { exists: false, error: true, message: 'Body request harus berformat JSON valid.' },
        { status: 400 }
      );
    }

    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return Response.json(
        { exists: false, error: true, message: 'Parameter "email" wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query: SELECT 1 FROM users WHERE email = $1 LIMIT 1
    const rows = await sql`
      SELECT 1 FROM users WHERE email = ${cleanEmail} LIMIT 1;
    `;

    const userExists = rows.length > 0;

    return Response.json(
      { exists: userExists, error: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/check-user-exists endpoint:', error);
    return Response.json(
      {
        exists: false,
        error: true,
        message: 'Terjadi kesalahan, kami sedang memperbaikinya'
      },
      { status: 500 }
    );
  }
}
