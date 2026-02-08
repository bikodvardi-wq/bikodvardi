"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RadarPaneli() {
  const [markalar, setMarkalar] = useState([]);
  const [seciliMarka, setSeciliMarka] = useState(null);
  const [taramaSonucu, setTaramaSonucu] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Sadece Sitemap URL'i tanımlanmış markaları getir
  useEffect(() => {
    async function getir() {
      const { data } = await supabase
        .from('marka')
        .select('*')
        .not('sitemap_url', 'is', null) // Sadece sitemap'i olanları getir
        .order('marka_adi');
      
      setMarkalar(data || []);
    }
    getir();
  }, []);

  const taramayiBaslat = async () => {
    if (!seciliMarka) return;
    
    setYukleniyor(true);
    setTaramaSonucu(null);

    try {
      const res = await fetch('/api/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marka_id: seciliMarka.id,
          sitemap_url: seciliMarka.sitemap_url,
          sitemap_filter: seciliMarka.sitemap_filter
        })
      });

      const data = await res.json();
      
      if (data.error || data.hata) {
        alert("Hata: " + (data.error || data.hata));
      } else {
        setTaramaSonucu(data);
      }
    } catch (err) {
      alert("Bir şeyler ters gitti.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>📡 Kampanya Radarı</h1>
        <p style={{ color: '#64748b' }}>Otomatik sitemap tarayıcısı ile yeni fırsatları keşfet.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
        
        {/* SOL TARAFA: Marka Seçimi */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px' }}>
            TAKİPTEKİ MARKALAR ({markalar.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {markalar.map(m => (
              <button
                key={m.id}
                onClick={() => { setSeciliMarka(m); setTaramaSonucu(null); }}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: seciliMarka?.id === m.id ? '#eff6ff' : 'transparent',
                  color: seciliMarka?.id === m.id ? '#2563eb' : '#334155',
                  fontWeight: seciliMarka?.id === m.id ? 'bold' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {m.marka_adi}
              </button>
            ))}
            {markalar.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8' }}>Henüz sitemap eklenmiş marka yok.</p>}
          </div>
        </div>

        {/* SAĞ TARAF: Sonuç Ekranı */}
        <div>
          {seciliMarka ? (
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
              
              {/* Başlık Alanı */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{seciliMarka.marka_adi}</h2>
                  <a href={seciliMarka.sitemap_url} target="_blank" style={{ fontSize: '12px', color: '#64748b', textDecoration: 'none' }}>🔗 {seciliMarka.sitemap_url}</a>
                </div>
                <button 
                  onClick={taramayiBaslat}
                  disabled={yukleniyor}
                  style={{
                    background: yukleniyor ? '#94a3b8' : '#000',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: yukleniyor ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {yukleniyor ? 'TARANIYOR...' : '🚀 ŞİMDİ TARA'}
                </button>
              </div>

              {/* SONUÇLAR */}
              {taramaSonucu && (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: '#334155' }}>{taramaSonucu.toplamLink}</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Toplam Link (Filtreli)</div>
                    </div>
                    <div style={{ background: taramaSonucu.yeniFirsatSayisi > 0 ? '#dcfce7' : '#f1f5f9', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: taramaSonucu.yeniFirsatSayisi > 0 ? '#166534' : '#64748b' }}>
                        {taramaSonucu.yeniFirsatSayisi}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: taramaSonucu.yeniFirsatSayisi > 0 ? '#166534' : '#64748b', textTransform: 'uppercase' }}>
                        YENİ FIRSAT BULUNDU
                      </div>
                    </div>
                  </div>

                  {/* LİSTE */}
                  {taramaSonucu.yeniFirsatSayisi > 0 ? (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>👇 Keşfedilen Yeni Linkler:</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {taramaSonucu.yeniLinkler.map((link, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', color: '#334155' }}>
                              {link}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <a href={link} target="_blank" style={{ padding: '8px 15px', background: '#f1f5f9', color: '#475569', textDecoration: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                                    İncele
                                </a>
                                <button 
                                    onClick={() => {
                                        // Basit bir kopyalama veya kampanya ekleme sayfasına yönlendirme yapılabilir
                                        window.open(`/admin/kampanya/ekle?url=${encodeURIComponent(link)}&marka=${seciliMarka.id}`, '_blank');
                                    }}
                                    style={{ padding: '8px 15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    + SİTEYE EKLE
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <p>🎉 Tebrikler! Tüm kampanyalar zaten sistemde kayıtlı.</p>
                    </div>
                  )}

                </div>
              )}

              {!taramaSonucu && !yukleniyor && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#cbd5e1' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📡</div>
                    <p>Taramayı başlatmak için butona basın.</p>
                </div>
              )}

            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <p>Soldan bir marka seçin.</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}