"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminMarkaDuzenle() {
  const [markalar, setMarkalar] = useState([]);
  const [seciliMarka, setSeciliMarka] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [webSiteUrl, setWebSiteUrl] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    async function markalariGetir() {
      const { data } = await supabase.from('marka').select('*').order('marka_adi');
      if (data) setMarkalar(data);
    }
    markalariGetir();
  }, []);

  const guncelle = async () => {
    if (!seciliMarka) return;
    setYukleniyor(true);
    const { error } = await supabase
      .from('marka')
      .update({ affiliate_link: affiliateLink, web_site_url: webSiteUrl })
      .eq('id', seciliMarka.id);

    setYukleniyor(false);
    setMesaj(error ? "Hata oluştu!" : "Başarıyla güncellendi! ✅");
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <h1>Marka Link Düzenleyici</h1>
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        <div style={{ width: '300px', height: '600px', overflowY: 'auto', background: 'white', border: '1px solid #ddd', borderRadius: '15px' }}>
          {markalar.map((m) => (
            <div 
              key={m.id} 
              onClick={() => { setSeciliMarka(m); setAffiliateLink(m.affiliate_link || ''); setWebSiteUrl(m.web_site_url || ''); setMesaj(''); }}
              style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', background: seciliMarka?.id === m.id ? '#3b82f6' : 'transparent', color: seciliMarka?.id === m.id ? 'white' : 'black' }}
            >
              {m.marka_adi}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: 'white', padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
          {seciliMarka ? (
            <div>
              <h2>{seciliMarka.marka_adi}</h2>
              <div style={{ marginTop: '20px' }}>
                <p><b>Affiliate Link:</b></p>
                <input style={{ width: '100%', padding: '12px', marginTop: '8px' }} value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} />
              </div>
              <div style={{ marginTop: '20px' }}>
                <p><b>Resmi Site Linki:</b></p>
                <input style={{ width: '100%', padding: '12px', marginTop: '8px' }} value={webSiteUrl} onChange={e => setWebSiteUrl(e.target.value)} />
              </div>
              <button style={{ marginTop: '30px', padding: '15px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }} onClick={guncelle} disabled={yukleniyor}>
                {yukleniyor ? 'İŞLENİYOR...' : 'KAYDET'}
              </button>
              <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{mesaj}</p>
            </div>
          ) : <p>Lütfen bir marka seçin.</p>}
        </div>
      </div>
    </div>
  );
}