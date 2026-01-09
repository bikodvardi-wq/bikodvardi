"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [oturumVarMi, setOturumVarMi] = useState(false);

  // GÜVENLİK KONTROLÜ (BODYGUARD)
  useEffect(() => {
    const kontrolEt = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Oturum yoksa login'e postala
        router.push('/login');
      } else {
        // Oturum varsa içeri al
        setOturumVarMi(true);
      }
    };
    kontrolEt();
  }, [router]);

  const cikisYap = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Oturum kontrol edilene kadar bembeyaz ekran göster (Panel gözükmesin)
  if (!oturumVarMi) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] flex">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-72 bg-[#0D0F14] text-white fixed h-full hidden md:flex flex-col p-8 z-50">
        
        {/* LOGO */}
        <div className="mb-12 px-2">
            <h1 className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                bi<span className="text-blue-600">kod</span>vardı
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">Admin Paneli</span>
            </div>
        </div>

        {/* MENÜ LİNKLERİ */}
        <nav className="flex-1 space-y-3">
            <NavItem href="/admin" icon="📊" label="Genel Bakış" active={pathname === '/admin'} />
            <NavItem href="/admin/kontrol-listesi" icon="✅" label="Haftalık Kontrol" active={pathname === '/admin/kontrol-listesi'} />

            <div className="pt-6 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">İçerik Yönetimi</div>
            
            <NavItem href="/admin/kampanya-ekle" icon="✨" label="Kampanya Ekle" active={pathname === '/admin/kampanya-ekle'} />
            <NavItem href="/admin/marka-ekle" icon="🏢" label="Marka Ekle" active={pathname === '/admin/marka-ekle'} />
            <NavItem href="/admin/sektor-ekle" icon="📦" label="Sektör Ekle" active={pathname === '/admin/sektor-ekle'} />
        </nav>

        {/* ÇIKIŞ VE SİTEYE DÖN BUTONLARI */}
        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
            <button 
              onClick={cikisYap}
              className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-all text-xs font-black uppercase tracking-widest w-full text-left"
            >
                <span>🚪</span> Güvenli Çıkış
            </button>
            
            <Link 
              href="/" 
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest group no-underline"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Siteye Geri Dön
            </Link>
        </div>
      </aside>

      {/* İÇERİK ALANI */}
      <main className="flex-1 md:ml-72 p-8 md:p-16 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string, icon: string, label: string, active: boolean }) {
    return (
        <Link 
          href={href} 
          className={`
            flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 no-underline
            ${active 
              ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-[1.02]' 
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }
          `}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-bold text-sm tracking-wide">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
        </Link>
    )
}