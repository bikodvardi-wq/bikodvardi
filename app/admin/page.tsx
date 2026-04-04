"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ kampanya: 0, marka: 0, sektor: 0, aktifKampanya: 0, bekleyenIletisim: 0 });
  const [tumKampanyalar, setTumKampanyalar] = useState<any[]>([]);
  const [filtreliKampanyalar, setFiltreliKampanyalar] = useState<any[]>([]);
  
  // FİLTRE STATE'LERİ
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliMarka, setSeciliMarka] = useState('');
  const [seciliDurum, setSeciliDurum] = useState(''); // 'aktif' | 'pasif'
  const [benzersizMarkalar, setBenzersizMarkalar] = useState<string[]>([]);
  
  const [yukleniyor, setYukleniyor] = useState(true);

  // 📧 Mail Kopyalama Fonksiyonu
  const copyMail = (mail: string) => {
    if(!mail) return alert("Bu markanın maili kayıtlı değil!");
    navigator.clipboard.writeText(mail);
    alert("📧 Mail adresi kopyalandı!");
  };

  // 🗑️ YENİ: Gerçek Silme Fonksiyonu
  const kampanyaSil = async (id: number, baslik: string) => {
    const onay = window.confirm(`"${baslik}" kampanyasını kalıcı olarak silmek istediğinize emin misiniz?`);
    
    if (onay) {
      const { error } = await supabase
        .from('kampanya')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Silme işlemi sırasında bir hata oluştu: " + error.message);
      } else {
        // Silineni anında ekrandan kaldır (Sayfa yenilemeye gerek kalmaz)
        setTumKampanyalar(prev => prev.filter(k => k.id !== id));
        // Filtreli listeyi de anında güncelle
        setFiltreliKampanyalar(prev => prev.filter(k => k.id !== id));
        
        // İstatistikleri de 1 düşür
        setStats(prev => ({ 
            ...prev, 
            kampanya: prev.kampanya - 1 
        }));
      }
    }
  };

  const veriGetir = async () => {
    setYukleniyor(true);
    const { count: kSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' });
    const { count: mSayisi } = await supabase.from('marka').select('*', { count: 'exact' });
    const { count: sSayisi } = await supabase.from('sektor').select('*', { count: 'exact' });
    const { count: aSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' }).gt('bitis_date', new Date().toISOString());
    const { count: iSayisi } = await supabase.from('brand_contacts').select('*', { count: 'exact' }).eq('status', 'Beklemede');

    setStats({ kampanya: kSayisi || 0, marka: mSayisi || 0, sektor: sSayisi || 0, aktifKampanya: aSayisi || 0, bekleyenIletisim: iSayisi || 0 });

    const { data } = await supabase
      .from('kampanya')
      .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, marka_email), faydalanan_marka_bilgisi:fayd_marka(marka_adi)')
      .order('id', { ascending: false });
      
    const kampanyalar = data || [];
    setTumKampanyalar(kampanyalar);
    setFiltreliKampanyalar(kampanyalar);
    
    // Filtre için benzersiz marka isimlerini çıkar
    const markalarListesi = Array.from(new Set(kampanyalar.map(k => k.yapan_marka_bilgisi?.marka_adi))).filter(Boolean) as string[];
    setBenzersizMarkalar(markalarListesi.sort());

    setYukleniyor(false);
  };

  useEffect(() => { veriGetir(); }, []);

  // AKILLI FİLTRELEME MANTIĞI
  useEffect(() => {
    let sonuclar = tumKampanyalar;

    if (aramaMetni) {
      sonuclar = sonuclar.filter(k => 
        k.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        k.yapan_marka_bilgisi?.marka_adi.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    if (seciliMarka) {
      sonuclar = sonuclar.filter(k => k.yapan_marka_bilgisi?.marka_adi === seciliMarka);
    }

    if (seciliDurum === 'aktif') {
      sonuclar = sonuclar.filter(k => !k.bitis_date || new Date(k.bitis_date) >= new Date());
    } else if (seciliDurum === 'pasif') {
      sonuclar = sonuclar.filter(k => k.bitis_date && new Date(k.bitis_date) < new Date());
    }

    setFiltreliKampanyalar(sonuclar);
  }, [aramaMetni, seciliMarka, seciliDurum, tumKampanyalar]);

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse text-center text-2xl font-['Outfit']">biKodVardı Panel Yükleniyor...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-['Plus_Jakarta_Sans']">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Komuta Merkezi 🚀</h2>
            <p className="text-slate-500 font-medium italic">Buket Ö. ARMUTCU | İş Geliştirme Modu</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <Link href="/admin/marka-takip" className="bg-emerald-600 text-white px-6 py-4 rounded-3xl font-bold hover:scale-105 transition-all no-underline flex items-center gap-2">
                🤝 Marka Takip {stats.bekleyenIletisim > 0 && <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs">{stats.bekleyenIletisim}</span>}
             </Link>
             <Link href="/admin/kampanya-ekle" className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-bold hover:bg-black shadow-lg transition-all no-underline">
                + Yeni Kampanya
             </Link>
          </div>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard title="Kampanya" value={stats.kampanya} icon="🏷️" color="bg-blue-50 text-blue-600" />
          <StatCard title="Aktif" value={stats.aktifKampanya} icon="🔥" color="bg-green-50 text-green-600" />
          <StatCard title="Marka" value={stats.marka} icon="🏢" color="bg-purple-50 text-purple-600" />
          <StatCard title="Bekleyen" value={stats.bekleyenIletisim} icon="📩" color="bg-emerald-50 text-emerald-600" />
          <StatCard title="Sektör" value={stats.sektor} icon="📦" color="bg-orange-50 text-orange-600" />
      </div>

      {/* GELİŞMİŞ FİLTRE VE ARAMA ALANI */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Kelime veya marka ile ara..."
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
          />
          
          <select 
            value={seciliMarka} 
            onChange={(e) => setSeciliMarka(e.target.value)}
            className="px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Markalar</option>
            {benzersizMarkalar.map((marka, index) => (
              <option key={index} value={marka}>{marka}</option>
            ))}
          </select>

          <select 
            value={seciliDurum} 
            onChange={(e) => setSeciliDurum(e.target.value)}
            className="px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">🟢 Sadece Aktifler</option>
            <option value="pasif">🔴 Süresi Bitenler</option>
          </select>

          {(aramaMetni || seciliMarka || seciliDurum) && (
            <button 
              onClick={() => { setAramaMetni(''); setSeciliMarka(''); setSeciliDurum(''); }}
              className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
            >
              Temizle
            </button>
          )}
      </div>

      {/* LİSTE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        <th className="py-5 pl-8">Marka</th>
                        <th className="py-5">Kampanya Detayı</th>
                        <th className="py-5 text-center">Trend</th>
                        <th className="py-5 text-center">Durum</th>
                        <th className="py-5 text-right pr-8">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                    {filtreliKampanyalar.map((k) => {
                      const isAktif = !k.bitis_date || new Date(k.bitis_date) >= new Date();
                      const isTrend = (k.tiklanma_sayisi || 0) > 100; // 100 tıklama üstü trend
                      
                      return (
                        <tr key={k.id} className="group hover:bg-blue-50/20 border-b border-slate-50 transition-colors">
                            {/* MARKA & LOGO THUMBNAIL */}
                            <td className="py-4 pl-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl border border-slate-100 bg-white p-1.5 flex-shrink-0 flex items-center justify-center">
                                        {k.yapan_marka_bilgisi?.logo_url ? (
                                            <img src={k.yapan_marka_bilgisi.logo_url} className="max-h-full object-contain" alt="" />
                                        ) : "🏢"}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900 flex items-center gap-1">
                                            {k.yapan_marka_bilgisi?.marka_adi}
                                            <button 
                                                onClick={() => copyMail(k.yapan_marka_bilgisi?.marka_email)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-all"
                                                title="Maili Kopyala"
                                            >
                                                <span className="text-[10px]">📋</span>
                                            </button>
                                        </div>
                                        <div className="text-[9px] text-slate-400 uppercase tracking-tighter">
                                            {k.faydalanan_marka_bilgisi?.marka_adi ? `↳ ${k.faydalanan_marka_bilgisi.marka_adi}` : "Genel Kampanya"}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td className="py-4 text-slate-500 font-medium max-w-xs truncate" title={k.baslik}>{k.baslik}</td>
                            
                            {/* TREND GÖSTERGESİ */}
                            <td className="py-4 text-center">
                                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black ${isTrend ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-slate-50 text-slate-300'}`}>
                                    {isTrend ? '🔥 TREND' : '🚀 ' + (k.tiklanma_sayisi || 0)}
                                </div>
                            </td>

                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black ${isAktif ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-300'}`}>
                                {isAktif ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>

                            <td className="py-4 text-right pr-8 flex justify-end gap-2">
                                <Link href={`/admin/kampanya-duzenle/${k.slug}`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all">✏️</Link>
                                <button 
                                  onClick={() => kampanyaSil(k.id, k.baslik)} 
                                  className="p-2 hover:bg-red-50 rounded-lg text-red-300 hover:text-red-600 transition-all"
                                >
                                  🗑️
                                </button>
                            </td>
                        </tr>
                      )
                    })}
                    {filtreliKampanyalar.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 font-bold">
                          Aradığınız kritere uygun kampanya bulunamadı.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-md ${color}`}>{icon}</div>
            <div>
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-0.5">{title}</p>
                <p className="text-lg font-black text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>{value}</p>
            </div>
        </div>
    )
}