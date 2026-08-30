"use client";

import Link from 'next/link';

export default function GizlilikPolitikasi() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-20">
      <div className="bg-white border-b border-slate-200 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-widest no-underline mb-8 block">← ANA SAYFAYA DÖN</Link>
          <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter italic uppercase" style={{ fontFamily: 'Outfit' }}>
            Gizlilik <span className="text-blue-600">Politikası</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium uppercase text-xs tracking-widest">Son Güncelleme: Eylül 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 leading-relaxed text-slate-600 space-y-8">

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>1. Giriş</h2>
          <p>biKodVardı ("biz", "platform") olarak, <strong>bikodvardi.com</strong> adresinde yayınlanan web sitemizi ziyaret eden kullanıcıların gizliliğini korumak önceliğimizdir. Bu Gizlilik Politikası, hangi verileri topladığımızı, bu verileri nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır. Sitemizi kullanarak bu politikayı kabul etmiş sayılırsınız.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>2. Toplanan Kişisel Veriler</h2>
          <p className="mb-4">Sitemizi ziyaret ettiğinizde aşağıdaki veriler otomatik olarak toplanabilir:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP adresi ve coğrafi konum bilgisi (şehir düzeyinde)</li>
            <li>Tarayıcı türü ve sürümü</li>
            <li>İşletim sistemi bilgisi</li>
            <li>Siteye giriş ve çıkış saatleri</li>
            <li>Ziyaret edilen sayfalar ve tıklanan bağlantılar</li>
            <li>Siteye nereden geldiğinize dair yönlendirme (referrer) bilgisi</li>
          </ul>
          <p className="mt-4">Bülten aboneliği veya iletişim formu aracılığıyla bize e-posta adresinizi iletirseniz bu bilgi gönüllü olarak paylaşılmış kabul edilir ve yalnızca belirtilen amaç için kullanılır.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>3. Çerezler (Cookies)</h2>
          <p className="mb-4">Sitemiz, kullanıcı deneyimini iyileştirmek ve analiz yapmak amacıyla çerez kullanmaktadır. Çerez türleri aşağıdaki gibidir:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için gereklidir. Bu çerezler kapatılamaz.</li>
            <li><strong>Analitik Çerezler:</strong> Google Analytics aracılığıyla ziyaretçi davranışlarını anonim olarak analiz etmek için kullanılır.</li>
            <li><strong>Reklam Çerezleri:</strong> Google AdSense tarafından kişiselleştirilmiş reklam sunmak amacıyla kullanılır.</li>
            <li><strong>Tercih Çerezleri:</strong> Dil ve bölge gibi kullanıcı tercihlerini hatırlamak için kullanılır.</li>
          </ul>
          <p className="mt-4">Tarayıcınızın ayarlarından çerezleri yönetebilir veya tamamen devre dışı bırakabilirsiniz. Ancak bazı çerezlerin kapatılması, sitenin belirli özelliklerinin çalışmamasına yol açabilir.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>4. Google AdSense ve Reklamlar</h2>
          <p className="mb-4">Sitemizde <strong>Google AdSense</strong> reklam ağı kullanılmaktadır. Google AdSense, ilgi alanlarınıza göre kişiselleştirilmiş reklamlar sunmak amacıyla çerez ve benzeri teknolojiler kullanabilir.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Google'ın reklam çerezleri, daha önce ziyaret ettiğiniz sitelere dayalı reklamlar göstermek için kullanılabilir.</li>
            <li>Kişiselleştirilmiş reklamları devre dışı bırakmak için <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Reklam Ayarları</a> sayfasını ziyaret edebilirsiniz.</li>
            <li>Google'ın gizlilik politikası hakkında daha fazla bilgi için <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">policies.google.com/privacy</a> adresini ziyaret edebilirsiniz.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>5. Google Analytics</h2>
          <p>Sitemiz, ziyaretçi istatistiklerini analiz etmek amacıyla <strong>Google Analytics</strong> kullanmaktadır. Google Analytics, anonim kullanım verileri toplar ve bu veriler Google'ın sunucularında saklanır. IP anonimleştirme özelliği aktif durumdadır. Google Analytics veri toplamayı devre dışı bırakmak için <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Analytics Opt-out eklentisini</a> kullanabilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>6. Affiliate (Ortaklık) Bağlantıları</h2>
          <p>Sitemizde yer alan bazı bağlantılar affiliate (ortaklık) bağlantılarıdır. Bu bağlantılar aracılığıyla ilgili marka veya platformun web sitesine yönlendirilirsiniz. Yönlendirme sonucunda gerçekleştirilen alışverişlerden tarafımıza komisyon ödenebilir. Bu durum, sizin için herhangi bir ek maliyet doğurmaz. Yönlendirdiğimiz sitelerin kendi gizlilik politikalarından biKodVardı sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>7. Verilerin Saklanma Süresi</h2>
          <p>Toplanan anonim analitik veriler en fazla <strong>26 ay</strong> süreyle saklanmaktadır. E-posta aboneliği yoluyla iletilen kişisel veriler, abonelik iptal edilene kadar sistemimizde tutulur. Abonelikten çıkmak için bize e-posta gönderebilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>8. Üçüncü Taraflarla Veri Paylaşımı</h2>
          <p>Kişisel verilerinizi hiçbir koşulda üçüncü taraflara satmıyoruz. Veriler yalnızca aşağıdaki durumlarda paylaşılabilir:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Yasal zorunluluk durumlarında yetkili makamlarla</li>
            <li>Hizmetin sunulması için zorunlu olan ve gizlilik sözleşmesiyle bağlı servis sağlayıcılarıyla (Google Analytics, Google AdSense gibi)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>9. KVKK Kapsamında Haklarınız</h2>
          <p className="mb-4">6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme hakkı</li>
            <li>İşlenen verileriniz hakkında bilgi talep etme hakkı</li>
            <li>Verilerinizin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme hakkı</li>
            <li>Yurt içinde veya yurt dışında verilerinizin aktarıldığı üçüncü kişileri bilme hakkı</li>
            <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme hakkı</li>
            <li>Verilerinizin silinmesini veya yok edilmesini talep etme hakkı</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme hakkı</li>
          </ul>
          <p className="mt-4">Bu haklarınızı kullanmak için <strong>bikodvardi@gmail.com</strong> adresine e-posta gönderebilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>10. Çocukların Gizliliği</h2>
          <p>Sitemiz 13 yaşın altındaki çocuklara yönelik değildir ve bu yaş grubundan bilerek kişisel veri toplamıyoruz. 13 yaşın altında bir çocuğun bize kişisel veri ilettiğini fark ederseniz lütfen bizimle iletişime geçin.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>11. Politika Güncellemeleri</h2>
          <p>Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayınlanacak ve "Son Güncelleme" tarihi revize edilecektir. Önemli değişiklikler söz konusu olduğunda sizi e-posta yoluyla bilgilendirmeye çalışacağız.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>12. İletişim</h2>
          <p>Gizlilik politikamız hakkında sorularınız, talepleriniz veya şikayetleriniz için bizimle aşağıdaki kanallardan iletişime geçebilirsiniz:</p>
          <div className="mt-4 bg-slate-50 rounded-2xl p-6 space-y-2">
            <p><strong>Platform:</strong> biKodVardı</p>
            <p><strong>Web Sitesi:</strong> bikodvardi.com</p>
            <p><strong>E-posta:</strong> <a href="mailto:bikodvardi@gmail.com" className="text-blue-600 underline">bikodvardi@gmail.com</a></p>
          </div>
        </section>

      </div>
    </main>
  );
}