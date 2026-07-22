import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.baslik || !body.gorsel_url || !body.link_url) {
      return NextResponse.json(
        { error: 'Başlık, görsel URL ve link zorunludur' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('reklam')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Reklam ekleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reklam')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Reklam güncelleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reklam')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Reklam silme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}