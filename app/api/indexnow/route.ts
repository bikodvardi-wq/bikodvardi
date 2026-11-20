import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { urls } = await request.json(); // Örn: ["https://bikodvardi.com/marka/migros"]
  const apiKey = process.env.INDEXNOW_KEY; // .env dosyasına eklediğin anahtar
  const host = 'bikodvardi.com';

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: apiKey,
      keyLocation: `https://${host}/${apiKey}.txt`,
      urlList: urls,
    }),
  });

  if (response.ok) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, status: response.status }, { status: 400 });
}