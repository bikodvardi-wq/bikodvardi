"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SektorEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [form, setForm] = useState({ sektor_adi: '', gorsel_url: '' });

  const slugOlustur = (text: string) => {
    return text.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    const { error } = await supabase.from('sektor').insert([{
      sektor_adi: form.sektor_adi,
      gorsel_url: form.gorsel_url,
      slug: slugOlustur(form.sektor_adi)
    }]);

    if (error) {
      alert('Hata: ' + error.message);
      setYukleniyor(false);
    } else {
      alert('✅ Sektör başarıyla eklendi!');
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black mb-8 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Sektör Kategorisi</h2>
      <form onSubmit={kaydet} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sektör Adı (Örn: Restoran)</label>
          <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" value={form.sektor_adi} onChange={(e) => setForm({...form, sektor_adi: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Banner Görsel URL</label>
          <input type="text" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl" value={form.gorsel_url} onChange={(e) => setForm({...form, gorsel_url: e.target.value})} />
        </div>
        <button disabled={yukleniyor} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg">
          {yukleniyor ? 'Kaydediliyor...' : 'Kategoriyi Yayınla'}
        </button>
      </form>
    </div>
  );
}