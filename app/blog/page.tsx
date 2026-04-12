import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Alışveriş Rehberi | biKodVardı',
  description: 'İnternetten güvenli alışveriş rehberleri, en iyi indirim taktikleri ve markaların kampanya sırları.',
};

export default async function BlogIndex() {
  const { data: yazilar } = await supabase
    .from('blog_yazilari')
    .select('id, baslik, slug, ozet, kapak_gorseli, created_at')
    .eq('yayin_durumu', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans'] text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="no-underline">
            <div className="text-2xl font-[900] tracking-tighter text-slate-900" style={{ fontFamily: 'Outfit' }}>
              bi<span className="text-blue-600">kod</span>vardı
            </div>
          </Link>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">Alışveriş Rehberi</span>
        <h1 className="text-4xl md:text-6xl font-[900] tracking-tight text-slate-900 mb-6" style={{ fontFamily: 'Outfit' }}>
          Daha Akıllıca <span className="text-blue-600 italic font-light">Alışveriş Yap.</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium">Tasarruf etmenin yolları, kampanya incelemeleri ve e-ticaret sırları.</p>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {yazilar?.map((yazi) => (
            <Link key={yazi.id} href={`/blog/${yazi.slug}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 no-underline flex flex-col">
              {yazi.kapak_gorseli && (
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${yazi.kapak_gorseli}')` }}></div>
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3" style={{ fontFamily: 'Outfit' }}>
                    {yazi.baslik}
                  </h2>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                    {yazi.ozet}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(yazi.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="text-blue-600 text-sm font-bold group-hover:translate-x-2 transition-transform">Okumaya Başla →</span>
                </div>
              </div>
            </Link>
          ))}
          {(!yazilar || yazilar.length === 0) && (
            <div className="col-span-full text-center py-20 text-slate-400 font-bold">
              Henüz bir yazı bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}