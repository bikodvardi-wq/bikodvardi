"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Hakkimizda() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-20">
      {/* ÜST HEADER */}
      <div className="bg-white border-b border-slate-200 py-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 group bg-transparent border-none cursor-pointer p-0"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">GERİ DÖN</span>
          </button>
          
          <h1 className="text-5xl md:text-6xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>
            Biz Kimiz<span className="text-blue-600">?</span>
          </h1>
          <p className="text-slate-500 mt-4 max-w-2xl font-medium leading-relaxed">
            Türkiye'nin en sevilen markalarının güncel kampanya ve indirim kodlarını tek bir merkezde toplayan, dijital tasarrufun yeni nesil rehberiyiz.
          </p>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Vizyonumuz */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight" style={{ fontFamily: 'Outfit' }}>Amacımız</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                <strong>bi<span className="text-blue-600 font-bold">kod</span>vardı</strong> olarak, alışveriş deneyimini daha akıllı ve ekonomik hale getirmek için yola çıktık. Binlerce marka arasından kaybolmak yerine, kullanıcılarımıza en güncel fırsatları en hızlı şekilde ulaştırmayı hedefliyoruz.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Platformumuzda yer alan tüm kampanyalar, ekibimiz ve sistemlerimiz tarafından düzenli olarak kontrol edilerek doğrulanmaktadır. Amacımız sadece kod paylaşmak değil, "gerçekten çalışan" fırsatları sunmaktır.
              </p>
            </section>

            <section className="bg-blue-600 p-10 rounded-[2.5rem] shadow-xl text-white">
              <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ fontFamily: 'Outfit' }}>Neden Biz?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-white/20 p-1 rounded-lg">✓</span>
                  <p className="font-medium text-blue-50">Güncel ve doğrulanmış kampanya verileri.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/20 p-1 rounded-lg">✓</span>
                  <p className="font-medium text-blue-50">Karmaşadan uzak, kullanıcı dostu modern arayüz.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/20 p-1 rounded-lg">✓</span>
                  <p className="font-medium text-blue-50">Türkiye'nin en büyük markalarıyla doğrudan entegrasyon.</p>
                </li>
              </ul>
            </section>
          </div>

          {/* İletişim / Bilgi */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">✉️</div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Bize Ulaşın</h3>
              <p className="text-slate-500 text-sm font-medium">bikodvardi@gmail.com</p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-sm text-center text-white">
              <h3 className="font-black uppercase text-[10px] tracking-[0.3em] mb-4 opacity-60">Sloganımız</h3>
              <p className="text-xl font-black italic tracking-tight" style={{ fontFamily: 'Outfit' }}>
                "Her alışverişte bi<span className="text-blue-500 italic">kod</span>vardı dedirten fırsatlar!"
              </p>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-20 py-12 text-center opacity-40">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">bi<span className="text-blue-600">kod</span>vardı — 2026</p>
      </footer>
    </main>
  );
}