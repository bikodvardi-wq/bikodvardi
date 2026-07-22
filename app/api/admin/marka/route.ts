import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Sadece marka adı zorunlu olsun
    if (!body.marka_adi && !body.ad && !body.name) {
      return NextResponse.json(
        { error: 'Marka adı zorunludur' },
        { status: 400 }
      );
    }

    // Formdan gelen veriyi olduğu gibi gönderiyoruz
    // Slug’ı veritabanı trigger’ı hallesin
    const { data, error } = await supabaseAdmin
      .from('marka')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Marka ekleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}