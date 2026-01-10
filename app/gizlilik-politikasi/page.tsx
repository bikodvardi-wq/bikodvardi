"use client";

import Link from 'next/link';

export default function GizlilikPolitikasi() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-20">
      <div className="bg-white border-b border-slate-200 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest no-underline mb-8 block">← ANA SAYFAYA DÖN</Link>
          <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter italic uppercase" style={{ fontFamily: 'Outfit' }}>
            Gizlilik <span className="text-blue-600">Politikası</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium uppercase text-xs tracking-widest">Son Güncelleme: Ocak 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 leading-relaxed text-slate-600 space-y-8">
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>1. Toplanan Veriler</h2>
          <p>biKodVardı olarak, ziyaretçilerimizin deneyimini iyileştirmek amacıyla standart log dosyaları ve çerezler aracılığıyla anonim veriler (IP adresi, tarayıcı türü, ziyaret zamanı) toplamaktayız.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>2. Çerezler (Cookies) ve Reklamlar</h2>
          <p>Sitemizde Google AdSense gibi üçüncü taraf reklam ağları kullanılabilir. Bu ağlar, ziyaretçilerimize ilgi alanlarına göre reklam sunmak amacıyla çerezleri kullanabilir. Kullanıcılar, tarayıcı ayarları üzerinden çerezleri yönetme veya tamamen kapatma hakkına sahiptir.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>3. Dış Bağlantılar (Affiliate)</h2>
          <p>Platformumuzda yer alan kampanya butonları, ilgili markaların resmi web sitelerine veya affiliate (ortaklık) ağlarına yönlendirme yapar. Bu dış sitelerin kendi gizlilik politikalarından biKodVardı sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>4. İletişim</h2>
          <p>Gizlilik politikamız hakkında sorularınız için bize <strong>bikodvardi@gmail.com</strong> adresinden ulaşabilirsiniz.</p>
        </section>
      </div>
    </main>
  );
}