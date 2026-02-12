import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new Response(JSON.stringify({ error: 'URL yok' }), { status: 400 });

  try {
    // Veritabanında linki arıyoruz
    const { data, error } = await supabase
      .from('kampanya')
      .select('id')
      .eq('link', url)
      .maybeSingle();

    if (error) throw error;

    // 🔥 Dış dünyadan (Chrome eklentisinden) erişim izni veriyoruz
    return new Response(JSON.stringify({ kayitli: !!data }), {
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

// Tarayıcının ön kontrolü için gerekli
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