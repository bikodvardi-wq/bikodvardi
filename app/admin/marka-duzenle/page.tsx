"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminMarkaDuzenle() {
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [seciliMarka, setSeciliMarka] = useState<any>(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [webSiteUrl, setWebSiteUrl] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  // 1. Tüm markaları listelemek için çek
  useEffect(() => {
    const markalariGetir = async () => {
      const { data } = await supabase.from('marka').select('*').order('marka_adi', { ascending: true });
      if (data) setMarkalar(data);
    };
    markalariGetir();
  }, []);

  // 2. Bir marka seçildiğinde form alanlarını doldur
  const markaSec = (m: any) => {
    setSeciliMarka(m);
    setAffiliateLink(m.affiliate_link || '');
    setWebSiteUrl(m.web_site_url || '');
    setMesaj('');
  };

  // 3. Güncelleme işlemi
  const guncelle = async () => {
    if (!seciliMarka) return;
    setYukleniyor(true);
    
    const { error } = await supabase
      .from('marka')
      .update({ 
        affiliate_link: affiliateLink,
        web_site_url: webSiteUrl 
      })
      .eq('id', seciliMarka.id);

    setYukleniyor(false);
    if (error) {
      setMesaj("Hata oluştu: " + error.message);
    } else {
      setMesaj("Başarıyla güncellendi! ✅");
      // Listeyi güncelle
      const yeniList = markalar.map(m => m.id === seciliMarka.id ? {...m, affiliate_link: affiliateLink, web_site_url: webSiteUrl} : m);
      setMarkalar(yeniList);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Bi<span className="text-blue-600">Kod</span>Vardı - Admin Panel
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SOL: MARKA LİSTESİ */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 h-[600px] overflow-y-auto shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Marka Seç ({markalar.length})</p>
            <div className="space-y-2">
              {markalar.map(m => (
                <button 
                  key={m.id}
                  onClick={() => markaSec(m)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${seciliMarka?.id === m.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {m.marka_adi}
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: DÜZENLEME FORMU */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            {seciliMarka ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{seciliMarka.marka_adi} Düzenleniyor</h2>
                  <p className="text-xs text-slate-400 font-medium">Marka ID: {seciliMarka.id}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Affiliate (Para Kazandıran) Link</label>
                    <input 
                      type="text" 
                      value={affiliateLink}
                      onChange={(e) => setAffiliateLink(e.target.value)}
                      placeholder="Admitad veya Trendyol linkini buraya yapıştır"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Resmi Web Sitesi Linki</label>
                    <input 
                      type="text" 
                      value={webSiteUrl}
                      onChange={(e) => setWebSiteUrl(e.target.value)}
                      placeholder="https://www.marka.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={guncelle}
                  disabled={yukleniyor}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl"
                >
                  {yukleniyor ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                </button>

                {mesaj && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center ${mesaj.includes('Hata') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {mesaj}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <p className="mt-4 font-bold uppercase text-[10px] tracking-widest">Lütfen sol listeden bir marka seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}