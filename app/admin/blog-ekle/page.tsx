"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BlogEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);

  const [form, setForm] = useState({
    baslik: '',
    slug: '',
    ozet: '',
    icerik: '',
    kapak_gorseli: '',
    yayin_durumu: true
  });

  // Başlık yazıldığında otomatik slug oluşturur
  const slugOlustur = (metin: string) => {
    const trKarakterler: any = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', ' ': '-' };
    const yeniSlug = metin.toLowerCase()
      .split('')
      .map(char => trKarakterler[char] || char)
      .join('')
      .replace(/[^a-z0-9-]/g, '');
    setForm(prev => ({ ...prev, baslik: metin, slug: yeniSlug }));
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    const { error } = await supabase
      .from('blog_yazilari')
      .insert([form]);

    if (error) {
      alert('Hata: ' + error.message);
      setYukleniyor(false);
    } else {
      alert('✅ Blog yazısı başarıyla yayınlandı!');
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Blog Yazısı</h2>
        <button onClick={() => router.push('/admin')} className="text-slate-400 font-bold hover:text-black transition-colors text-sm uppercase">Vazgeç</button>
      </div>

      <form onSubmit={kaydet} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL KOLON: İÇERİK */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Yazı Başlığı</label>
              <input 
                required
                type="text" 
                placeholder="Örn: Trendyol İndirim Kodu Nasıl Kullanılır?"
                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-blue-600 transition-all"
                value={form.baslik}
                onChange={(e) => slugOlustur(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">İçerik (HTML Kullanabilirsin)</label>
              <textarea 
                required
                rows={15}
                placeholder="Makalenin tamamını buraya yaz..."
                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none focus:border-blue-600 transition-all font-mono text-sm"
                value={form.icerik}
                onChange={(e) => setForm({...form, icerik: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: AYARLAR & SEO */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">URL Uzantısı (Slug)</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border-none p-4 rounded-xl font-bold text-slate-500 text-sm outline-none"
                value={form.slug}
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kapak Görseli URL</label>
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-sm outline-none"
                value={form.kapak_gorseli}
                onChange={(e) => setForm({...form, kapak_gorseli: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kısa Özet (SEO)</label>
              <textarea 
                rows={4}
                placeholder="Google arama sonuçlarında görünecek kısa açıklama..."
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-sm outline-none"
                value={form.ozet}
                onChange={(e) => setForm({...form, ozet: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <input 
                type="checkbox" 
                id="yayin"
                checked={form.yayin_durumu}
                onChange={(e) => setForm({...form, yayin_durumu: e.target.checked})}
                className="w-5 h-5 accent-blue-600"
              />
              <label htmlFor="yayin" className="text-sm font-bold text-slate-700 cursor-pointer">Hemen Yayınla</label>
            </div>

            <button 
              disabled={yukleniyor}
              type="submit" 
              className="w-full bg-blue-600 hover:bg-black text-white p-5 rounded-2xl text-lg font-black tracking-tight transition-all shadow-lg"
            >
              {yukleniyor ? 'Yayınlanıyor...' : 'Yazıyı Yayınla 🚀'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}