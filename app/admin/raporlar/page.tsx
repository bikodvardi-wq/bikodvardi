"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RaporlarPage() {
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [markaRaporlari, setMarkaRaporlari] = useState<any[]>([]);
  const [genelOzet, setGenelOzet] = useState({ toplamHit: 0, toplamIseYaradi: 0, toplamHatali: 0 });
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const veriGetir = async () => {
      setYukleniyor(true);
      
      // Tüm kampanyaları ve marka bilgilerini çekiyoruz
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

          // Marka Gruplama (Örn: Tüm Akbank kampanyalarını birleştir)
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
        
        // Markaları en çok görüntülenenden aza doğru sırala
        const siraliMarkalar = Array.from(markaMap.values()).sort((a, b) => b.hit - a.hit);
        setMarkaRaporlari(siraliMarkalar);
        
        // Kampanyaları en çok görüntülenenden aza doğru sırala
        const siraliKampanyalar = [...data].sort((a, b) => (b.tiklanma_sayisi || 0) - (a.tiklanma_sayisi || 0));
        setKampanyalar(siraliKampanyalar);
      }
      setYukleniyor(false);
    };

    veriGetir();
  }, []);

  if(yukleniyor) return <div className="p-10 font-black text-blue-600 animate-pulse text-center text-2xl">Raporlar Derleniyor... 📊</div>;

  const toplamOy = genelOzet.toplamIseYaradi + genelOzet.toplamHatali;
  const genelBasariOrani = toplamOy > 0 ? Math.round((genelOzet.toplamIseYaradi / toplamOy) * 100) : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
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

      {/* MARKALARIN KARNESİ (AKBANK, TRENDYOL VS) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">🏢 Marka Performans Karnesi</h3>
          <p className="text-xs text-slate-500 mt-1">Hangi markanın kampanyaları daha çok ilgi görüyor?</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-8">Marka Adı</th>
                <th className="py-4 text-center">Kampanya Sayısı</th>
                <th className="py-4 text-center">Toplam Görüntülenme</th>
                <th className="py-4 text-center">İşe Yaradı 👍</th>
                <th className="py-4 text-center">Hatalı 👎</th>
                <th className="py-4 text-right pr-8">Başarı Oranı</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {markaRaporlari.map((m, idx) => {
                const markaToplamOy = m.yaradi + m.hatali;
                const basari = markaToplamOy > 0 ? Math.round((m.yaradi / markaToplamOy) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-blue-50/30 border-b border-slate-50">
                    <td className="py-4 pl-8 text-blue-600">{m.marka_adi}</td>
                    <td className="py-4 text-center">{m.kampanyaSayisi}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KAMPANYA LİDERLİK TABLOSU */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">🔥 Kampanya Liderlik Tablosu (Top 50)</h3>
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
              {kampanyalar.slice(0, 50).map((k) => (
                <tr key={k.id} className="hover:bg-blue-50/30 border-b border-slate-50">
                  <td className="py-4 pl-8 text-[11px] uppercase tracking-wider text-slate-500">
                    {k.yapan_marka_bilgisi?.marka_adi || '-'}
                  </td>
                  <td className="py-4 max-w-xs truncate">{k.baslik}</td>
                  <td className="py-4 text-center">
                    <span className="font-black text-blue-600">{k.tiklanma_sayisi || 0}</span>
                  </td>
                  <td className="py-4 text-center flex items-center justify-center gap-3">
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs">👍 {k.ise_yaradi_count || 0}</span>
                    <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-xs">👎 {k.hatali_count || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}