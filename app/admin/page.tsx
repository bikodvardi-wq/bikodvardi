"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ kampanya: 0, marka: 0, sektor: 0, aktifKampanya: 0 });
  const [sonKampanyalar, setSonKampanyalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const veriGetir = async () => {
    setYukleniyor(true);
    // İstatistikler
    const { count: kSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' });
    const { count: mSayisi } = await supabase.from('marka').select('*', { count: 'exact' });
    const { count: sSayisi } = await supabase.from('sektor').select('*', { count: 'exact' });
    const bugun = new Date().toISOString();
    const { count: aSayisi } = await supabase.from('kampanya').select('*', { count: 'exact' }).gt('bitis_date', bugun);

    setStats({
        kampanya: kSayisi || 0,
        marka: mSayisi || 0,
        sektor: sSayisi || 0,
        aktifKampanya: aSayisi || 0
    });

    // Tablo Verisi (yapan_marka ilişkisiyle beraber)
    const { data: sonData } = await supabase
      .from('kampanya')
      .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi)')
      .order('id', { ascending: false })
      .limit(10);
      
    setSonKampanyalar(sonData || []);
    setYukleniyor(false);
  };

  useEffect(() => {
    veriGetir();
  }, []);

  const kampanyaSil = async (id: number) => {
    if (confirm('Bu kampanyayı silmek istediğine emin misin?')) {
      const { error } = await supabase.from('kampanya').delete().eq('id', id);
      if (error) alert("Hata: " + error.message);
      else {
        alert("Kampanya silindi.");
        veriGetir();
      }
    }
  };

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse">Panel Yükleniyor...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Komuta Merkezi 🚀</h2>
            <p className="text-slate-500 font-medium mt-2">İçerikleri buradan yönetebilirsin.</p>
          </div>
          <Link href="/admin/kampanya-ekle" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all shadow-lg no-underline">
            + Yeni Kampanya
          </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Kampanya" value={stats.kampanya} icon="🏷️" color="bg-blue-50 text-blue-600" />
          <StatCard title="Aktif" value={stats.aktifKampanya} icon="🔥" color="bg-green-50 text-green-600" />
          <StatCard title="Marka" value={stats.marka} icon="🏢" color="bg-purple-50 text-purple-600" />
          <StatCard title="Sektör" value={stats.sektor} icon="📦" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="pb-4 pl-4">Marka</th>
                      <th className="pb-4">Başlık</th>
                      <th className="pb-4 text-right pr-4">İşlemler</th>
                  </tr>
              </thead>
              <tbody className="text-sm font-bold text-slate-700">
                  {sonKampanyalar.map((k) => (
                      <tr key={k.id} className="group hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                          <td className="py-5 pl-4 text-black">{k.yapan_marka_bilgisi?.marka_adi || 'Genel'}</td>
                          <td className="py-5 font-normal text-slate-500 truncate max-w-xs">{k.baslik}</td>
                          <td className="py-5 text-right pr-4 flex justify-end gap-2">
                              {/* --- BURASI GÜNCELLENDİ: SLUG KULLANILIYOR --- */}
                              <Link 
                                href={`/admin/kampanya-duzenle/${k.slug}`} 
                                className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all no-underline text-slate-600 font-bold text-xs uppercase tracking-wide"
                              >
                                Düzenle
                              </Link>
                              <button 
                                onClick={() => kampanyaSil(k.id)} 
                                className="px-4 py-2 bg-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all text-slate-600 font-bold text-xs uppercase tracking-wide"
                              >
                                Sil
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit' }}>{value}</p>
            </div>
        </div>
    )
}