import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  const { data: yazi } = await supabase
    .from('blog_yazilari')
    .select('baslik, ozet, slug, kapak_gorseli')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!yazi) return { title: 'Yazı Bulunamadı | biKodVardı' };

  return {
    title: `${yazi.baslik} | biKodVardı Blog`,
    description: yazi.ozet || `${yazi.baslik} hakkında detaylı bilgi ve alışveriş rehberi.`,
    openGraph: {
      title: yazi.baslik,
      description: yazi.ozet,
      images: yazi.kapak_gorseli ? [yazi.kapak_gorseli] : [],
      type: 'article',
    }
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const { data: yazi, error } = await supabase
    .from('blog_yazilari')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !yazi) {
    notFound();
  }

  // SEO: AdSense Botları İçin Makale Şeması (Article Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": yazi.baslik,
    "image": yazi.kapak_gorseli ? [yazi.kapak_gorseli] : [],
    "datePublished": yazi.created_at,
    "dateModified": yazi.created_at,
    "author": {
      "@type": "Organization",
      "name": "biKodVardı Editör Ekibi",
      "url": "https://bikodvardi.com"
    }
  };

  return (
    <main className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 py-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/blog" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors no-underline">
            ← Blog'a Dön
          </Link>
          <Link href="/" className="no-underline">
            <div className="text-xl font-[900] tracking-tighter text-slate-900" style={{ fontFamily: 'Outfit' }}>
              bi<span className="text-blue-600">kod</span>vardı
            </div>
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-[900] tracking-tight text-slate-900 mb-6 leading-tight" style={{ fontFamily: 'Outfit' }}>
            {yazi.baslik}
          </h1>
          <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {new Date(yazi.created_at).toLocaleDateString('tr-TR')}
            </span>
            <span>•</span>
            <span>BİKODVARDI REHBER</span>
          </div>
        </header>

        {yazi.kapak_gorseli && (
          <div className="relative w-full h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
            <Image src={yazi.kapak_gorseli} alt={yazi.baslik} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        {/* Makale İçeriği (HTML olarak render edilir) */}
        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: yazi.icerik }} 
        />
      </article>

      {/* Makale Sonu - Ana Sayfaya Yönlendirme (Dönüşüm Hunisi) */}
      <section className="bg-[#F8FAFC] py-20 border-t border-slate-200 mt-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-black mb-4" style={{ fontFamily: 'Outfit' }}>Okuduklarını Fırsata Çevir!</h3>
          <p className="text-slate-500 mb-8 font-medium">Rehberimizi okuduğuna göre artık en iyi fiyatı nasıl bulacağını biliyorsun. Şimdi güncel indirim kodlarına göz atma zamanı.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-black px-8 py-4 rounded-full hover:bg-black transition-colors shadow-xl">
            İndirim Kodlarını Keşfet
          </Link>
        </div>
      </section>
    </main>
  );
}