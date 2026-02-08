"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminMarkaDuzenle() {
  const [markalar, setMarkalar] = useState([]);
  const [seciliMarka, setSeciliMarka] = useState(null);
  
  // State'ler
  const [affiliateLink, setAffiliateLink] = useState('');
  const [webSiteUrl, setWebSiteUrl] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');     // YENİ
  const [sitemapFilter, setSitemapFilter] = useState(''); // YENİ

  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    async function markalariGetir() {
      const { data } = await supabase.from('marka').select('*').order('marka_adi');
      if (data) setMarkalar(data);
    }
    markalariGetir();
  }, []);

  // Marka seçildiğinde inputları doldur
  const markaSec = (m) => {
    setSeciliMarka(m);
    setAffiliateLink(m.affiliate_link || '');
    setWebSiteUrl(m.web_site_url || '');
    setSitemapUrl(m.sitemap_url || '');       // YENİ
    setSitemapFilter(m.sitemap_filter || ''); // YENİ
    setMesaj('');
  };

  const guncelle = async () => {
    if (!seciliMarka) return;
    setYukleniyor(true);
    
    // Veritabanını güncelle
    const { error } = await supabase
      .from('marka')
      .update({ 
        affiliate_link: affiliateLink, 
        web_site_url: webSiteUrl,
        sitemap_url: sitemapUrl,        // YENİ
        sitemap_filter: sitemapFilter   // YENİ
      })
      .eq('id', seciliMarka.id);

    setYukleniyor(false);
    
    if (error) {
        setMesaj("Hata oluştu! " + error.message);
    } else {
        setMesaj("Başarıyla güncellendi! ✅");
        
        // Sol taraftaki listeyi de güncelle ki eski veri kalmasın
        const guncelMarkalar = markalar.map(m => {
            if (m.id === seciliMarka.id) {
                return { 
                    ...m, 
                    affiliate_link: affiliateLink, 
                    web_site_url: webSiteUrl, 
                    sitemap_url: sitemapUrl, 
                    sitemap_filter: sitemapFilter 
                };
            }
            return m;
        });
        setMarkalar(guncelMarkalar);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px'}}>Marka Düzenleme Paneli</h1>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', height: 'calc(100vh - 150px)' }}>
        
        {/* SOL LİSTE */}
        <div style={{ width: '300px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px' }}>
          {markalar.map((m) => (
            <div 
              key={m.id} 
              onClick={() => markaSec(m)}
              style={{ 
                padding: '15px', 
                cursor: 'pointer', 
                borderBottom: '1px solid #f1f5f9', 
                background: seciliMarka?.id === m.id ? '#3b82f6' : 'white', 
                color: seciliMarka?.id === m.id ? 'white' : '#334155',
                fontWeight: seciliMarka?.id === m.id ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              {m.marka_adi}
            </div>
          ))}
        </div>

        {/* SAĞ DÜZENLEME ALANI */}
        <div style={{ flex: 1, background: 'white', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '15px', overflowY: 'auto' }}>
          {seciliMarka ? (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                {seciliMarka.logo_url && <img src={seciliMarka.logo_url} alt={seciliMarka.marka_adi} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />}
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{seciliMarka.marka_adi}</h2>
              </div>

              {/* Temel Linkler */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Affiliate (Satış Ortaklığı) Linki</label>
                <input 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                    value={affiliateLink} 
                    onChange={e => setAffiliateLink(e.target.value)} 
                    placeholder="https://gelirortaklari..."
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Resmi Site Linki</label>
                <input 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                    value={webSiteUrl} 
                    onChange={e => setWebSiteUrl(e.target.value)} 
                    placeholder="https://www.marka.com"
                />
              </div>

              {/* OTOMASYON BÖLÜMÜ - MAVİ KUTU */}
              <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #dbeafe', marginTop: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚡ Otomasyon / Radar Ayarları
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Sitemap XML Linki</label>
                    <input 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', outline: 'none', fontSize: '13px' }} 
                        value={sitemapUrl} 
                        onChange={e => setSitemapUrl(e.target.value)} 
                        placeholder="https://www.marka.com/sitemap.xml"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Filtre Kelimesi</label>
                    <input 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', outline: 'none', fontSize: '13px' }} 
                        value={sitemapFilter} 
                        onChange={e => setSitemapFilter(e.target.value)} 
                        placeholder="Örn: kampanyalar"
                    />
                </div>
              </div>

              <button 
                style={{ marginTop: '30px', width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }} 
                onClick={guncelle} 
                disabled={yukleniyor}
              >
                {yukleniyor ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
              </button>

              {mesaj && <p style={{ marginTop: '20px', padding: '15px', background: mesaj.includes('Hata') ? '#fee2e2' : '#dcfce7', color: mesaj.includes('Hata') ? '#991b1b' : '#166534', borderRadius: '8px', fontWeight: 'bold' }}>{mesaj}</p>}
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '40px' }}>👈</span>
                <p>Düzenlemek için soldan bir marka seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}