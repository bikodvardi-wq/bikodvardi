"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Giriş başarısız: ' + error.message);
      setYukleniyor(false);
    } else {
      // Başarılı! Admin paneline yönlendir
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center p-6 font-['Inter']">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl"></div>

        <div className="text-center mb-10 relative">
          <h1 className="text-2xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>
            bi<span className="text-blue-600">kod</span>vardı
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Yönetici Girişi</p>
        </div>

        <form onSubmit={girisYap} className="space-y-6 relative">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">E-Posta Adresi</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              placeholder="admin@bikodvardi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Şifre</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={yukleniyor}
            type="submit" 
            className="w-full bg-black text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-600 hover:scale-[1.02] transition-all shadow-xl"
          >
            {yukleniyor ? 'Kontrol Ediliyor...' : 'Panele Giriş Yap →'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-300 font-medium">Sadece yetkili personel içindir.</p>
        </div>
      </div>
    </div>
  );
}