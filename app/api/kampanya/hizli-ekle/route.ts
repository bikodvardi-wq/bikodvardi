import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { link, markaId }: { link: string; markaId: string } = body;

    if (!link || !markaId) {
      return NextResponse.json({ error: 'Link ve marka ID zorunlu' }, { status: 400 });
    }

    // Aynı link var mı kontrol et
    const { data: mevcut } = await supabase
      .from('kampanya')
      .select('id')
      .eq('link', link.trim())
      .maybeSingle();

    if (mevcut) {
      return NextResponse.json({ error: 'Bu link zaten ekli' }, { status: 409 });
    }

    // Otomatik başlık çıkar
    const urlParts: string[] = link.split('/').filter(Boolean);
    const sonParca: string = urlParts[urlParts.length - 1] || 'Yeni Fırsat';

    let baslik: string = sonParca
      .replace(/-/g, ' ')
      .replace(/\d+/g, (m: string) => `${m} `)
      .replace(/tl/g, 'TL')
      .replace(/indirim|kampanya|hediye|bonus/gi, (w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .trim();

    baslik = baslik.charAt(0).toUpperCase() + baslik.slice(1);

    // 30 gün sonrası bitiş tarihi
    const bitisTarihi: string = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Slug oluştur
    const slug: string = baslik
      .toLowerCase()
      .replace(/[^a-z0-9\s-ğüşıöç]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const payload = {
      baslik: baslik || 'Yeni Kampanya',
      link: link.trim(),
      fayd_marka: markaId,
      yapan_marka: null,
      bitis_date: bitisTarihi,
      slug,
      detay: '',
      kampanya_turu: null,
      gecerli_sektor_id: null
    };

    const { error } = await supabase.from('kampanya').insert([payload]);

    if (error) {
      console.error('Insert hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, baslik });
  } catch (err) {
    console.error('API hatası:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}