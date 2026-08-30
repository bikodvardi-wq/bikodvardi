import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda | biKodVardı - Türkiye\'nin İndirim Kodu Platformu',
  description: 'biKodVardı hakkında bilgi edinin. Türkiye\'nin en güncel indirim kodları ve kampanya platformu olarak misyonumuz, vizyonumuz ve ekibimiz.',
};

export default function Hakkimizda() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest no-underline mb-8 block">← ANA SAYFAYA DÖN</Link>
          <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter italic uppercase" style={{ fontFamily: 'Outfit' }}>
            Hakkı<span className="text-blue-600">mızda</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium">Türkiye'nin en güncel indirim kodu ve kampanya platformu</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-8">

        {/* BİZ KİMİZ */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
            Biz Kimiz?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            <strong>biKodVardı</strong>, Türkiye'nin önde gelen e-ticaret markalarının güncel indirim kodlarını, kampanyalarını ve fırsatlarını tek çatı altında toplayan bağımsız bir dijital platformdur. 2025 yılında kurulan platformumuz, kullanıcıların online alışverişlerinde maksimum tasarruf sağlamasına yardımcı olmak amacıyla hizmet vermektedir.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Trendyol, Hepsiburada, Amazon Türkiye, Migros, Yemeksepeti ve yüzlerce marka ile kurduğumuz iş birlikleri sayesinde doğrulanmış ve aktif indirim kodlarını kullanıcılarımıza sunuyoruz. Süresi dolmuş veya geçersiz kod paylaşmak yerine her kampanyayı düzenli olarak kontrol ediyor ve güncelliyoruz.
          </p>
        </div>

        {/* MİSYON VİZYON */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-600 p-10 rounded-[3rem] shadow-sm">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
              Misyonumuz
            </h2>
            <p className="text-blue-100 leading-relaxed">
              Her Türk tüketicisinin online alışverişte en iyi fiyatı bulmasını sağlamak. Karmaşık kampanya dünyasını sadeleştirerek herkesin tasarruf yapabilmesini mümkün kılmak.
            </p>
          </div>
          <div className="bg-slate-900 p-10 rounded-[3rem] shadow-sm">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
              Vizyonumuz
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Türkiye'nin en güvenilir ve kapsamlı indirim kodu platformu olmak. Her alışverişte kullanıcılarımızın yanında olmak ve dijital tasarruf kültürünü yaygınlaştırmak.
            </p>
          </div>
        </div>

        {/* NEDEN BİKODVARDI */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
            Neden biKodVardı?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '✓', baslik: 'Doğrulanmış Kodlar', aciklama: 'Paylaştığımız her indirim kodu test edilmiş ve aktif olduğu doğrulanmıştır. Geçersiz kod paylaşmıyoruz.' },
              { icon: '✓', baslik: 'Güncel İçerik', aciklama: 'Kampanyalar her ay güncellenir. Süresi dolan kodlar anında kaldırılır, yenileri eklenir.' },
              { icon: '✓', baslik: '700+ Marka', aciklama: 'Trendyol\'dan Hepsiburada\'ya, Migros\'tan Yemeksepeti\'ne 700\'den fazla marka tek platformda.' },
              { icon: '✓', baslik: 'Ücretsiz Kullanım', aciklama: 'biKodVardı\'yı kullanmak tamamen ücretsizdir. Herhangi bir üyelik veya ödeme gerekmez.' },
              { icon: '✓', baslik: 'Güvenli Platform', aciklama: 'SSL sertifikalı, güvenli altyapı. Kişisel bilgilerinizi asla paylaşmıyoruz.' },
              { icon: '✓', baslik: 'Blog & Rehberler', aciklama: 'Alışveriş rehberleri, kampanya incelemeleri ve tasarruf ipuçlarıyla dolu blog içerikleri.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{item.baslik}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.aciklama}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NASIL ÇALIŞIR */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
            Nasıl Çalışır?
          </h2>
          <div className="space-y-6">
            {[
              { num: '1', baslik: 'Markayı Bul', aciklama: 'Alışveriş yapmak istediğiniz markayı platformumuzda arayın veya kategoriler arasında gezinin.' },
              { num: '2', baslik: 'Kodu Kopyala', aciklama: '"Kuponu Gör" butonuna tıklayarak aktif indirim kodunu kopyalayın.' },
              { num: '3', baslik: 'Alışveriş Yap', aciklama: 'İlgili mağazanın ödeme sayfasında indirim kodu alanına kopyaladığınız kodu yapıştırın.' },
              { num: '4', baslik: 'Tasarruf Et', aciklama: 'İndirim sepetinize otomatik olarak uygulanır ve daha az ödeyerek alışverişinizi tamamlarsınız.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">{item.num}</span>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{item.baslik}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.aciklama}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YASAL BİLGİLER */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
            Yasal Bilgiler
          </h2>
          <div className="bg-slate-50 rounded-2xl p-6 space-y-3 text-slate-600">
            <p><strong>Platform Adı:</strong> biKodVardı</p>
            <p><strong>Web Sitesi:</strong> bikodvardi.com</p>
            <p><strong>Faaliyet Türü:</strong> Bağımsız Dijital Yayın Platformu</p>
            <p><strong>Ülke:</strong> Türkiye</p>
            <p><strong>E-posta:</strong> <a href="mailto:bikodvardi@gmail.com" className="text-blue-600 underline">bikodvardi@gmail.com</a></p>
          </div>
          <p className="text-slate-500 text-sm mt-6 leading-relaxed">
            biKodVardı, bağımsız bir yayın platformudur. Sitede yer alan affiliate bağlantıları aracılığıyla gerçekleştirilen alışverişlerden komisyon geliri elde edilebilir. Bu durum kullanıcılar için herhangi bir ek maliyet doğurmaz. Paylaşılan indirim kodları ve kampanyalar ilgili markalar tarafından sağlanmakta olup biKodVardı kampanyaların geçerliliği konusunda nihai sorumluluk taşımamaktadır.
          </p>
        </div>

        {/* İLETİŞİM */}
        <div className="bg-blue-600 p-10 md:p-16 rounded-[3rem] shadow-sm text-center">
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
            İletişime Geçin
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Öneri, şikayet veya iş birliği talepleriniz için bize ulaşabilirsiniz. En kısa sürede geri dönüş yapacağız.
          </p>
          <a 
            href="mailto:bikodvardi@gmail.com" 
            className="inline-block bg-white text-blue-600 font-black px-8 py-4 rounded-full hover:bg-slate-100 transition-colors shadow-xl no-underline"
          >
            bikodvardi@gmail.com
          </a>
          <div className="mt-8 flex justify-center gap-6">
            <Link href="/gizlilik-politikasi" className="text-blue-200 text-sm hover:text-white transition-colors no-underline">
              Gizlilik Politikası
            </Link>
            <Link href="/iletisim" className="text-blue-200 text-sm hover:text-white transition-colors no-underline">
              İletişim
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}