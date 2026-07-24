import { supabase } from './supabase';

export interface Reklam {
  id: number;
  baslik: string;
  gorsel_url: string;
  link_url: string;
  konum: string;
}

/**
 * Belirli bir konum için aktif reklamlardan istenen sayıda getirir.
 * Birden fazla aktif reklam varsa rastgele karıştırıp döner.
 */
export async function getReklamlar(
  konum: string,
  limit: number = 2
): Promise<Reklam[]> {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('reklam')
    .select('id, baslik, gorsel_url, link_url, konum, etiket')
    .eq('konum', konum)
    .eq('aktif', true)
    .or(`baslangic_tarihi.is.null,baslangic_tarihi.lte.${now}`)
    .or(`bitis_tarihi.is.null,bitis_tarihi.gte.${now}`);

  const aktifler = data || [];

  if (aktifler.length === 0) return [];

  // Karıştır
  const karisik = [...aktifler].sort(() => 0.5 - Math.random());

  return karisik.slice(0, limit);
}

/**
 * Eski kodlarla uyumluluk için tek reklam döndüren versiyon
 */
export async function getReklam(konum: string): Promise<Reklam | null> {
  const reklamlar = await getReklamlar(konum, 1);
  return reklamlar[0] || null;
}