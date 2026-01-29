export default function Hakkimizda() {
  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '80px 20px', 
      backgroundColor: '#f8faff', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Ana Başlık */}
      <h1 style={{ 
        textAlign: 'center', 
        color: '#1e40af', 
        fontSize: '2.8rem', 
        marginBottom: '60px' 
      }}>
        biKodVardı Hakkında
      </h1>

      {/* Kart 1: Biz Kimiz? */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '40px', 
        marginBottom: '40px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        border: '1px solid #e5e7eb' 
      }}>
        <h2 style={{ color: '#1e40af', marginBottom: '20px', fontSize: '2rem' }}>Biz Kimiz?</h2>
        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#374151' }}>
          Türkiye'nin en sevilen markalarının güncel kampanya ve indirim kodlarını tek merkezde toplayan bağımsız platformuz. Dijital tasarrufun yeni nesil rehberi olarak, alışverişi daha kolay ve ucuz hale getiriyoruz.
        </p>
      </div>

      {/* Kart 2: Amacımız */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '40px', 
        marginBottom: '40px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        border: '1px solid #e5e7eb' 
      }}>
        <h2 style={{ color: '#1e40af', marginBottom: '20px', fontSize: '2rem' }}>Amacımız</h2>
        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#374151' }}>
          Alışveriş deneyimini daha akıllı ve ekonomik kılmak. Binlerce fırsat arasından kaybolmak yerine, <strong>gerçekten çalışan</strong> kodları hızlıca sunuyoruz. Her kampanya düzenli kontrol edilip doğrulanıyor.
        </p>
      </div>

      {/* Kart 3: Neden Biz? */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '40px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        border: '1px solid #e5e7eb' 
      }}>
        <h2 style={{ color: '#1e40af', marginBottom: '20px', fontSize: '2rem' }}>Neden biKodVardı?</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.15rem', lineHeight: '1.8' }}>
          <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem', marginRight: '12px' }}>✓</span>
            Güncel ve test edilmiş kodlar – eski fırsat paylaşmıyoruz
          </li>
          <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem', marginRight: '12px' }}>✓</span>
            Hızlı, karmaşasız ve kullanıcı dostu arayüz
          </li>
          <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem', marginRight: '12px' }}>✓</span>
            500+ aktif fırsat – Trendyol, Hepsiburada, n11 gibi büyük markalar dahil
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem', marginRight: '12px' }}>✓</span>
            Her gün yenilenen içerik – yeni kampanyalar anında burada
          </li>
        </ul>
      </div>

      {/* Alt Kısım: İletişim + Slogan */}
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <p style={{ fontSize: '1.3rem', fontStyle: 'italic', color: '#4b5563', marginBottom: '20px' }}>
          "Her alışverişte bi kod vardı dedirten fırsatlar!"
        </p>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
          Sorun mu var, önerin mi var? ✉️ 
          <a href="mailto:iletisim@bikodvardi.com" style={{ color: '#1e40af', textDecoration: 'underline' }}>
            iletisim@bikodvardi.com
          </a>
        </p>
        
        <p style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '40px' }}>
          Son güncelleme: 30 Ocak 2026
        </p>
      </div>
    </div>
  );
}