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

    const yeniSlug = slugOlustur(form.baslik);

    // DÜZELTME: Boş stringleri NULL'a çeviriyoruz ki veritabanı kızmasın
    const payload = {
        baslik: form.baslik,
        detay: form.detay,
        link: form.link,
        bitis_date: form.bitis_date,
        yapan_marka: form.yapan_marka || null,
        fayd_marka: form.fayd_marka || null, // Seçilmediyse NULL gider
        gecerli_sektor_id: form.gecerli_sektor_id || null, // Seçilmediyse NULL gider
        kampanya_turu: form.kampanya_turu,
        slug: yeniSlug
    };

    const { error } = await supabase.from('kampanya').insert([payload]);

    if (error) {
      alert('Hata oluştu: ' + error.message);
      setYukleniyor(false);
    } else {
      alert('✅ Kampanya başarıyla oluşturuldu!');
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Kampanya Oluştur</h2>
      
      <form onSubmit={kaydet} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        
        {/* BAŞLIK */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Başlığı</label>
            <input 
              required
              type="text" 
              placeholder="Örn: Tüm Marketlerde %20 İndirim" 
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
              value={form.baslik}
              onChange={(e) => setForm({...form, baslik: e.target.value})}
            />
        </div>

        {/* DETAY */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Detayları</label>
            <textarea 
              rows={6}
              placeholder="Kampanya koşullarını ve detaylarını buraya yazın..." 
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none focus:border-blue-600 transition-all"
              value={form.detay}
              onChange={(e) => setForm({...form, detay: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* YAPAN MARKA */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanyayı Yapan Marka</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={form.yapan_marka}
                  onChange={(e) => setForm({...form, yapan_marka: e.target.value})}
                >
                    <option value="">Seçiniz...</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
            </div>

            {/* FAYDALANILAN MARKA */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Faydalanılan Marka (Varsa)</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={form.fayd_marka}
                  onChange={(e) => setForm({...form, fayd_marka: e.target.value})}
                >
                    <option value="">Yok (Genel Kampanya)</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SEKTÖR (Zorunluluk Kaldırıldı) */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Geçerli Sektör (Opsiyonel)</label>
                <select 
                  // required  <-- BURAYI SİLDİK
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none"
                  value={form.gecerli_sektor_id}
                  onChange={(e) => setForm({...form, gecerli_sektor_id: e.target.value})}
                >
                    <option value="">Seçiniz (Genelse Seçin)</option>
                    {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
                </select>
            </div>

            {/* KAMPANYA TÜRÜ */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Türü</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none"
                  value={form.kampanya_turu}
                  onChange={(e) => setForm({...form, kampanya_turu: e.target.value})}
                >
                    <option value="">Seçiniz...</option>
                    {turler.map(t => <option key={t.id} value={t.id}>{t.tur_adi}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LİNK */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Linki</label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none"
                  value={form.link}
                  onChange={(e) => setForm({...form, link: e.target.value})}
                />
            </div>

            {/* BİTİŞ TARİHİ */}
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Son Geçerlilik Tarihi</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none cursor-pointer"
                  value={form.bitis_date}
                  onChange={(e) => setForm({...form, bitis_date: e.target.value})}
                />
            </div>
        </div>

        {/* KAYDET BUTONU */}
        <button 
          disabled={yukleniyor}
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] text-xl font-black tracking-tight transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          {yukleniyor ? 'Kaydediliyor...' : 'Kampanyayı Yayınla ✨'}
        </button>

      </form>
    </div>
  );
}