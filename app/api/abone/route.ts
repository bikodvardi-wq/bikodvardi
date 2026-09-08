import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    const gecerliEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!gecerliEmail) {
      return NextResponse.json(
        { message: 'Lütfen geçerli bir e-posta adresi gir.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('abone').insert([{ email }]);

    if (error?.code === '23505') {
      return NextResponse.json(
        {
          message:
            'Bu e-posta zaten kayıtlı — teşekkürler, zaten kulübümüzdesin!',
        },
        { status: 409 }
      );
    }

    if (error) {
      console.error('Abone kayıt hatası:', error.message);

      return NextResponse.json(
        { message: 'Bir şeyler ters gitti, birazdan tekrar dener misin?' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Geçersiz istek.' },
      { status: 400 }
    );
  }
}
