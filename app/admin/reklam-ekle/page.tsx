"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const KONUMLAR = [
  { value: 'anasayfa_ust', label: 'Ana Sayfa — Orta (yatay banner)' },
  { value: 'anasayfa_alt', label: 'Ana Sayfa — Alt (kare)' },
  { value: 'sektor_ust', label: 'Sektör — Üst (yatay banner)' },
  { value: 'sektor_alt', label: 'Sektör — Alt (kare)' },
  { value: 'marka_alt', label: 'Marka — Alt (kare)' },
  { value: 'kampanya_alt', label: 'Kampanya — Alt (kare)' },
];

export default function ReklamEkle() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    baslik: '',
    gorsel_url: '',
    link_url: '',
    konumlar: ['anasayfa_alt'] as string[], // Çoklu seçim
    baslangic_tarihi: '',
    bitis_tarihi: '',
    aktif: true,
    etiket: 'Partner',
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
      baslik: '',
      gorsel_url: '',
      link_url: '',
      konumlar: ['anasayfa_alt'],
      baslangic_tarihi: '',
      bitis_tarihi: '',
      aktif: true,
      etiket: 'Partner',
    });
    setEditingId(null);
  };

  const konumToggle = (value: string) => {
    setForm((prev) => {
      const varMi = prev.konumlar.includes(value);
      if (varMi) {
        // En az 1 tane seçili kalsın
        if (prev.konumlar.length === 1) return prev;
        return { ...prev, konumlar: prev.konumlar.filter((k) => k !== value) };
      }
      return { ...prev, konumlar: [...prev.konumlar, value] };
    });
  };

  const duzenlemeyeBasla = (reklam: any) => {
    setEditingId(reklam.id);
    setForm({
      baslik: reklam.baslik || '',
      gorsel_url: reklam.gorsel_url || '',
      link_url: reklam.link_url || '',
      konumlar: [reklam.konum || 'anasayfa_alt'],
      baslangic_tarihi: reklam.baslangic_tarihi ? reklam.baslangic_tarihi.split('T')[0] : '',
      bitis_tarihi: reklam.bitis_tarihi ? reklam.bitis_tarihi.split('T')[0] : '',
      aktif: reklam.aktif ?? true,
      etiket: reklam.etiket || 'Partner',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      const isEditing = !!editingId;

      if (isEditing) {
        // Düzenleme → tek kayıt güncelle
        const payload = {
          baslik: form.baslik,
          gorsel_url: form.gorsel_url,
          link_url: form.link_url,
          konum: form.konumlar[0],
          baslangic_tarihi: form.baslangic_tarihi || null,
          bitis_tarihi: form.bitis_tarihi || null,
          aktif: form.aktif,
          etiket: form.etiket,
        };

        const res = await fetch('/api/admin/reklam', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });

        const result = await res.json();
        if (!res.ok) {
          alert('Hata: ' + (result.error || 'Güncellenemedi'));
          setYukleniyor(false);
          return;
        }

        alert('✅ Reklam güncellendi!');
      } else {
        // Yeni ekleme → seçilen her konum için ayrı kayıt oluştur
        let basarili = 0;
        let hata = '';

        for (const konum of form.konumlar) {
          const payload = {
            baslik: form.baslik,
            gorsel_url: form.gorsel_url,
            link_url: form.link_url,
            konum,
            baslangic_tarihi: form.baslangic_tarihi || null,
            bitis_tarihi: form.bitis_tarihi || null,
            aktif: form.aktif,
            etiket: form.etiket,
          };

          const res = await fetch('/api/admin/reklam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            basarili++;
          } else {
            const result = await res.json();
            hata = result.error || 'Hata oluştu';
          }
        }

        if (basarili > 0) {
          alert(`✅ ${basarili} konuma reklam eklendi!`);
        } else {
          alert('Hata: ' + hata);
        }
      }

      formuSifirla();
      listeyiGetir();
    } catch (err) {
      console.error(err);
      alert('Sunucu hatası oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const aktifligiDegistir = async (id: number, mevcutDurum: boolean) => {
    try {
      const res = await fetch('/api/admin/reklam', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, aktif: !mevcutDurum }),
      });

      if (!res.ok) {
        const result = await res.json();
        alert('Hata: ' + (result.error || 'Güncellenemedi'));
        return;
      }

      listeyiGetir();
    } catch (err) {
      console.error(err);
      alert('Sunucu hatası oluştu');
    }
  };

  const sil = async (id: number) => {
    if (!confirm('Bu reklamı silmek istediğine emin misin?')) return;

    try {
      const res = await fetch(`/api/admin/reklam?id=${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        alert('Hata: ' + (result.error || 'Silinemedi'));
        return;
      }

      if (editingId === id) formuSifirla();
      listeyiGetir();
    } catch (err) {
      console.error(err);
      alert('Sunucu hatası oluştu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>
          Reklam Alanları
        </h2>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-sm font-bold text-slate-400 hover:text-slate-600"
        >
          ← Admin Paneline Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FORM */}
        <form onSubmit={kaydet} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle'}
            </h3>
            {editingId && (
              <button type="button" onClick={formuSifirla} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                İptal
              </button>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Başlık (senin için — sitede görünmez)
            </label>
            <input
              required
              type="text"
              placeholder="Örn: TatilVillamda İşbirliği"
              className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl font-bold text-lg outline-none focus:border-blue-600 text-slate-900"
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Görsel URL
            </label>
            <input
              required
              type="text"
              placeholder="https://..."
              className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
              value={form.gorsel_url}
              onChange={(e) => setForm({ ...form, gorsel_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Etiket
            </label>
            <select
              className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
              value={form.etiket}
              onChange={(e) => setForm({ ...form, etiket: e.target.value })}
            >
              <option value="Partner">Partner</option>
              <option value="İşbirliği">İşbirliği</option>
              <option value="Sponsorlu">Sponsorlu</option>
              <option value="Reklam">Reklam</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Tıklanınca Gidilecek Link
            </label>
            <input
              required
              type="text"
              placeholder="https://..."
              className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-sm outline-none text-slate-900"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          </div>

          {/* ÇOKLU KONUM SEÇİMİ */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Nerede Gösterilsin {editingId ? '(Düzenlemede tek konum)' : '(Birden fazla seçebilirsin)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KONUMLAR.map((k) => (
                <label
                  key={k.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.konumlar.includes(k.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.konumlar.includes(k.value)}
                    onChange={() => konumToggle(k.value)}
                    className="w-4 h-4"
                    disabled={!!editingId && !form.konumlar.includes(k.value) && form.konumlar.length >= 1}
                  />
                  <span className="text-sm font-medium text-slate-800">{k.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Başlangıç Tarihi (boş = hemen)
              </label>
              <input
                type="date"
                className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                value={form.baslangic_tarihi}
                onChange={(e) => setForm({ ...form, baslangic_tarihi: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Bitiş Tarihi (boş = süresiz)
              </label>
              <input
                type="date"
                className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-slate-900"
                value={form.bitis_tarihi}
                onChange={(e) => setForm({ ...form, bitis_tarihi: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-sm font-bold text-slate-700">Yayınlandığında hemen aktif olsun</span>
          </label>

          <button
            disabled={yukleniyor}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-black tracking-tight transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-6"
          >
            {yukleniyor
              ? editingId
                ? 'Güncelleniyor...'
                : 'Ekleniyor...'
              : editingId
              ? 'Değişiklikleri Kaydet'
              : `Reklamı Ekle (${form.konumlar.length} konum) 🚀`}
          </button>
        </form>

        {/* LİSTE */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Mevcut Reklamlar ({reklamlar.length})
          </h3>
          <div className="space-y-3">
            {reklamlar.length === 0 && (
              <p className="text-slate-400 text-sm">Henüz reklam eklenmemiş.</p>
            )}
            {reklamlar.map((r) => (
              <div
                key={r.id}
                className={`bg-white border rounded-2xl p-4 flex items-center gap-4 ${
                  editingId === r.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <img
                  src={r.gorsel_url}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{r.baslik}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {KONUMLAR.find((k) => k.value === r.konum)?.label || r.konum}
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                    {r.etiket || 'Partner'}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <button
                    onClick={() => aktifligiDegistir(r.id, r.aktif)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors ${
                      r.aktif
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {r.aktif ? '● Aktif' : '○ Kapalı'}
                  </button>
                  <button
                    onClick={() => duzenlemeyeBasla(r)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => sil(r.id)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700"
                  >
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