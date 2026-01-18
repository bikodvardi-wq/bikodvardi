"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function KampanyaEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Seçim listeleri
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [sektorler, setSektorler] = useState<any[]>([]);
  const [turler, setTurler] = useState<any[]>([]);

  // Form Verileri
  const [form, setForm] = useState({
    baslik: '',
    detay: '',
    link: '',
    bitis_date: '',
    yapan_marka: '',
    fayd_marka: '',
    gecerli_sektor_id: '',
    kampanya_turu: ''
  });

  useEffect(() => {
    const verileriGetir = async () => {
      const { data: mData } = await supabase.from('marka').select('id, marka_adi').order('marka_adi');
      const { data: sData } = await supabase.from('sektor').select('id, sektor_adi').order('sektor_adi');
      const { data: tData } = await supabase.from('kampanya_turu').select('id, tur_adi').order('tur_adi');

      setMarkalar(mData || []);
      setSektorler(sData || []);
      setTurler(tData || []);
    };
    verileriGetir();
  }, []);

  const slugOlustur = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    // --- 1. ADIM: GELİŞMİŞ MÜKERRER KONTROLÜ ---
    
    // A) LİNK KONTROLÜ
    if (form.link && form.link.trim() !== "") {
        const { data: linkVarMi } = await supabase
            .from('kampanya')
            .select('id, baslik')
            .eq('link', form.link.trim())
            .maybeSingle();

        if (linkVarMi) {
            alert(`⚠️ BU LİNK ZATEN KAYITLI!\n\n"${linkVarMi.baslik}" isimli kampanya aynı linki kullanıyor.`);
            setYukleniyor(false);
            return;
        }
    }

    // B) MARKA İKİLİSİ KONTROLÜ
    if (form.yapan_marka && form.fayd_marka) {
        const { data: markaIkiliVarMi } = await supabase
            .from('kampanya')
            .select('id, baslik')
            .eq('yapan_marka', form.yapan_marka)
            .eq('fayd_marka', form.fayd_marka)
            .eq('bitis_date', form.bitis_date) // Aynı tarihli kampanya var mı?
            .maybeSingle();
            
            // Not: .gt('bitis_date') yerine direkt çakışma kontrolü daha sağlıklı olabilir, 
            // ama senin mantığını korudum.

        if (markaIkiliVarMi) {
            const onay = confirm(`📢 UYARI: Bu markalar için benzer bir kampanya var: \n"${markaIkiliVarMi.baslik}"\n\nYine de eklemek istiyor musunuz?`);
            if (!onay) {
                setYukleniyor(false);
                return;
            }
        }
    }

    // --- 2. ADIM: KAYIT İŞLEMİ ---
    const yeniSlug = slugOlustur(form.baslik);

    const payload = {
        baslik: form.baslik,
        detay: form.detay,
        link: form.link ? form.link.trim() : null,
        bitis_date: form.bitis_date,
        yapan_marka: form.yapan_marka || null,
        fayd_marka: form.fayd_marka || null,
        gecerli_sektor_id: form.gecerli_sektor_id || null,
        kampanya_turu: form.kampanya_turu,
        slug: yeniSlug
    };

    const { error } = await supabase.from('kampanya').insert([payload]);

    if (error) {
      alert('Hata oluştu: ' + error.message);
      setYukleniyor(false);
    } else {
      alert('✅ Kampanya başarıyla oluşturuldu!');
      router.push('/admin'); // Admin ana sayfasına veya listeye yönlendir
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Kampanya</h2>
        <button type="button" onClick={() => router.back()} className="text-sm font-bold text-slate-400 hover:text-slate-600">← İptal</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- SOL TARA: FORM ALANI --- */}
        <form onSubmit={kaydet} className="space-y-6">
            
            {/* BAŞLIK */}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Başlık</label>
                <input 
                  required
                  type="text" 
                  placeholder="Örn: Tüm Marketlerde %20 İndirim" 
                  className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl font-bold text-lg outline-none focus:border-blue-600 text-slate-900 shadow-sm"
                  value={form.baslik}
                  onChange={(e) => setForm({...form, baslik: e.target.value})}
                />
            </div>

            {/* DETAY (HTML EDİTÖR GÖRÜNÜMÜ) */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        HTML İçerik (Gemini'den Yapıştır)
                    </label>
                    <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">KOD MODU</span>
                </div>
                <textarea 
                  rows={10}
                  placeholder="<div class='w-full...'>...</div>" 
                  className="w-full bg-slate-900 text-green-400 border-2 border-slate-800 p-4 rounded-xl font-mono text-xs outline-none focus:border-blue-600 shadow-inner"
                  value={form.detay}
                  onChange={(e) => setForm({...form, detay: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 mt-2">
                    * Gemini "biKodVardı Editörü"nden aldığın HTML kodunu buraya direkt yapıştır.
                </p>
            </div>

            {/* MARKALAR */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Yapan Marka</label>
                    <select 
                      required
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.yapan_marka}
                      onChange={(e) => setForm({...form, yapan_marka: e.target.value})}
                    >
                        <option value="">Seçiniz...</option>
                        {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Fayd. Marka</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.fayd_marka}
                      onChange={(e) => setForm({...form, fayd_marka: e.target.value})}
                    >
                        <option value="">Yok</option>
                        {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                    </select>
                </div>
            </div>

            {/* DİĞER BİLGİLER */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sektör</label>
                    <select 
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.gecerli_sektor_id}
                      onChange={(e) => setForm({...form, gecerli_sektor_id: e.target.value})}
                    >
                        <option value="">Genel</option>
                        {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tür</label>
                    <select 
                      required
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                      value={form.kampanya_turu}
                      onChange={(e) => setForm({...form, kampanya_turu: e.target.value})}
                    >
                        <option value="">Seçiniz...</option>
                        {turler.map(t => <option key={t.id} value={t.id}>{t.tur_adi}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Link</label>
                    <input 
                      type="text" 
                      placeholder="https://..." 
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
                      value={form.link}
                      onChange={(e) => setForm({...form, link: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Son Tarih</label>
                    <input 
                      required
                      type="date" 
                      className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
                      value={form.bitis_date}
                      onChange={(e) => setForm({...form, bitis_date: e.target.value})}
                    />
                </div>
            </div>

            <button 
              disabled={yukleniyor}
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-black tracking-tight transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4"
            >
              {yukleniyor ? 'Kaydediliyor...' : 'Yayınla 🚀'}
            </button>
        </form>

        {/* --- SAĞ TARAF: CANLI ÖNİZLEME --- */}
        <div className="hidden lg:block">
            <div className="sticky top-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Canlı Önizleme</h3>
                
                {/* Sitenin ön yüzündeki Karanlık Tema Kartı */}
                <div className="bg-[#0D0F14] rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 opacity-70">
                        <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                        <span className="text-white font-bold text-sm">MARKA ADI</span>
                    </div>

                    <h1 className="text-2xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
                        {form.baslik || "Kampanya Başlığı Buraya Gelecek..."}
                    </h1>

                    {/* HTML İçerik Önizleme Alanı */}
                    <div 
                        className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap [&>div]:whitespace-normal"
                        dangerouslySetInnerHTML={{ __html: form.detay || "<p class='opacity-30'>Gemini'den aldığın kodu yapıştırınca tablo burada görünecek...</p>" }}
                    />
                    
                    <div className="mt-6 flex gap-2 opacity-50">
                        <div className="h-12 bg-white/10 rounded-xl flex-1"></div>
                        <div className="h-12 bg-white/10 rounded-xl w-12"></div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}