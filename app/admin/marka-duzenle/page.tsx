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

  useEffect(() => {
    const markalariGetir = async () => {
      const { data } = await supabase.from('marka').select('*').order('marka_adi', { ascending: true });
      if (data) setMarkalar(data);
    };
    markalariGetir();
  }, []);

  const markaSec = (m: any) => {
    setSeciliMarka(m);
    setAffiliateLink(m.affiliate_link || '');
    setWebSiteUrl(m.web_site_url || '');
    setMesaj('');
  };

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
      setMesaj("Hata: " + error.message);
    } else {
      setMesaj("Başarıyla güncellendi! ✅");
      const yeniList = markalar.map(m => m.id === seciliMarka.id ? {...m, affiliate_link: affiliateLink, web_site_url: webSiteUrl} : m);
      setMarkalar(yeniList);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Admin Panel
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border rounded-3xl p-6 h-[600px] overflow-y-auto shadow-sm">
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
          <div className="md:col-span-2 bg-white border rounded-3xl p-8 shadow-sm">
            {seciliMarka ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900">{seciliMarka.marka_adi}</h2>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    placeholder="Affiliate Link"
                    className="w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm"
                  />
                  <input 
                    type="text" 
                    value={webSiteUrl}
                    onChange={(e) => setWebSiteUrl(e.target.value)}
                    placeholder="Web Site Link"
                    className="w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm"
                  />
                </div>
                <button onClick={guncelle} disabled={yukleniyor} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase hover:bg-blue-600">
                  {yukleniyor ? 'İŞLENİYOR...' : 'KAYDET'}
                </button>
                {mesaj && <p className="text-center font-bold text-xs">{mesaj}</p>}
              </div>
            ) : (
              <p className="text-center text-slate-300 font-bold uppercase text-[10px]">Marka Seçiniz</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}