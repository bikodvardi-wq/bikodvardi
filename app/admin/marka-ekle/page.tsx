"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MarkaEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  const [tumMarkalar, setTumMarkalar] = useState<any[]>([]);
  const [benzerMarkalar, setBenzerMarkalar] = useState<any[]>([]);
  const [sektorler, setSektorler] = useState<any[]>([]);

  const [form, setForm] = useState({
    marka_adi: '',
    logo_url: '',
    sektor_id: '',
    marka_email: '', // YENİ: İletişim maili
    ek_sektor_idler: [] as string[]
  });

  useEffect(() => {
    const verileriGetir = async () => {
      // Sektörleri Çek
      const { data: sData } = await supabase.from('sektor').select('id, sektor_adi').order('sektor_adi');
      setSektorler(sData || []);

      // Mevcut Markaları Çek (Kontrol için)
      const { data: mData } = await supabase.from('marka').select('id, marka_adi, logo_url');
      setTumMarkalar(mData || []);
    };
    verileriGetir();
  }, []);

  const isimKontrol = (girilenIsim: string) => {
    setForm({ ...form, marka_adi: girilenIsim });
    if (girilenIsim.length > 1) {
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
    
    const aynisiVarMi = tumMarkalar.find(m => m.marka_adi.toLowerCase() === form.marka_adi.toLowerCase());
    if (aynisiVarMi) {
        if(!confirm(`DİKKAT: "${aynisiVarMi.marka_adi}" isminde bir marka zaten kayıtlı! Yine de eklemek istiyor musun?`)) {
            return;
        }
    }

    setYukleniyor(true);

    const { error } = await supabase.from('marka').insert([{
      marka_adi: form.marka_adi,
      logo_url: form.logo_url,
      sektor_id: form.sektor_id,
      marka_email: form.marka_email || null, // Veritabanına kaydediyoruz
      ek_sektor_idler: form.ek_sektor_idler.length > 0 ? form.ek_sektor_idler : null,
      slug: slugOlustur(form.marka_adi)
    }]);

    if (error) { 
        alert(error.message); 
        setYukleniyor(false); 
    } else { 
        alert('✅ Marka Başarıyla Tanımlandı!'); 
        router.push('/admin'); 
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 font-['Plus_Jakarta_Sans']">
      <h2 className="text-3xl font-[900] mb-8 tracking-tight text-slate-900" style={{ fontFamily: 'Outfit' }}>Yeni Marka Tanımla 🏷️</h2>
      
      <form onSubmit={kaydet} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        
        {/* MARKA ADI GİRİŞİ */}
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Marka Adı</label>
          <input 
              required 
              type="text" 
              placeholder="Örn: Lescon"
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" 
              value={form.marka_adi} 
              onChange={(e) => isimKontrol(e.target.value)} 
          />
          
          {benzerMarkalar.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-100 rounded-2xl shadow-2xl z-20 overflow-hidden">
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

        {/* MARKA E-POSTA (İletişim İçin) */}
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
          <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 ml-1">Marka İletişim / Kampanya Maili</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📩</span>
            <input 
              type="email" 
              placeholder="pazarlama@marka.com" 
              className="w-full bg-white border border-emerald-200 p-4 pl-12 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500" 
              value={form.marka_email} 
              onChange={(e) => setForm({...form, marka_email: e.target.value})} 
            />
          </div>
          <p className="text-[10px] text-emerald-600/70 mt-2 font-medium ml-1 italic">
            * Hazırladığımız kampanya mailleri bu adrese gönderilecek.
          </p>
        </div>

        {/* LOGO URL */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Logo URL (PNG/SVG)</label>
          <input 
            type="text" 
            placeholder="https://.../logo.png"
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-600 outline-none" 
            value={form.logo_url} 
            onChange={(e) => setForm({...form, logo_url: e.target.value})} 
          />
        </div>

        {/* ANA SEKTÖR */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Ana Sektör</label>
          <select 
            required 
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none appearance-none cursor-pointer" 
            value={form.sektor_id} 
            onChange={(e) => setForm({...form, sektor_id: e.target.value})}
          >
            <option value="">Sektör Seçiniz...</option>
            {sektorler.map(s => <option key={s.id} value={s.id}>{s.sektor_adi}</option>)}
          </select>
        </div>

        <button 
          disabled={yukleniyor} 
          className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black text-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          {yukleniyor ? 'Veriler İşleniyor...' : 'Markayı Sisteme Kaydet 🚀'}
        </button>
      </form>
    </div>
  );
}