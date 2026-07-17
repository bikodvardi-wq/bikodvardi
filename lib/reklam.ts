import { supabase } from './supabase';

export interface Reklam {
  id: number;
  baslik: string;
  gorsel_url: string;
  link_url: string;
  konum: string;
}

// Belirli bir konum için aktif (tarih aralığında + açık) reklamlardan birini getirir.
// Birden fazla aktif reklam varsa her çağrıda rastgele biri seçilir — bu da
// sayfa yenilendikçe reklamların doğal olarak "sırayla dönmesini" sağlar.
export async function getReklam(konum: string): Promise<Reklam | null> {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('reklam')
    .select('id, baslik, gorsel_url, link_url, konum')
    .eq('konum', konum)
    .eq('aktif', true)
    .or(`baslangic_tarihi.is.null,baslangic_tarihi.lte.${now}`)
    .or(`bitis_tarihi.is.null,bitis_tarihi.gte.${now}`);

  const aktifler = data || [];
  if (aktifler.length === 0) return null;

  return aktifler[Math.floor(Math.random() * aktifler.length)];
}