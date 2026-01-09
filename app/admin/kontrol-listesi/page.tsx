"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KontrolListesi() {
  // Sekme Modu: 'kontrol' (İş yapma) veya 'yonet' (Listeyi ayarlama)
  const [mod, setMod] = useState<'kontrol' | 'yonet'>('kontrol');
  
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // İstatistikler
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  // Verileri çekme fonksiyonu
  const verileriGetir = async () => {
    setYukleniyor(true);
    
    let query = supabase
      .from('marka')
      .select('id, marka_adi, logo_url, son_kontrol_tarihi, oncu_marka')
      .order('marka_adi', { ascending: true }); // Önce alfabetik sırala

    // Eğer 'kontrol' modundaysak SADECE öncü markaları getir
    if (mod === 'kontrol') {
        query = query.eq('oncu_marka', true);
    }

    const { data } = await query;

    if (data) {
        if (mod === 'kontrol') {
            // --- KONTROL MODU MANTIĞI ---
            const simdi = new Date();
            const islenmisVeri = data.map(m => {
                let kontrolDurumu = false;
                let gecenGun = 999; 

                if (m.son_kontrol_tarihi) {
                    const kontrolTarihi = new Date(m.son_kontrol_tarihi);
                    const farkMs = simdi.getTime() - kontrolTarihi.getTime();
                    gecenGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));
                    
                    if (gecenGun < 7) kontrolDurumu = true;
                }

                return { ...m, kontrolGecerliMi: kontrolDurumu, gecenGunSayisi: gecenGun };
            });

            // İstatistikler
            setToplam(islenmisVeri.length);
            setTamamlanan(islenmisVeri.filter(m => m.kontrolGecerliMi).length);

            // Kırmızıları üste taşı
            islenmisVeri.sort((a, b) => Number(a.kontrolGecerliMi) - Number(b.kontrolGecerliMi));
            setMarkalar(islenmisVeri);

        } else {
            // --- YÖNET MODU MANTIĞI ---
            // Sadece listeyi olduğu gibi göster (Alfabetik)
            setMarkalar(data);
        }
    }
    setYukleniyor(false);
  };

  // Mod değiştiğinde verileri yeniden çek
  useEffect(() => {
    verileriGetir();
  }, [mod]);

  // Markayı "Kontrol Ettim" olarak işaretle
  const kontrolEdildiIsaretle = async (id: number) => {
    const simdi = new Date().toISOString();
    await supabase.from('marka').update({ son_kontrol_tarihi: simdi }).eq('id', id);
    
    // UI Güncelle
    const yeniListe = markalar.map(m => {
        if (m.id === id) return { ...m, kontrolGecerliMi: true, gecenGunSayisi: 0 };
        return m;
    });
    // Sıralamayı güncelle
    yeniListe.sort((a, b) => Number(a.kontrolGecerliMi) - Number(b.kontrolGecerliMi));
    setMarkalar(yeniListe);
    setTamamlanan(prev => prev + 1);
  };

  // Markayı Öncü Listesine Ekle/Çıkar
  const oncuDurumuDegistir = async (id: number, suankiDurum: boolean) => {
    // Veritabanını güncelle
    const { error } = await supabase.from('marka').update({ oncu_marka: !suankiDurum }).eq('id', id);
    
    if(!error) {
        // UI Güncelle
        setMarkalar(markalar.map(m => m.id === id ? { ...m, oncu_marka: !suankiDurum } : m));
    }
  };

  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* BAŞLIK VE SEKME DEĞİŞTİRİCİ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>
                {mod === 'kontrol' ? 'Haftalık Kontrol 🗓️' : 'Marka Listesi Ayarları ⚙️'}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
                {mod === 'kontrol' ? 'Sadece öncü markaları görüntülüyorsun.' : 'Takip edilecek markaları buradan seç.'}
            </p>
        </div>

        {/* Sekme Butonları */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
            <button 
                onClick={() => setMod('kontrol')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${mod === 'kontrol' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                📋 Kontrol Et
            </button>
            <button 
                onClick={() => setMod('yonet')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${mod === 'yonet' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                ⚙️ Listeyi Düzenle
            </button>
        </div>
      </div>

      {/* --- MOD 1: KONTROL EKRANI --- */}
      {mod === 'kontrol' && (
        <>
            {/* İlerleme Çubuğu */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>İLERLEME DURUMU</span>
                    <span>%{yuzde}</span>
                </div>
                <div className="bg-slate-100 h-4 rounded-full w-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-1000 ease-out" style={{ width: `${yuzde}%` }}></div>
                </div>
                <p className="text-right text-xs font-bold text-slate-400 mt-2">{tamamlanan} / {toplam} Öncü Marka Güncel</p>
            </div>

            {/* Kontrol Listesi */}
            <div className="space-y-4">
                {markalar.length === 0 && !yukleniyor && (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-dashed border-2 border-slate-200">
                        <p className="font-bold text-slate-400">Takip listende hiç marka yok.</p>
                        <button onClick={() => setMod('yonet')} className="text-blue-600 font-black underline mt-2">Marka Eklemek İçin Tıkla</button>
                    </div>
                )}

                {markalar.map((m) => (
                    <div key={m.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${m.kontrolGecerliMi ? 'bg-white border-green-100 opacity-60' : 'bg-white border-red-100 shadow-xl shadow-red-50 scale-[1.01]'}`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${m.kontrolGecerliMi ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                                {m.kontrolGecerliMi ? '✅' : '🚨'}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{m.marka_adi}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <a href={`https://www.google.com/search?q=${m.marka_adi}+kampanyalar+2026`} target="_blank" className="text-[10px] bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors">
                                        Google'da Ara ↗
                                    </a>
                                    <span className="text-[10px] font-bold text-slate-400">• {m.gecenGunSayisi > 365 ? 'Hiç' : `${m.gecenGunSayisi} gün`}</span>
                                </div>
                            </div>
                        </div>
                        {!m.kontrolGecerliMi ? (
                            <button onClick={() => kontrolEdildiIsaretle(m.id)} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all text-xs shadow-lg">Tamamla</button>
                        ) : (
                            <span className="text-green-600 font-bold text-xs px-4">Güncel</span>
                        )}
                    </div>
                ))}
            </div>
        </>
      )}

      {/* --- MOD 2: YÖNETME EKRANI --- */}
      {mod === 'yonet' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-lg mb-6 border-b pb-4">Hangi Markaları Takip Edeceksin?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {markalar.map((m) => (
                    <div key={m.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${m.oncu_marka ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center p-1">
                                {m.logo_url ? <img src={m.logo_url} className="max-h-full object-contain" /> : "?"}
                            </div>
                            <span className={`font-bold ${m.oncu_marka ? 'text-blue-900' : 'text-slate-400'}`}>{m.marka_adi}</span>
                        </div>
                        
                        {/* SWITCH BUTTON */}
                        <button 
                            onClick={() => oncuDurumuDegistir(m.id, m.oncu_marka)}
                            className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${m.oncu_marka ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* YÜKLENİYOR DURUMU */}
      {yukleniyor && <div className="text-center py-20 font-bold text-blue-600 animate-pulse">Veriler hazırlanıyor...</div>}
    </div>
  );
}