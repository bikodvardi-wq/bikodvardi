"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Marka verisi için bir tip tanımlayalım (TypeScript hatalarını önler)
interface Marka {
  id: number;
  marka_adi: string;
  affiliate_link?: string;
  web_site_url?: string;
}

export default function AdminMarkaDuzenle() {
  const [markalar, setMarkalar] = useState<Marka[]>([]);
  const [seciliMarka, setSeciliMarka] = useState<Marka | null>(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [webSiteUrl, setWebSiteUrl] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    const markalariGetir = async () => {
      const { data, error } = await supabase
        .from('marka')
        .select('*')
        .order('marka_adi', { ascending: true });
      
      if (error) {
        console.error("Veri çekme hatası:", error);
      } else if (data) {
        setMarkalar(data as Marka[]);
      }
    };
    markalariGetir();
  }, []);

  const markaSec = (m: Marka) => {
    setSeciliMarka(m);
    setAffiliateLink(m.affiliate_link || '');
    setWebSiteUrl(m.web_site_url || '');
    setMesaj('');
  };

  const guncelle = async () => {
    if (!seciliMarka) return;
    setYukleniyor(true);
    setMesaj('');
    
    const { error } = await supabase
      .from('marka')
      .update({ 
        affiliate_link: affiliateLink,
        web_site_url: webSiteUrl 
      })
      .eq('id', seciliMarka.id);

    setYukleniyor(false);
    if (error) {
      setMesaj("Hata: " + error.message);
    } else {
      setMesaj("Başarıyla güncellendi! ✅");
      const yeniList = markalar.map(m => 
        m.id === seciliMarka.id ? { ...m, affiliate_link: affiliateLink, web_site_url: webSiteUrl } : m
      );
      setMarkalar(yeniList);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black mb-8 uppercase tracking-tighter">
          Admin Paneli
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Marka Listesi */}
          <div className="bg-white border rounded-2xl p-4 h-[500px] overflow-y-auto shadow-sm">
            <div className="space-y-1">
              {markalar.map((m) => (
                <button 
                  key={m.id}
                  onClick={() => markaSec(m)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    seciliMarka?.id === m.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'
                  }`}
                >
                  {m.marka_adi}
                </button>
              ))}
            </div>
          </div>

          {/* Düzenleme Alanı */}
          <div className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            {seciliMarka ? (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">{seciliMarka.marka_adi}</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Affiliate Link</label>
                    <input 
                      type="text" 
                      value={affiliateLink}
                      onChange={(e) => setAffiliateLink(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Resmi Site Link</label>
                    <input 
                      type="text" 
                      value={webSiteUrl}
                      onChange={(e) => setWebSiteUrl(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={guncelle} 
                  disabled={yukleniyor} 
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {yukleniyor ? 'İŞLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                </button>
                {mesaj && (
                  <p className={`text-center font-bold text-sm ${mesaj.includes('Hata') ? 'text-red-500' : 'text-green-600'}`}>
                    {mesaj}
                  </p>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 font-bold uppercase text-xs">Lütfen Marka Seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}