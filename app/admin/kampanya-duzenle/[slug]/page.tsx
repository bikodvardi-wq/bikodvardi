"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function KampanyaDuzenle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);
  const [kampanyaId, setKampanyaId] = useState<number | null>(null);
  
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [sektorler, setSektorler] = useState<any[]>([]);
  const [turler, setTurler] = useState<any[]>([]);

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

      const { data: kData, error } = await supabase
        .from('kampanya')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

      if (kData) {
        setKampanyaId(kData.id); 
        setForm({
          baslik: kData.baslik || '',
          detay: kData.detay || '',
          link: kData.link || '',
          bitis_date: kData.bitis_date || '',
          yapan_marka: kData.yapan_marka?.toString() || '', 
          fayd_marka: kData.fayd_marka?.toString() || '',
          gecerli_sektor_id: kData.gecerli_sektor_id?.toString() || '',
          kampanya_turu: kData.kampanya_turu?.toString() || ''
        });
      } else {
        console.error("Kampanya bulunamadı hatası:", error);
      }
      
      setYukleniyor(false);
    };
    verileriGetir();
  }, [resolvedParams.slug]);

  const guncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kampanyaId) return;
    setIslemYapiliyor(true);

    const payload = {
        baslik: form.baslik,
        detay: form.detay,
        link: form.link,
        bitis_date: form.bitis_date,
        yapan_marka: form.yapan_marka || null,
        fayd_marka: form.fayd_marka || null,
        gecerli_sektor_id: form.gecerli_sektor_id || null,
        kampanya_turu: form.kampanya_turu
    };

    const { error } = await supabase
      .from('kampanya')
      .update(payload)
      .eq('id', kampanyaId); 

    if (error) {
      alert('Hata: ' + error.message);
      setIslemYapiliyor(false);
    } else {
      alert('✅ Değişiklikler kaydedildi!');
      router.push('/admin');
      router.refresh();
    }
  };

  // 🗑️ YENİ VE GÜVENLİ: Kampanya Silme Fonksiyonu
  const kampanyaSil = async (e: React.MouseEvent) => {
    e.preventDefault(); 

    if (!kampanyaId) {
      alert("⚠️ Sistem Hatası: Kampanya ID'si bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      return;
    }

    const onay = window.confirm(`"${form.baslik}" kampanyasını kalıcı olarak SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!`);
    
    if (onay) {
      setIslemYapiliyor(true);
      const { error } = await supabase
        .from('kampanya')
        .delete()
        .eq('id', kampanyaId);

      if (error) {
        alert("Hata: " + error.message);
        setIslemYapiliyor(false);
      } else {
        alert('🗑️ Kampanya başarıyla silindi.');
        router.push('/admin'); 
        router.refresh(); 
      }
    }
  };

  if (yukleniyor) return (
    <div className="h-screen flex flex-col items-center justify-center text-blue-600 animate-pulse">
        <span className="text-3xl font-black">Yükleniyor...</span>
        <span className="text-sm text-slate-400 mt-2">Veriler çekiliyor</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Kampanyayı Düzenle</h2>
        <button onClick={() => router.push('/admin')} className="text-slate-400 font-bold hover:text-black transition-colors text-sm uppercase tracking-wider">Vazgeç</button>
      </div>

      <form onSubmit={guncelle} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        
        {/* BAŞLIK */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Başlığı</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold text-lg outline-none focus:border-blue-600 transition-all"
              value={form.baslik}
              onChange={(e) => setForm({...form, baslik: e.target.value})}
            />
        </div>

        {/* DETAY */}
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Kampanya Detayları</label>
            <textarea 
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none focus:border-blue-600 transition-all"
              value={form.detay}
              onChange={(e) => setForm({...form, detay: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Yapan Marka</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none"
                  value={form.yapan_marka}
                  onChange={(e) => setForm({...form, yapan_marka: e.target.value})}
                >
                    <option value="">Seçiniz...</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Faydalanılan Marka</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none"
                  value={form.fayd_marka}
                  onChange={(e) => setForm({...form, fayd_marka: e.target.value})}
                >
                    <option value="">Yok</option>
                    {markalar.map(m => <option key={m.id} value={m.id}>{m.marka_adi}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Geçerli Sektör</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none"
                  value={form.gecerli_sektor_id}
                  onChange={(e) => setForm({...form, gecerli_sektor_id: e.target.value})}
                >
                    <option value="">Seçiniz</option>
                    {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
                </select>
            </div>
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
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Link</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none"
                  value={form.link}
                  onChange={(e) => setForm({...form, link: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Son Tarih</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-medium outline-none"
                  value={form.bitis_date}
                  onChange={(e) => setForm({...form, bitis_date: e.target.value})}
                />
            </div>
        </div>

        <button 
          disabled={islemYapiliyor}
          type="submit" 
          className="w-full bg-blue-600 hover:bg-black text-white p-6 rounded-[2rem] text-xl font-black tracking-tight transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {islemYapiliyor ? 'İşlem Yapılıyor...' : 'Değişiklikleri Kaydet ✨'}
        </button>

      </form>

      {/* SİLME BUTONU */}
      <div className="mt-8 text-center">
        <button 
          type="button"
          onClick={kampanyaSil}
          disabled={islemYapiliyor}
          className="text-red-500 font-bold hover:text-white hover:bg-red-500 px-6 py-3 rounded-xl transition-all border border-red-100 hover:border-red-500 text-sm disabled:opacity-50"
        >
          🗑️ Bu Kampanyayı Kalıcı Olarak Sil
        </button>
      </div>

    </div>
  );
}