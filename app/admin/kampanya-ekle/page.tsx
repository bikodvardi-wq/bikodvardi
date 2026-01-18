"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function KampanyaEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Veritabanından gelecek listeler
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [sektorler, setSektorler] = useState<any[]>([]);
  const [turler, setTurler] = useState<any[]>([]);

  // Form Verileri
  const [form, setForm] = useState({
    baslik: '',
    detay: '', // HTML Tablo kodu buraya gelecek
    link: '',
    bitis_date: '',
    yapan_marka: '', // ID
    fayd_marka: '',  // ID
    gecerli_sektor_id: '',
    kampanya_turu: ''
  });

  // Sayfa açılınca verileri çek
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

  // --- 🔥 GÜNCELLENMİŞ AKILLI YAPIŞTIRMA (Temizlikçili) ---
  const handleAkilliYapistir = (val: string) => {
    // 1. Önce yapıştırılanı kutuya koy ki ne yapıştırdığını gör
    // (Henüz parse etmedik)
    let yeniForm = { ...form, detay: val };
    
    // TEMİZLİK ZAMANI: Gemini'nin eklediği ```json ve ``` işaretlerini temizle
    let temizVal = val.trim();
    if (temizVal.startsWith('```json')) {
        temizVal = temizVal.replace('```json', '');
    } else if (temizVal.startsWith('```')) {
        temizVal = temizVal.replace('```', '');
    }
    
    if (temizVal.endsWith('```')) {
        temizVal = temizVal.replace('```', ''); // Sondaki tırnakları sil
    }

    try {
        // 2. Artık temizlenen veriyi JSON'a çevirmeyi dene
        const json = JSON.parse(temizVal);

        if (json.html_kodu) {
            
            // A) HTML Kodunu ve Temel Bilgileri Al
            yeniForm.detay = json.html_kodu;
            if (json.baslik) yeniForm.baslik = json.baslik;
            if (json.son_tarih) yeniForm.bitis_date = json.son_tarih;

            // B) Marka ID Bulma Fonksiyonu
            const markaIdBul = (isim: string) => {
                if (!isim || markalar.length === 0) return "";
                const aranan = isim.toLowerCase().trim();
                
                // Tam eşleşme veya içerme kontrolü
                const eslesen = markalar.find(m => 
                    m.marka_adi.toLowerCase() === aranan || 
                    m.marka_adi.toLowerCase().includes(aranan) ||
                    aranan.includes(m.marka_adi.toLowerCase())
                );
                return eslesen ? eslesen.id : "";
            };

            // C) Markaları Eşleştir
            if (json.yapan_marka) {
                const id = markaIdBul(json.yapan_marka);
                if (id) yeniForm.yapan_marka = id;
            }

            if (json.faydalanilan_marka) {
                const id = markaIdBul(json.faydalanilan_marka);
                if (id) yeniForm.fayd_marka = id;
            }
        }
    } catch (e) {
        // JSON değilse hiçbir şey yapma, kullanıcı belki elle düzeltiyordur.
        // Hata vermiyoruz ki form bozulmasın.
    }

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

    // Link Kontrolü
    if (form.link && form.link.trim() !== "") {
        const { data: linkVarMi } = await supabase.from('kampanya').select('id, baslik').eq('link', form.link.trim()).maybeSingle();
        if (linkVarMi) { alert(`⚠️ BU LİNK ZATEN KAYITLI!\n"${linkVarMi.baslik}"`); setYukleniyor(false); return; }
    }

    // Marka İkilisi Kontrolü
    if (form.yapan_marka && form.fayd_marka) {
        const { data: ikili } = await supabase.from('kampanya').select('id, baslik')
            .eq('yapan_marka', form.yapan_marka)
            .eq('fayd_marka', form.fayd_marka)
            .gte('bitis_date', new Date().toISOString().split('T')[0])
            .maybeSingle();
            
        if (ikili) { if(!confirm(`⚠️ Bu markalar arasında aktif kampanya var: "${ikili.baslik}". Devam?`)) { setYukleniyor(false); return; } }
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

    const { error } = await supabase.from('kampanya').insert([payload]);

    if (error) { alert('Hata: ' + error.message); setYukleniyor(false); } 
    else { alert('✅ Yayınlandı!'); router.push('/admin'); }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Kampanya</h2>
        <button type="button" onClick={() => router.back()} className="text-sm font-bold text-slate-400 hover:text-slate-600">← İptal</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- SOL: FORM ALANI --- */}
        <form onSubmit={kaydet} className="space-y-6">
            
            {/* BAŞLIK */}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Başlık (Otomatik)</label>
                <input required type="text" className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl font-bold text-lg outline-none focus:border-blue-600 text-slate-900 transition-colors"
                  value={form.baslik} onChange={(e) => setForm({...form, baslik: e.target.value})} />
            </div>

            {/* JSON EDİTÖRÜ */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-600">✨ GEMINI JSON ALANI</label>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">OTOMATİK TEMİZLEYİCİ</span>
                </div>
                {/* Textarea'ya yapıştırılan değeri handleAkilliYapistir fonksiyonuna gönderiyoruz */}
                <textarea rows={12} placeholder="{ 'baslik': '...', 'yapan_marka': '...', 'html_kodu': '...' }" 
                  className="w-full bg-[#1e1e1e] text-green-400 border-2 border-slate-800 p-4 rounded-xl font-mono text-xs outline-none focus:border-blue-500 shadow-inner resize-none"
                  
                  // Burası kritik: Value olarak form.detay'ı değil, geçici bir state'i veya 
                  // kullanıcı parse edilmiş halini görsün istiyorsak direkt detay'ı gösteriyoruz.
                  // Kullanıcı buraya yapıştırdığında 'handleAkilliYapistir' devreye giriyor.
                  value={form.detay} 
                  onChange={(e) => handleAkilliYapistir(e.target.value)} 
                />
                 <p className="text-[10px] text-slate-400 mt-2">
                   💡 Gemini'nin verdiği kodun başında ```json yazsa bile direkt yapıştır, ben temizlerim.
                </p>
            </div>

            {/* MARKA SEÇİMLERİ (Otomatik Seçilir) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Yapan Marka</label>
                    <select required className={`w-full border-2 p-3 rounded-xl font-bold text-sm outline-none transition-colors ${form.yapan_marka ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-100 text-slate-900'}`}
                      value={form.yapan_marka} onChange={(e) => setForm({...form, yapan_marka: e.target.value})}>
                        <option value="">Seçiniz...</option>
                        {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Fayd. Marka</label>
                    <select className={`w-full border-2 p-3 rounded-xl font-bold text-sm outline-none transition-colors ${form.fayd_marka ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-100 text-slate-900'}`}
                      value={form.fayd_marka} onChange={(e) => setForm({...form, fayd_marka: e.target.value})}>
                        <option value="">Yok</option>
                        {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                    </select>
                </div>
            </div>

            {/* DİĞER BİLGİLER */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sektör</label>
                    <select className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.gecerli_sektor_id} onChange={(e) => setForm({...form, gecerli_sektor_id: e.target.value})}>
                        <option value="">Genel</option>
                        {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tür</label>
                    <select required className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.kampanya_turu} onChange={(e) => setForm({...form, kampanya_turu: e.target.value})}>
                        <option value="">Seçiniz...</option>
                        {turler.map(t => <option key={t.id} value={t.id}>{t.tur_adi}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Link</label>
                    <input type="text" placeholder="https://..." className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
                      value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Son Tarih</label>
                    <input required type="date" className={`w-full border-2 p-3 rounded-xl font-bold text-sm outline-none transition-colors ${form.bitis_date ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-100 text-slate-900'}`}
                      value={form.bitis_date} onChange={(e) => setForm({...form, bitis_date: e.target.value})} />
                </div>
            </div>

            <button disabled={yukleniyor} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-black tracking-tight transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-6">
              {yukleniyor ? 'Kaydediliyor...' : 'Yayınla 🚀'}
            </button>
        </form>

        {/* --- SAĞ: CANLI ÖNİZLEME (Responsive) --- */}
        <div className="hidden lg:block relative">
            <div className="sticky top-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Sitede Böyle Görünecek</h3>
                
                <div className="bg-[#0D0F14] rounded-[3rem] p-8 border border-white/5 shadow-2xl min-h-[500px]">
                    {/* Marka & Başlık */}
                    <div className="flex items-center gap-3 mb-8 opacity-90">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-black text-xs border-2 border-blue-500 overflow-hidden">
                             {/* Logo Gösterimi */}
                             {form.yapan_marka ? (
                                markalar.find(m=>m.id==form.yapan_marka)?.logo_url ? 
                                <img src={markalar.find(m=>m.id==form.yapan_marka)?.logo_url} className="w-full h-full object-contain" alt="" /> :
                                markalar.find(m=>m.id==form.yapan_marka)?.marka_adi.charAt(0)
                             ) : "M"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm tracking-wide leading-none" style={{ fontFamily: 'Outfit' }}>
                                {form.yapan_marka ? markalar.find(m=>m.id==form.yapan_marka)?.marka_adi : "MARKA"}
                            </span>
                            {form.fayd_marka && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                    + {markalar.find(m=>m.id==form.fayd_marka)?.marka_adi}
                                </span>
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-8 leading-tight" style={{ fontFamily: 'Outfit' }}>
                        {form.baslik || "Kampanya Başlığı..."}
                    </h1>

                    {/* HTML İÇERİK RENDER ALANI */}
                    <div 
                        className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap [&>div]:whitespace-normal"
                        dangerouslySetInnerHTML={{ 
                            __html: form.detay && (form.detay.trim().startsWith('{') || form.detay.trim().startsWith('```'))
                            ? "<p class='text-yellow-500 font-mono text-xs'>⚠️ JSON işleniyor veya hatalı format...</p>" 
                            : (form.detay || "<p class='opacity-20 text-xs'>Tablo önizlemesi burada belirecek...</p>") 
                        }}
                    />

                </div>
            </div>
        </div>

      </div>
    </div>
  );
}