"use client";

import Link from 'next/link';

export default function Iletisim() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-20">
      <div className="bg-white border-b border-slate-200 py-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-[900] text-slate-900 tracking-tighter italic uppercase mb-4" style={{ fontFamily: 'Outfit' }}>
          Bize <span className="text-blue-600">Ulaşın</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">İş birliği, reklam veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-12">
        <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
          
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-xl">✉️</div>
          <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>E-Posta Adresimiz</h2>
          <p className="text-blue-100 text-lg mb-8 opacity-80">Her türlü sorunuz için bir e-posta uzağınızdayız.</p>
          
          <a href="mailto:bikodvardi@gmail.com" className="inline-block bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all no-underline shadow-lg">
            bikodvardi@gmail.com
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors tracking-[0.3em] uppercase no-underline">
            ← ANA SAYFAYA DÖN
          </Link>
        </div>
      </div>
    </main>
  );
}