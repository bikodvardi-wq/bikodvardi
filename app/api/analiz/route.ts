import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { link } = await request.json();

    if (!link) {
      return NextResponse.json({ error: 'Link gerekli' }, { status: 400 });
    }

    // 1. Siteye Git (Bot Taklidi Yaparak)
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Siteye ulaşılamadı' }, { status: 500 });
    }

    const html = await response.text();

    // --- 2. BAŞLIK VE AÇIKLAMA (Meta Etiketleri) ---
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let baslik = titleMatch ? titleMatch[1] : '';

    // HTML Temizleme Fonksiyonu
    const cleanText = (text: string) => text
      .replace(/<[^>]*>/g, ' ') // HTML taglerini sil
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ') // Çoklu boşlukları teke indir
      .trim();

    baslik = cleanText(baslik).split('|')[0].split('-')[0].trim(); // Site ismini at (örn: - Bankkart)

    // --- 3. DETAYLARI BUL (Alt kısımdaki maddeler) ---
    let detayMetni = "";

    // Yöntem A: <li> taglerini topla (Genelde bankalar koşulları madde madde yazar)
    const listItems = html.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (listItems && listItems.length > 3) {
      // Eğer sayfada çok fazla madde varsa, muhtemelen kampanya koşullarıdır.
      // Menüleri elemek için sadece uzunluğu 20 karakterden fazla olan maddeleri alalım.
      const maddeler = listItems
        .map(item => cleanText(item))
        .filter(t => t.length > 20 && !t.includes('Hakkımızda') && !t.includes('İletişim')); // Gereksizleri ele
      
      if (maddeler.length > 0) {
        detayMetni = maddeler.join('\n'); // Her maddeyi yeni satıra ekle
      }
    }

    // Yöntem B: Eğer liste bulamazsa, "description" meta tagine bak
    if (detayMetni.length < 50) {
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        if (descMatch) detayMetni = cleanText(descMatch[1]);
    }

    // --- 4. TARİH DEDEKTİFİ ---
    let bulunanTarih = "";
    
    // Türkçe Ay İsimleri Haritası
    const aylar: { [key: string]: string } = {
        'ocak': '01', 'subat': '02', 'şubat': '02', 'mart': '03', 'nisan': '04', 'mayıs': '05', 'mayis': '05', 'haziran': '06', 
        'temmuz': '07', 'agustos': '08', 'ağustos': '08', 'eylül': '09', 'eylul': '09', 'ekim': '10', 'kasım': '11', 'kasim': '11', 'aralık': '12', 'aralik': '12'
    };

    // Regex: "31 Ocak 2026" veya "31.01.2026" gibi desenleri ara
    const tarihRegex = /(\d{1,2})\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık|Oc|Şu|Ma|Ni|May|Haz|Tem|Ağ|Ey|Ek|Ka|Ar)\w*\s+(\d{4})/gi;
    const tarihMatches = [...html.matchAll(tarihRegex)];

    if (tarihMatches.length > 0) {
        // Genelde son tarih en sondaki tarihtir veya metin içinde geçer
        const sonTarih = tarihMatches[tarihMatches.length - 1]; // Son bulunan tarihi al
        const gun = sonTarih[1].padStart(2, '0');
        const ayKelime = sonTarih[2].toLowerCase();
        const yil = sonTarih[3];
        
        let aySayi = "01";
        // Ay ismini sayıya çevir
        Object.keys(aylar).forEach(k => {
            if (ayKelime.includes(k)) aySayi = aylar[k];
        });

        bulunanTarih = `${yil}-${aySayi}-${gun}`;
    }

    return NextResponse.json({
      baslik: baslik,
      aciklama: detayMetni,
      tarih: bulunanTarih
    });

  } catch (error) {
    return NextResponse.json({ error: 'Analiz hatası' }, { status: 500 });
  }
}