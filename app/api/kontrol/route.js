import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return Response.json({ error: 'URL eksik' }, { status: 400 });

  try {
    // Veritabanında bu link var mı bakıyoruz
    const { data, error } = await supabase
      .from('kampanya')
      .select('id')
      .eq('link', url)
      .maybeSingle();

    if (error) throw error;

    // Eğer data varsa kayıtlıdır, yoksa false döner
    return Response.json({ kayitli: !!data }, {
        headers: {
            'Access-Control-Allow-Origin': '*', // Eklentiden gelen isteğe izin ver
        }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}