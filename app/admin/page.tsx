"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ kampanya: 0, marka: 0, sektor: 0, aktifKampanya: 0, bekleyenIletisim: 0 });
  const [tumKampanyalar, setTumKampanyalar] = useState<any[]>([]);
  const [filtreliKampanyalar, setFiltreliKampanyalar] = useState<any[]>([]);
  const [markalar, setMarkalar] = useState<any[]>([]); 
  
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumFiltresi, setDurumFiltresi] = useState('hepsi'); 
  const [seciliYapanMarka, setSeciliYapanMarka] = useState('hepsi');
  const [seciliFaydalananMarka, setSeciliFaydalananMarka] = useState('hepsi');
  
  const [yukleniyor, setYukleniyor] = useState(true);

  const veriGetir = async () => {
    setYukleniyor(true);
    
    // Temel İstatistikler
    const { count: kSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' });
    const { count: mSayisi } = await supabase.from('marka').select('*', { count: 'exact' });
    const { count: sSayisi } = await supabase.from('sektor').select('*', { count: 'exact' });
    const { count: aSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' }).gt('bitis_date', new Date().toISOString());
    
    // YENİ: Marka İletişim Takibi (Cevap Bekleyenler)
    const { count: iSayisi } = await supabase.from('brand_contacts').select('*', { count: 'exact' }).eq('status', 'Beklemede');

    setStats({ 
        kampanya: kSayisi || 0, 
        marka: mSayisi || 0, 
        sektor: sSayisi || 0, 
        aktifKampanya: aSayisi || 0,
        bekleyenIletisim: iSayisi || 0
    });

    const { data: mData } = await supabase.from('marka').select('id, marka_adi').order('marka_adi');
    setMarkalar(mData || []);

    const { data } = await supabase
      .from('kampanya')
      .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi), faydalanan_marka_bilgisi:fayd_marka(marka_adi)')
      .order('id', { ascending: false });
      
    setTumKampanyalar(data || []);
    setFiltreliKampanyalar(data || []);
    setYukleniyor(false);
  };

  useEffect(() => { veriGetir(); }, []);

  useEffect(() => {
    const sonuclar = tumKampanyalar.filter(k => {
      const bugun = new Date().toISOString().split('T')[0];
      const isAktif = k.bitis_date >= bugun;
      const metinUyumu = 
        k.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        k.yapan_marka_bilgisi?.marka_adi.toLowerCase().includes(aramaMetni.toLowerCase());

      const durumUyumu = durumFiltresi === 'hepsi' ? true : (durumFiltresi === 'aktif' ? isAktif : !isAktif);
      const yapanMarkaUyumu = seciliYapanMarka === 'hepsi' ? true : String(k.yapan_marka) === seciliYapanMarka;
      const faydalananMarkaUyumu = seciliFaydalananMarka === 'hepsi' ? true : String(k.fayd_marka) === seciliFaydalananMarka;

      return metinUyumu && durumUyumu && yapanMarkaUyumu && faydalananMarkaUyumu;
    });
    setFiltreliKampanyalar(sonuclar);
  }, [aramaMetni, durumFiltresi, seciliYapanMarka, seciliFaydalananMarka, tumKampanyalar]);

  const kampanyaSil = async (id: number) => {
    if (confirm('Bu kampanyayı silmek istediğine emin misin?')) {
      const { error } = await supabase.from('kampanya').delete().eq('id', id);
      if (!error) veriGetir();
    }
  };

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse text-center text-2xl">biKodVardı Panel Yükleniyor...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-['Plus_Jakarta_Sans']">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Komuta Merkezi 🚀</h2>
            <p className="text-slate-500 font-medium">Buket Ö. ARMUTCU | İş Geliştirme Paneli</p>
          </div>
          <div className="flex flex-wrap gap-3">
             {/* YENİ: MARKA TAKİP (CRM) BUTONU */}
             <Link href="/admin/marka-takip" className="bg-emerald-600 text-white px-6 py-4 rounded-3xl font-bold hover:bg-emerald-700 shadow-sm transition-all no-underline flex items-center gap-2">
                🤝 Marka Takip {stats.bekleyenIletisim > 0 && <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs">{stats.bekleyenIletisim}</span>}
             </Link>
             <Link href="/admin/raporlar" className="bg-indigo-600 text-white px-6 py-4 rounded-3xl font-bold hover:bg-indigo-700 shadow-sm transition-all no-underline flex items-center gap-2">
                📊 Raporlar
             </Link>
             <Link href="/admin/medya-studyo" className="bg-slate-900 text-white px-6 py-4 rounded-3xl font-bold hover:bg-blue-600 shadow-sm transition-all no-underline flex items-center gap-2">
                🎨 Medya Stüdyosu
             </Link>
             <Link href="/admin/kampanya-ekle" className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-bold hover:bg-black shadow-lg transition-all no-underline">
                + Yeni Kampanya
             </Link>
          </div>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard title="Toplam" value={stats.kampanya} icon="🏷️" color="bg-blue-50 text-blue-600" />
          <StatCard title="Aktif" value={stats.aktifKampanya} icon="🔥" color="bg-green-50 text-green-600" />
          <StatCard title="Marka" value={stats.marka} icon="🏢" color="bg-purple-50 text-purple-600" />
          <StatCard title="Sektör" value={stats.sektor} icon="📦" color="bg-orange-50 text-orange-600" />
          {/* YENİ: İLETİŞİM İSTATİSTİĞİ */}
          <StatCard title="Bekleyen Mail" value={stats.bekleyenIletisim} icon="📩" color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* ... Filtreleme ve Liste bölümleri aynı kalabilir ... */}
      {/* (Kodun geri kalanı mevcut filtreleme yapını koruyor) */}
      
      {/* LİSTE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Kampanya Arşivi ({filtreliKampanyalar.length} Kayıt)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        <th className="py-4 pl-8">Markalar</th>
                        <th className="py-4">Kampanya Başlığı</th>
                        <th className="py-4 text-center">Görüntülenme</th>
                        <th className="py-4 text-center">Durum</th>
                        <th className="py-4 text-right pr-8">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                    {filtreliKampanyalar.map((k) => {
                      const isAktif = new Date(k.bitis_date) >= new Date();
                      return (
                        <tr key={k.id} className="group hover:bg-blue-50/30 border-b border-slate-50 last:border-0 transition-colors">
                            <td className="py-4 pl-8">
                                <div className="font-black text-slate-900">{k.yapan_marka_bilgisi?.marka_adi || 'Genel'}</div>
                                {k.faydalanan_marka_bilgisi && (
                                    <div className="text-[10px] text-blue-500 uppercase tracking-tighter">↳ {k.faydalanan_marka_bilgisi.marka_adi}</div>
                                )}
                            </td>
                            <td className="py-4 font-medium text-slate-500 max-w-xs">{k.baslik}</td>
                            
                            <td className="py-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[11px] font-black uppercase tracking-widest border border-orange-100/50">
                                  🚀 {k.tiklanma_sayisi || 0}
                                </span>
                            </td>

                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black ${isAktif ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                                {isAktif ? 'Aktif' : 'Bitti'}
                              </span>
                            </td>
                            <td className="py-4 text-right pr-8 flex justify-end gap-2">
                                <Link 
                                  href={`/admin/medya-studyo?slug=${k.slug}`} 
                                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl transition-all no-underline text-[10px] uppercase tracking-wide hover:bg-blue-600"
                                >
                                  🎨 Görsel
                                </Link>
                                <Link 
                                  href={`/admin/kampanya-duzenle/${k.slug}`} 
                                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl transition-all no-underline text-[10px] uppercase tracking-wide hover:bg-slate-200"
                                >
                                  Düzenle
                                </Link>
                                <button onClick={() => kampanyaSil(k.id)} className="px-4 py-2.5 text-slate-300 hover:text-red-600 transition-all font-bold text-[10px] uppercase">
                                  Sil
                                </button>
                            </td>
                        </tr>
                      )
                    })}
                </tbody>
            </table>
          </div>
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