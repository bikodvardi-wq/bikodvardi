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
    const xmlResponse = await fetch(sitemap_url);
    if (!xmlResponse.ok) throw new Error('Sitemap dosyasına ulaşılamadı');
    const xmlText = await xmlResponse.text();

    // 2. XML'İ JSON'A ÇEVİR
    const result = await parseStringPromise(xmlText);

    // 3. LİNKLERİ AYIKLA
    // Genelde sitemap yapısı: <urlset><url><loc>LINK</loc></url></urlset> şeklindedir.
    let tumLinkler = [];
    
    if (result.urlset && result.urlset.url) {
      tumLinkler = result.urlset.url.map(u => u.loc[0]);
    } else if (result.sitemapindex && result.sitemapindex.sitemap) {
      // Eğer bu bir sitemap indeksi ise (içinde başka sitemapler varsa)
      return Response.json({ 
        hata: 'Bu bir Sitemap İndeksi! Lütfen alt sitemaplerden birinin linkini girin (Örn: post-sitemap.xml).' 
      }, { status: 400 });
    }

    // 4. FİLTRELEME (Sadece kampanya linklerini al)
    const filtreKelimesi = sitemap_filter ? sitemap_filter.toLowerCase() : '';
    
    const adayLinkler = tumLinkler.filter(link => {
      // Filtre varsa onu kontrol et, yoksa hepsini al
      if (filtreKelimesi && !link.toLowerCase().includes(filtreKelimesi)) return false;
      return true;
    });

    // 5. BİZDE ZATEN OLANLARI BUL
    const { data: mevcutKampanyalar } = await supabase
      .from('kampanya')
      .select('kampanya_url')
      .eq('fayd_marka', marka_id);

    const bizdekiLinkler = mevcutKampanyalar.map(k => k.kampanya_url);

    // 6. KARŞILAŞTIRMA: Onlarda olup bizde olmayanları bul
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