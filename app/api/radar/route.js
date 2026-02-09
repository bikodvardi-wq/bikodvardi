import { supabase } from '@/lib/supabase';
import { parseStringPromise } from 'xml2js';

export async function POST(request) {
  try {
    const { marka_id, sitemap_url, sitemap_filter } = await request.json();

    if (!sitemap_url) {
      return Response.json({ error: 'Sitemap URL eksik!' }, { status: 400 });
    }

    // 1. SITEMAP XML VERİSİNİ ÇEK
    console.log(`📡 Taranıyor: ${sitemap_url}`);
    const xmlResponse = await fetch(sitemap_url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!xmlResponse.ok) throw new Error(`Sitemap dosyasına ulaşılamadı. Durum: ${xmlResponse.status}`);
    const xmlText = await xmlResponse.text();

    // 2. XML'İ JSON'A ÇEVİR
    const result = await parseStringPromise(xmlText);

    // 3. LİNKLERİ AYIKLA
    let tumLinkler = [];
    
    if (result?.urlset?.url) {
      tumLinkler = result.urlset.url
        .map(u => u.loc ? u.loc[0] : null)
        .filter(Boolean);
    } 
    else if (result?.sitemapindex?.sitemap) {
      const altSitemapler = result.sitemapindex.sitemap
        .map(s => s.loc ? s.loc[0] : null)
        .filter(Boolean);

      return Response.json({ 
        hata: 'Bu bir Sitemap İndeksi!',
        detay: 'Bu dosya bir dizindir. Lütfen marka ayarlarından aşağıdaki alt sitemap linklerinden birini girin:',
        linkler: altSitemapler
      }, { status: 400 });
    } else {
        throw new Error('Tanınmayan sitemap formatı veya boş dosya.');
    }

    // 4. FİLTRELEME
    const filtreKelimesi = sitemap_filter ? sitemap_filter.toLowerCase() : '';
    const adayLinkler = tumLinkler.filter(link => {
      if (filtreKelimesi && !link.toLowerCase().includes(filtreKelimesi)) return false;
      return true;
    });

    // 5. BİZDE ZATEN OLANLARI BUL (SÜTUN ADI 'link' OLARAK DÜZELTİLDİ)
    const { data: mevcutKampanyalar, error: dbError } = await supabase
      .from('kampanya')
      .select('link') // <--- BURASI DÜZELDİ
      .eq('fayd_marka', marka_id);

    if (dbError) throw dbError;

    const bizdekiLinkler = mevcutKampanyalar?.map(k => k.link) || []; // <--- BURASI DÜZELDİ

    // 6. KARŞILAŞTIRMA
    const yeniFirsatlar = adayLinkler.filter(link => !bizdekiLinkler.includes(link));

    return Response.json({
      basari: true,
      toplamLink: adayLinkler.length,
      yeniFirsatSayisi: yeniFirsatlar.length,
      yeniLinkler: yeniFirsatlar
    });

  } catch (error) {
    console.error("Radar Hatası:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}