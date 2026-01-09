"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MarkaEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Veritabanındaki TÜM markaları buraya çekeceğiz
  const [tumMarkalar, setTumMarkalar] = useState<any[]>([]);
  // Arama sonucunda eşleşenleri buraya koyacağız
  const [benzerMarkalar, setBenzerMarkalar] = useState<any[]>([]);

  const [sektorler, setSektorler] = useState<any[]>([]);

  const [form, setForm] = useState({
    marka_adi: '',
    logo_url: '',
    sektor_id: '',
    ek_sektor_idler: [] as string[]
  });

  useEffect(() => {
    const verileriGetir = async () => {
      // 1. Sektörleri Çek
      const { data: sData } = await supabase.from('sektor').select('id, sektor_adi').order('sektor_adi');
      setSektorler(sData || []);

      // 2. Mevcut Markaların Hepsini Çek (Kontrol için)
      const { data: mData } = await supabase.from('marka').select('id, marka_adi, logo_url');
      setTumMarkalar(mData || []);
    };
    verileriGetir();
  }, []);

  // Marka adı her değiştiğinde çalışır
  const isimKontrol = (girilenIsim: string) => {
    setForm({ ...form, marka_adi: girilenIsim });

    if (girilenIsim.length > 1) {
      // Girilen ismi içeren markaları filtrele
      const eslesenler = tumMarkalar.filter(m => 
        m.marka_adi.toLowerCase().includes(girilenIsim.toLowerCase())
      );
      setBenzerMarkalar(eslesenler);
    } else {
      setBenzerMarkalar([]);
    }
  };

  const slugOlustur = (text: string) => {
    return text.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tam eşleşme kontrolü (Aynısı varsa uyarı ver)
    const aynisiVarMi = tumMarkalar.find(m => m.marka_adi.toLowerCase() === form.marka_adi.toLowerCase());
    if (aynisiVarMi) {
        if(!confirm(`DİKKAT: "${aynisiVarMi.marka_adi}" isminde bir marka zaten kayıtlı! Yine de eklemek istiyor musun?`)) {
            return; // İptal etti
        }
    }

    setYukleniyor(true);

    const { error } = await supabase.from('marka').insert([{
      marka_adi: form.marka_adi,
      logo_url: form.logo_url,
      sektor_id: form.sektor_id,
      ek_sektor_idler: form.ek_sektor_idler.length > 0 ? form.ek_sektor_idler : null,
      slug: slugOlustur(form.marka_adi)
    }]);

    if (error) { alert(error.message); setYukleniyor(false); }
    else { alert('✅ Marka Eklendi!'); router.push('/admin'); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h2 className="text-3xl font-black mb-8 tracking-tight" style={{ fontFamily: 'Outfit' }}>Yeni Marka Tanımla</h2>
      
      <form onSubmit={kaydet} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
        
        {/* MARKA ADI GİRİŞİ */}
        <div className="relative">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Marka Adı</label>
          <input 
            required 
            type="text" 
            placeholder="Örn: Trendyol"
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" 
            value={form.marka_adi} 
            onChange={(e) => isimKontrol(e.target.value)} 
          />
          
          {/* CANLI KONTROL SONUÇLARI */}
          {benzerMarkalar.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-100 rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                    ⚠️ Sistemde Benzer Kayıtlar Var:
                </div>
                <div className="max-h-48 overflow-y-auto">
                    {benzerMarkalar.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                            <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center p-1">
                                {m.logo_url ? <img src={m.logo_url} className="max-h-full object-contain" /> : "?"}
                            </div>
                            <span className="font-bold text-slate-700">{m.marka_adi}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* LOGO URL */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Logo URL (PNG/SVG)</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl" value={form.logo_url} onChange={(e) => setForm({...form, logo_url: e.target.value})} />
        </div>

        {/* ANA SEKTÖR */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Ana Sektör</label>
          <select required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" value={form.sektor_id} onChange={(e) => setForm({...form, sektor_id: e.target.value})}>
            <option value="">Seçiniz...</option>
            {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
          </select>
        </div>

        <button disabled={yukleniyor} className="w-full bg-black text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all">
          {yukleniyor ? 'Kaydediliyor...' : 'Markayı Oluştur'}
        </button>
      </form>
    </div>
  );
}