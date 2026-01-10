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
      const yeniList = markalar.map((m: any) => 
        m.id === seciliMarka.id ? { ...m, affiliate_link: affiliateLink, web_site_url: webSiteUrl } : m
      );
      setMarkalar(yeniList);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border rounded-3xl p-6 h-[600px] overflow-y-auto">
            {markalar.map((m: any) => (
              <button 
                key={m.id}
                onClick={() => markaSec(m)}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 font-bold ${seciliMarka?.id === m.id ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                {m.marka_adi}
              </button>
            ))}
          </div>
          <div className="md:col-span-2 bg-white border rounded-3xl p-8">
            {seciliMarka ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black">{seciliMarka.marka_adi}</h2>
                <input 
                  className="w-full p-4 border rounded-xl"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  placeholder="Affiliate Link"
                />
                <input 
                  className="w-full p-4 border rounded-xl"
                  value={webSiteUrl}
                  onChange={(e) => setWebSiteUrl(e.target.value)}
                  placeholder="Web Site Link"
                />
                <button onClick={guncelle} disabled={yukleniyor} className="w-full bg-black text-white py-4 rounded-xl font-bold">
                  {yukleniyor ? 'KAYDEDİLİYOR...' : 'KAYDET'}
                </button>
                {mesaj && <p className="text-center font-bold">{mesaj}</p>}
              </div>
            ) : (
              <p className="text-center text-slate-300 font-bold uppercase pt-20">Marka Seçiniz</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}