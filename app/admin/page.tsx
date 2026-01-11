"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ kampanya: 0, marka: 0, sektor: 0, aktifKampanya: 0 });
  const [tumKampanyalar, setTumKampanyalar] = useState<any[]>([]);
  const [filtreliKampanyalar, setFiltreliKampanyalar] = useState<any[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumFiltresi, setDurumFiltresi] = useState('hepsi'); // YENİ: Durum filtresi state'i
  const [yukleniyor, setYukleniyor] = useState(true);

  const veriGetir = async () => {
    setYukleniyor(true);
    
    // İstatistikler
    const { count: kSayisi } = await supabase.from('campaign').select('*', { count: 'exact' });
    const { count: mSayisi } = await supabase.from('marka').select('*', { count: 'exact' });
    const { count: sSayisi } = await supabase.from('sektor').select('*', { count: 'exact' });
    const { count: aSayisi } = await supabase.from('campaign').select('*', { count: 'exact' }).gt('bitis_date', new Date().toISOString());

    setStats({ kampanya: kSayisi || 0, marka: mSayisi || 0, sektor: sSayisi || 0, aktifKampanya: aSayisi || 0 });

    // Tüm Kampanyalar
    const { data } = await supabase
      .from('campaign')
      .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi)')
      .order('id', { ascending: false });
      
    setTumKampanyalar(data || []);
    setFiltreliKampanyalar(data || []);
    setYukleniyor(false);
  };

  useEffect(() => { veriGetir(); }, []);

  // GELİŞMİŞ CANLI FİLTRELEME (Hem metin hem durum)
  useEffect(() => {
    const sonuclar = tumKampanyalar.filter(k => {
      const bugun = new Date().toISOString().split('T')[0];
      const isAktif = k.bitis_date >= bugun;

      // 1. Metin Uyumu (Başlık veya Marka)
      const metinUyumu = 
        k.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        k.yapan_marka_bilgisi?.marka_adi.toLowerCase().includes(aramaMetni.toLowerCase());

      // 2. Durum Uyumu
      let durumUyumu = true;
      if (durumFiltresi === 'aktif') durumUyumu = isAktif;
      if (durumFiltresi === 'pasif') durumUyumu = !isAktif;

      return metinUyumu && durumUyumu;
    });
    setFiltreliKampanyalar(sonuclar);
  }, [aramaMetni, durumFiltresi, tumKampanyalar]);

  const kampanyaSil = async (id: number) => {
    if (confirm('Bu kampanyayı silmek istediğine emin misin?')) {
      const { error } = await supabase.from('campaign').delete().eq('id', id);
      if (!error) veriGetir();
    }
  };

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse">Panel Yükleniyor...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-['Plus_Jakarta_Sans']">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Komuta Merkezi 🚀</h2>
            <p className="text-slate-500 font-medium">Toplam {stats.kampanya} kampanyayı yönetiyorsun.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin/marka-duzenle" className="bg-white text-slate-900 border border-slate-200 px-6 py-4 rounded-3xl font-bold hover:bg-slate-50 shadow-sm transition-all no-underline">
              🏷️ Markaları Yönet
            </Link>
            <Link href="/admin/kampanya-ekle" className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-bold hover:bg-black shadow-lg transition-all no-underline">
              + Yeni Kampanya
            </Link>
          </div>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="Toplam" value={stats.kampanya} icon="🏷️" color="bg-blue-50 text-blue-600" />
          <StatCard title="Aktif" value={stats.aktifKampanya} icon="🔥" color="bg-green-50 text-green-600" />
          <StatCard title="Marka" value={stats.marka} icon="🏢" color="bg-purple-50 text-purple-600" />
          <StatCard title="Sektör" value={stats.sektor} icon="📦" color="bg-orange-50 text-orange-600" />
      </div>

      {/* FİLTRELEME ALANI */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Marka veya kampanya ara..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
          />
        </div>
        
        {/* YENİ: DURUM SEÇİCİ */}
        <select 
          className="px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-600 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
          value={durumFiltresi}
          onChange={(e) => setDurumFiltresi(e.target.value)}
        >
          <option value="hepsi">Tüm Durumlar</option>
          <option value="aktif">Sadece Aktifler ✅</option>
          <option value="pasif">Süresi Dolanlar ❌</option>
        </select>
      </div>

      {/* TÜM KAMPANYALAR LİSTESİ */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Kampanya Arşivi ({filtreliKampanyalar.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        <th className="py-4 pl-8">Marka</th>
                        <th className="py-4">Kampanya Başlığı</th>
                        <th className="py-4">Durum</th>
                        <th className="py-4 text-right pr-8">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                    {filtreliKampanyalar.map((k) => {
                      const isAktif = new Date(k.bitis_date) >= new Date();
                      return (
                        <tr key={k.id} className="group hover:bg-blue-50/30 border-b border-slate-50 last:border-0 transition-colors">
                            <td className="py-4 pl-8 font-black text-slate-900">{k.yapan_marka_bilgisi?.marka_adi || 'Genel'}</td>
                            <td className="py-4 font-medium text-slate-500">{k.baslik}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black ${isAktif ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                                {isAktif ? 'Aktif' : 'Süresi Doldu'}
                              </span>
                            </td>
                            <td className="py-4 text-right pr-8 flex justify-end gap-2">
                                <Link 
                                  href={`/admin/kampanya-duzenle/${k.slug}`} 
                                  className="px-5 py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all no-underline text-slate-600 font-bold text-[10px] uppercase tracking-wide"
                                >
                                  Düzenle
                                </Link>
                                <button 
                                  onClick={() => kampanyaSil(k.id)} 
                                  className="px-4 py-2.5 bg-white border border-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-slate-300 font-bold text-[10px] uppercase"
                                >
                                  Sil
                                </button>
                            </td>
                        </tr>
                      )
                    })}
                </tbody>
            </table>
          </div>
          
          {filtreliKampanyalar.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Aradığınız kriterde sonuç bulunamadı...</div>
          )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none mb-1">{title}</p>
                <p className="text-xl font-black text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>{value}</p>
            </div>
        </div>
    )
}