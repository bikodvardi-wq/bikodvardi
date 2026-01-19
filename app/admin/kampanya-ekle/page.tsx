"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Sektöre göre dinamik arka plan görselleri
const sektorBackgrounds: { [key: string]: string } = {
  "1": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000", // E-ticaret
  "2": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=1000", // Banka
  "3": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000", // Moda/Giyim
  "4": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000", // Gıda
  "default": "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000"
};

export default function KampanyaEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [paylasimModu, setPaylasimModu] = useState(false);
  const [eklenenKampanya, setEklenenKampanya] = useState<any>(null);
  
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [sektorler, setSektorler] = useState<any[]>([]);
  const [turler, setTurler] = useState<any[]>([]);

  const [form, setForm] = useState({
    baslik: '', detay: '', link: '', bitis_date: '', yapan_marka: '', fayd_marka: '', gecerli_sektor_id: '', kampanya_turu: ''
  });

  useEffect(() => {
    const verileriGetir = async () => {
      const { data: mData } = await supabase.from('marka').select('id, marka_adi, logo_url').order('marka_adi');
      const { data: sData } = await supabase.from('sektor').select('id, sektor_adi').order('sektor_adi');
      const { data: tData } = await supabase.from('kampanya_turu').select('id, tur_adi').order('tur_adi');
      setMarkalar(mData || []);
      setSektorler(sData || []);
      setTurler(tData || []);
    };
    verileriGetir();
  }, []);

  // --- 🔥 YENİ: FORMU SIFIRLAMA FONKSİYONU ---
  const formuTemizle = () => {
    setForm({
      baslik: '', detay: '', link: '', bitis_date: '', yapan_marka: '', fayd_marka: '', gecerli_sektor_id: '', kampanya_turu: ''
    });
    setPaylasimModu(false);
    setEklenenKampanya(null);
  };

  const handleAkilliYapistir = (val: string) => {
    let yeniForm = { ...form, detay: val };
    let temizVal = val.trim();
    if (temizVal.startsWith('```json')) temizVal = temizVal.replace('```json', '');
    else if (temizVal.startsWith('```')) temizVal = temizVal.replace('```', '');
    if (temizVal.endsWith('```')) temizVal = temizVal.replace('```', '');

    try {
        const json = JSON.parse(temizVal);
        if (json.html_kodu) {
            yeniForm.detay = json.html_kodu;
            if (json.baslik) yeniForm.baslik = json.baslik;
            if (json.son_tarih) yeniForm.bitis_date = json.son_tarih;

            const markaIdBul = (isim: string) => {
                if (!isim || markalar.length === 0) return "";
                const aranan = isim.toLowerCase().trim();
                const eslesen = markalar.find(m => 
                    m.marka_adi.toLowerCase() === aranan || 
                    m.marka_adi.toLowerCase().includes(aranan) ||
                    aranan.includes(m.marka_adi.toLowerCase())
                );
                return eslesen ? eslesen.id : "";
            };

            if (json.yapan_marka) {
                const id = markaIdBul(json.yapan_marka);
                if (id) yeniForm.yapan_marka = id;
            }
            if (json.faydalanilan_marka) {
                const id = markaIdBul(json.faydalanilan_marka);
                if (id) yeniForm.fayd_marka = id;
            }
        }
    } catch (e) {}
    setForm(yeniForm);
  };

  const slugOlustur = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    if (form.link && form.link.trim() !== "") {
        const { data: linkVarMi } = await supabase.from('kampanya').select('id, baslik').eq('link', form.link.trim()).maybeSingle();
        if (linkVarMi) { alert(`⚠️ BU LİNK ZATEN KAYITLI!\n"${linkVarMi.baslik}"`); setYukleniyor(false); return; }
    }

    const payload = {
        baslik: form.baslik,
        detay: form.detay,
        link: form.link ? form.link.trim() : null,
        bitis_date: form.bitis_date,
        yapan_marka: form.yapan_marka || null,
        fayd_marka: form.fayd_marka || null,
        gecerli_sektor_id: form.gecerli_sektor_id || null,
        kampanya_turu: form.kampanya_turu,
        slug: slugOlustur(form.baslik)
    };

    const { data, error } = await supabase.from('kampanya').insert([payload]).select().single();

    if (error) { 
        alert('Hata: ' + error.message); 
        setYukleniyor(false); 
    } else {
        setEklenenKampanya(data);
        setPaylasimModu(true);
        setYukleniyor(false);
    }
  };

  const bgUrl = sektorBackgrounds[form.gecerli_sektor_id] || sektorBackgrounds["default"];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Kampanya</h2>
        <button type="button" onClick={() => router.back()} className="text-sm font-bold text-slate-400 hover:text-slate-600">← İptal</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- FORM ALANI --- */}
        <form onSubmit={kaydet} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Başlık</label>
                <input required type="text" className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl font-bold text-lg outline-none focus:border-blue-600 text-slate-900 transition-colors"
                  value={form.baslik} onChange={(e) => setForm({...form, baslik: e.target.value})} />
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">✨ GEMINI JSON ALANI</label>
                <textarea rows={12} placeholder="JSON yapıştır..." className="w-full bg-[#1e1e1e] text-green-400 border-2 border-slate-800 p-4 rounded-xl font-mono text-xs outline-none focus:border-blue-500 shadow-inner resize-none"
                  value={form.detay} onChange={(e) => handleAkilliYapistir(e.target.value)} 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <select required className="w-full border-2 p-3 rounded-xl font-bold text-sm bg-white border-slate-100"
                  value={form.yapan_marka} onChange={(e) => setForm({...form, yapan_marka: e.target.value})}>
                    <option value="">Yapan Marka Seçiniz...</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
                <select className="w-full border-2 p-3 rounded-xl font-bold text-sm bg-white border-slate-100"
                  value={form.fayd_marka} onChange={(e) => setForm({...form, fayd_marka: e.target.value})}>
                    <option value="">Fayd. Marka (Yok)</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm"
                  value={form.gecerli_sektor_id} onChange={(e) => setForm({...form, gecerli_sektor_id: e.target.value})}>
                    <option value="">Sektör Seç (Arka Plan)...</option>
                    {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
                </select>
                <select required className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm"
                  value={form.kampanya_turu} onChange={(e) => setForm({...form, kampanya_turu: e.target.value})}>
                    <option value="">Kampanya Türü...</option>
                    {turler.map(t => <option key={t.id} value={t.id}>{t.tur_adi}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Link (https://...)" className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm"
                  value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} />
                <input required type="date" className="w-full border-2 p-3 rounded-xl font-bold text-sm"
                  value={form.bitis_date} onChange={(e) => setForm({...form, bitis_date: e.target.value})} />
            </div>

            <button disabled={yukleniyor} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-black transition-all shadow-lg mt-6">
              {yukleniyor ? 'Yayınlanıyor...' : 'Yayınla 🚀'}
            </button>
        </form>

        {/* --- SAĞ: SOSYAL MEDYA KARTI --- */}
        <div className="hidden lg:block relative sticky top-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Görsel Kart Önizlemesi</h3>
            <div className="relative w-full aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img src={bgUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute inset-0 p-12 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="bg-white p-3 rounded-2xl shadow-xl">
                            {form.yapan_marka ? (
                                <img src={markalar.find(m=>m.id==form.yapan_marka)?.logo_url} className="h-8 w-auto object-contain" alt="logo" />
                            ) : <span className="text-black font-black text-[10px] px-2 tracking-tighter">LOGO</span>}
                        </div>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] bg-blue-600 px-4 py-1.5 rounded-full">BİKODVARDI</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                                <span className="text-blue-400 uppercase tracking-tighter">{markalar.find(m=>m.id==form.yapan_marka)?.marka_adi || "MARKANIZ"}</span>
                                <span>Müşterilerine Özel</span>
                            </div>
                            <h1 className="text-white text-4xl font-black leading-tight tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                                {markalar.find(m=>m.id==form.fayd_marka)?.marka_adi || "FAYDALANILAN MARKA"} Fırsatı
                            </h1>
                        </div>
                        <p className="text-white/70 font-medium text-base line-clamp-2 leading-relaxed italic border-l-2 border-blue-500 pl-4">
                            {form.baslik || "Kampanya sloganı burada görünecek..."}
                        </p>
                    </div>

                    <div className="flex justify-between items-end pt-6 border-t border-white/10">
                        <div>
                            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Kod / Bilgi</p>
                            <p className="text-white font-black text-xl italic tracking-tighter">İndirimi Kaçırma!</p>
                        </div>
                        <p className="text-white font-black text-xl italic tracking-tighter">biKodVardı<span className="text-blue-500">.com</span></p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 🔥 HIZLI GİRİŞ MODLU PAYLAŞIM ASİSTANI */}
      {paylasimModu && eklenenKampanya && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div>
               <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit' }}>Yayına Alındı!</h2>
               <p className="text-slate-500 font-bold text-sm">Sırada ne var?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {/* Aksiyon Butonu 1 */}
               <button onClick={() => {
                 const text = `🔥 ${eklenenKampanya.baslik}\n\nDetaylar: https://bikodvardi.com/kampanya/${eklenenKampanya.slug}\n\n#indirim #kampanya #bikodvardi`;
                 navigator.clipboard.writeText(text);
                 alert("Açıklama kopyalandı! 😎");
               }} className="bg-blue-600 text-white p-6 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg">
                  Açıklamayı Kopyala 📋
               </button>

               {/* Aksiyon Butonu 2 - HIZLI GEÇİŞ BUTONU */}
               <button onClick={formuTemizle} className="bg-slate-900 text-white p-6 rounded-[2rem] font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3">
                  + Yeni Kampanya Ekle ✍️
               </button>

               {/* Aksiyon Butonu 3 */}
               <button onClick={() => router.push('/admin')} className="bg-slate-100 text-slate-500 p-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Admin Listesine Dön
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}