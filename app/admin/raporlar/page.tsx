"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RaporlarPage() {
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [markaRaporlari, setMarkaRaporlari] = useState<any[]>([]);
  const [genelOzet, setGenelOzet] = useState({ toplamHit: 0, toplamIseYaradi: 0, toplamHatali: 0 });
  const [yukleniyor, setYukleniyor] = useState(true);

  // 🚀 YENİ: FİLTRELEME VE SIRALAMA STATE'LERİ
  const [aramaMetni, setAramaMetni] = useState('');
  const [siralama, setSiralama] = useState('hit_desc');

  useEffect(() => {
    const veriGetir = async () => {
      setYukleniyor(true);
      
      const { data } = await supabase
        .from('kampanya')
        .select('id, baslik, tiklanma_sayisi, ise_yaradi_count, hatali_count, yapan_marka_bilgisi:yapan_marka(marka_adi)');

      if (data) {
        let tHit = 0, tIseYaradi = 0, tHatali = 0;
        const markaMap = new Map();

        data.forEach((k: any) => {
          const hit = k.tiklanma_sayisi || 0;
          const yaradi = k.ise_yaradi_count || 0;
          const hatali = k.hatali_count || 0;

          tHit += hit;
          tIseYaradi += yaradi;
          tHatali += hatali;

          const markaAd = k.yapan_marka_bilgisi?.marka_adi || 'Genel / Markasız';
          if (!markaMap.has(markaAd)) {
            markaMap.set(markaAd, { marka_adi: markaAd, hit: 0, yaradi: 0, hatali: 0, kampanyaSayisi: 0 });
          }
          const m = markaMap.get(markaAd);
          m.hit += hit;
          m.yaradi += yaradi;
          m.hatali += hatali;
          m.kampanyaSayisi += 1;
        });

        setGenelOzet({ toplamHit: tHit, toplamIseYaradi: tIseYaradi, toplamHatali: tHatali });
        setMarkaRaporlari(Array.from(markaMap.values()));
        setKampanyalar(data);
      }
      setYukleniyor(false);
    };

    veriGetir();
  }, []);

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse text-center text-2xl">Raporlar Derleniyor... 📊</div>;

  const toplamOy = genelOzet.toplamIseYaradi + genelOzet.toplamHatali;
  const genelBasariOrani = toplamOy > 0 ? Math.round((genelOzet.toplamIseYaradi / toplamOy) * 100) : 0;

  // 🚀 YENİ: DİNAMİK FİLTRELEME VE SIRALAMA İŞLEMLERİ
  const filtrelenmisMarkalar = markaRaporlari
    .filter(m => m.marka_adi.toLowerCase().includes(aramaMetni.toLowerCase()))
    .sort((a, b) => {
      if (siralama === 'hit_desc') return b.hit - a.hit;
      if (siralama === 'yaradi_desc') return b.yaradi - a.yaradi;
      if (siralama === 'oran_desc') {
        const aOran = (a.yaradi + a.hatali) > 0 ? a.yaradi / (a.yaradi + a.hatali) : 0;
        const bOran = (b.yaradi + b.hatali) > 0 ? b.yaradi / (b.yaradi + b.hatali) : 0;
        return bOran - aOran;
      }
      return 0;
    });

  const filtrelenmisKampanyalar = kampanyalar
    .filter(k => 
      k.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) || 
      (k.yapan_marka_bilgisi?.marka_adi || '').toLowerCase().includes(aramaMetni.toLowerCase())
    )
    .sort((a, b) => {
      if (siralama === 'hit_desc') return (b.tiklanma_sayisi || 0) - (a.tiklanma_sayisi || 0);
      if (siralama === 'yaradi_desc') return (b.ise_yaradi_count || 0) - (a.ise_yaradi_count || 0);
      return 0;
    });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-['Plus_Jakarta_Sans']">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/admin" className="text-blue-600 text-sm font-bold mb-2 inline-block hover:underline">← Panele Dön</Link>
          <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Analitik & Raporlar 📊</h2>
          <p className="text-slate-500 font-medium mt-1">Sitenin genel performansı, tıklanmalar ve kullanıcı geri dönüşleri.</p>
        </div>
      </div>

      {/* GENEL İSTATİSTİKLER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Toplam Görüntülenme</p>
          <p className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Outfit' }}>{genelOzet.toplamHit}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Toplam İşe Yaradı</p>
          <p className="text-3xl font-black text-green-600" style={{ fontFamily: 'Outfit' }}>👍 {genelOzet.toplamIseYaradi}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Toplam Hatalı Kod</p>
          <p className="text-3xl font-black text-red-500" style={{ fontFamily: 'Outfit' }}>👎 {genelOzet.toplamHatali}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Genel Başarı Oranı</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>%{genelBasariOrani}</p>
        </div>
      </div>

      {/* 🚀 YENİ: FİLTRELEME VE SIRALAMA ÇUBUĞU */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Marka veya kampanya başlığı ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="w-full md:w-auto">
          <select 
            value={siralama}
            onChange={(e) => setSiralama(e.target.value)}
            className="w-full md:w-auto px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-600 cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="hit_desc">🔥 En Çok Görüntülenenler</option>
            <option value="yaradi_desc">👍 En Çok İşe Yarayanlar</option>
            <option value="oran_desc">📈 En Yüksek Başarı Oranı (Markalar)</option>
          </select>
        </div>
      </div>

      {/* MARKALARIN KARNESİ */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">🏢 Marka Performans Karnesi</h3>
            <p className="text-xs text-slate-500 mt-1">Hangi markanın kampanyaları daha çok ilgi görüyor?</p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full">{filtrelenmisMarkalar.length} Kayıt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-8">Marka Adı</th>
                <th className="py-4 text-center">Kampanya</th>
                <th className="py-4 text-center">Görüntülenme</th>
                <th className="py-4 text-center">İşe Yaradı 👍</th>
                <th className="py-4 text-center">Hatalı 👎</th>
                <th className="py-4 text-right pr-8">Başarı Oranı</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {filtrelenmisMarkalar.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Sonuç bulunamadı.</td></tr>
              ) : (
                filtrelenmisMarkalar.map((m, idx) => {
                  const markaToplamOy = m.yaradi + m.hatali;
                  const basari = markaToplamOy > 0 ? Math.round((m.yaradi / markaToplamOy) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/30 border-b border-slate-50 transition-colors">
                      <td className="py-4 pl-8 text-indigo-600">{m.marka_adi}</td>
                      <td className="py-4 text-center text-slate-500">{m.kampanyaSayisi}</td>
                      <td className="py-4 text-center"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">🚀 {m.hit}</span></td>
                      <td className="py-4 text-center text-green-600">{m.yaradi}</td>
                      <td className="py-4 text-center text-red-500">{m.hatali}</td>
                      <td className="py-4 text-right pr-8">
                        {markaToplamOy > 0 ? (
                          <span className={`px-3 py-1 rounded-lg text-[10px] uppercase ${basari >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            %{basari}
                          </span>
                        ) : <span className="text-slate-300 text-[10px]">Oy Yok</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KAMPANYA LİDERLİK TABLOSU */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">🔥 Kampanya Liderlik Tablosu (Top 50)</h3>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full">{filtrelenmisKampanyalar.length} Kayıt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-8">Marka</th>
                <th className="py-4">Kampanya Başlığı</th>
                <th className="py-4 text-center">Görüntülenme</th>
                <th className="py-4 text-center">Kullanıcı Oyları</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {filtrelenmisKampanyalar.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-400">Sonuç bulunamadı.</td></tr>
              ) : (
                filtrelenmisKampanyalar.slice(0, 50).map((k) => (
                  <tr key={k.id} className="hover:bg-indigo-50/30 border-b border-slate-50 transition-colors">
                    <td className="py-4 pl-8 text-[11px] uppercase tracking-wider text-slate-500">
                      {k.yapan_marka_bilgisi?.marka_adi || '-'}
                    </td>
                    <td className="py-4 max-w-xs truncate" title={k.baslik}>{k.baslik}</td>
                    <td className="py-4 text-center">
                      <span className="font-black text-blue-600">🚀 {k.tiklanma_sayisi || 0}</span>
                    </td>
                    <td className="py-4 text-center flex items-center justify-center gap-3">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-black">👍 {k.ise_yaradi_count || 0}</span>
                      <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-black">👎 {k.hatali_count || 0}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}