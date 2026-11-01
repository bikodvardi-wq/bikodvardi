import { supabase } from "./supabase";

export interface Reklam {
  id: number;
  baslik: string;
  gorsel_url: string;
  link_url: string;
  konum: string;
  etiket?: string | null;
}

/**
 * Türkiye saatine göre ISO hafta anahtarı üretir.
 * Örnek: 2026-W44
 */
function haftaAnahtariOlustur(): string {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const degerler = Object.fromEntries(
    parcalar
      .filter((parca) => parca.type !== "literal")
      .map((parca) => [parca.type, parca.value])
  );

  const tarih = new Date(
    Date.UTC(
      Number(degerler.year),
      Number(degerler.month) - 1,
      Number(degerler.day)
    )
  );

  const haftaninGunu = tarih.getUTCDay() || 7;

  tarih.setUTCDate(tarih.getUTCDate() + 4 - haftaninGunu);

  const haftaYili = tarih.getUTCFullYear();
  const yilBaslangici = new Date(Date.UTC(haftaYili, 0, 1));

  const haftaNumarasi = Math.ceil(
    ((tarih.getTime() - yilBaslangici.getTime()) / 86_400_000 + 1) / 7
  );

  return `${haftaYili}-W${String(haftaNumarasi).padStart(2, "0")}`;
}

/**
 * Metinden sabit bir sıralama değeri üretir.
 */
function sabitHashOlustur(deger: string): number {
  let hash = 2_166_136_261;

  for (let i = 0; i < deger.length; i += 1) {
    hash ^= deger.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

/**
 * Belirli bir konum için aktif reklamları getirir.
 *
 * Reklam sıralaması her istekte rastgele değişmez.
 * Türkiye saatine göre her hafta otomatik olarak yenilenir.
 */
export async function getReklamlar(
  konum: string,
  limit: number = 2
): Promise<Reklam[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("reklam")
    .select("id, baslik, gorsel_url, link_url, konum, etiket")
    .eq("konum", konum)
    .eq("aktif", true)
    .or(`baslangic_tarihi.is.null,baslangic_tarihi.lte.${now}`)
    .or(`bitis_tarihi.is.null,bitis_tarihi.gte.${now}`);

  if (error) {
    console.error(`Reklamlar alınamadı (${konum}):`, error.message);
    return [];
  }

  const aktifler = data || [];

  if (aktifler.length === 0) return [];

  const haftaAnahtari = haftaAnahtariOlustur();

  const siraliReklamlar = [...aktifler].sort((a, b) => {
    const aDegeri = sabitHashOlustur(
      `${haftaAnahtari}:${konum}:${a.id}`
    );

    const bDegeri = sabitHashOlustur(
      `${haftaAnahtari}:${konum}:${b.id}`
    );

    if (aDegeri === bDegeri) {
      return a.id - b.id;
    }

    return aDegeri - bDegeri;
  });

  return siraliReklamlar.slice(0, Math.max(0, limit));
}

/**
 * Eski kodlarla uyumluluk için tek reklam döndürür.
 */
export async function getReklam(
  konum: string
): Promise<Reklam | null> {
  const reklamlar = await getReklamlar(konum, 1);

  return reklamlar[0] || null;
}