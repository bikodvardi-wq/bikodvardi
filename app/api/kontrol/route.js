import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new Response(JSON.stringify({ error: 'URL yok' }), { status: 400 });

  try {
    // Linki ve Bitiş Tarihini çekiyoruz
    const { data, error } = await supabase
      .from('kampanya')
      .select('id, bitis_date') // Tarihi de istiyoruz
      .eq('link', url)
      .maybeSingle();

    if (error) throw error;

    let durum = 'yok'; // Varsayılan: Veritabanında yok

    if (data) {
      // Bugünün tarihini al (Saat farkını yok sayıp sadece günü kıyaslamak için)
      const bugun = new Date().toISOString().split('T')[0];
      
      // Eğer bitiş tarihi bugünden küçükse 'bitmis', değilse 'aktif'
      if (data.bitis_date && data.bitis_date < bugun) {
        durum = 'bitmis';
      } else {
        durum = 'aktif';
      }
    }

    // Cevabı gönderiyoruz
    return new Response(JSON.stringify({ durum: durum }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}