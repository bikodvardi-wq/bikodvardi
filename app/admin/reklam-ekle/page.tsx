"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const KONUMLAR = [
  { value: 'anasayfa_ust', label: 'Ana Sayfa — Üst (küçük şerit)' },
  { value: 'anasayfa_alt', label: 'Ana Sayfa — Alt (büyük banner)' },
  { value: 'sektor_ust', label: 'Sektör Sayfası — Üst (küçük şerit)' },
  { value: 'sektor_alt', label: 'Sektör Sayfası — Alt (büyük banner)' },
];

export default function ReklamEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [reklamlar, setReklamlar] = useState<any[]>([]);

  const [form, setForm] = useState({
    baslik: '',
    gorsel_url: '',
    link_url: '',
    konum: 'anasayfa_ust',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    aktif: true,
  });

  const listeyiGetir = async () => {
    const { data } = await supabase.from('reklam').select('*').order('created_at', { ascending: false });
    setReklamlar(data || []);
  };

  useEffect(() => {
    listeyiGetir();
  }, []);

  const formuSifirla = () => {
    setForm({
      baslik: '', gorsel_url: '', link_url: '', konum: 'anasayfa_ust',
      baslangic_tarihi: '', bitis_tarihi: '', aktif: true,
    });
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    const payload = {
      baslik: form.baslik,
      gorsel_url: form.gorsel_url,
      link_url: form.link_url,
      konum: form.konum,
      baslangic_tarihi: form.baslangic_tarihi || null,
      bitis_tarihi: form.bitis_tarihi || null,
      aktif: form.aktif,
    };

    const { error } = await supabase.from('reklam').insert([payload]);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      alert('✅ Reklam eklendi!');
      formuSifirla();
      listeyiGetir();
    }
    setYukleniyor(false);
  };

  const aktifligiDegistir = async (id: number, mevcutDurum: boolean) => {
    await supabase.from('reklam').update({ aktif: !mevcutDurum }).eq('id', id);
    listeyiGetir();
  };

  const sil = async (id: number) => {
    if (!confirm('Bu reklamı silmek istediğine emin misin?')) return;
    await supabase.from('reklam').delete().eq('id', id);
    listeyiGetir();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Reklam Alanları</h2>
        <button type="button" onClick={() => router.push('/admin')} className="text-sm font-bold text-slate-400 hover:text-slate-600">← Admin Paneline Dön</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- FORM --- */}
        <form onSubmit={kaydet} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Başlık (senin için — sitede görünmez)</label>
            <input required type="text" placeholder="Örn: Trendyol İşbirliği - Temmuz" className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl font-bold text-lg outline-none focus:border-blue-600 text-slate-900 transition-colors"
              value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Görsel URL</label>
            <input required type="text" placeholder="https://... (Supabase storage veya başka bir yerden)" className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
              value={form.gorsel_url} onChange={(e) => setForm({ ...form, gorsel_url: e.target.value })} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tıklanınca Gidilecek Link</label>
            <input required type="text" placeholder="https://..." className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
              value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nerede Gösterilsin</label>
            <select className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
              value={form.konum} onChange={(e) => setForm({ ...form, konum: e.target.value })}>
              {KONUMLAR.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Başlangıç Tarihi (boş = hemen)</label>
              <input type="date" className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                value={form.baslangic_tarihi} onChange={(e) => setForm({ ...form, baslangic_tarihi: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bitiş Tarihi (boş = süresiz)</label>
              <input type="date" className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                value={form.bitis_tarihi} onChange={(e) => setForm({ ...form, bitis_tarihi: e.target.value })} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="w-5 h-5" />
            <span className="text-sm font-bold text-slate-700">Yayınlandığında hemen aktif olsun</span>
          </label>

          <button disabled={yukleniyor} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-black tracking-tight transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-6">
            {yukleniyor ? 'Ekleniyor...' : 'Reklamı Ekle 🚀'}
          </button>
        </form>

        {/* --- MEVCUT REKLAMLAR LİSTESİ --- */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Mevcut Reklamlar ({reklamlar.length})</h3>
          <div className="space-y-3">
            {reklamlar.length === 0 && (
              <p className="text-slate-400 text-sm">Henüz reklam eklenmemiş.</p>
            )}
            {reklamlar.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                <img src={r.gorsel_url} className="w-16 h-16 object-cover rounded-lg bg-slate-100 flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{r.baslik}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {KONUMLAR.find(k => k.value === r.konum)?.label || r.konum}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {r.baslangic_tarihi ? new Date(r.baslangic_tarihi).toLocaleDateString('tr-TR') : 'Şimdi'} → {r.bitis_tarihi ? new Date(r.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <button
                    onClick={() => aktifligiDegistir(r.id, r.aktif)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors ${r.aktif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {r.aktif ? '● Aktif' : '○ Kapalı'}
                  </button>
                  <button onClick={() => sil(r.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700">
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}