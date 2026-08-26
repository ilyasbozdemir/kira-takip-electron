# İşletmeTakipAppPro — Mekan, Salon & Etkinlik Yönetim Sistemi

İşletmeTakipAppPro; mekanların, salonların, balo salonlarının, konferans
merkezlerinin, toplantı odalarının ve etkinlik alanlarının randevu, takvim,
tahsilat, müşteri ve evrak takibini tamamen yerel (offline) **SQLite**
veritabanı altyapısıyla gerçekleştiren profesyonel masaüstü uygulamasıdır.

## 🚀 Öne Çıkan Özellikler

- **Masaüstü & SQLite Mimarisi:** Electron + React TSX + Radix UI + Tailwind CSS
  v4 ve `better-sqlite3` yerel veritabanı motoru.
- **Tek Dosya Veritabanı (.vke):** Proje ve evrak verileri taşınabilir `.vke`
  SQLite dosyalarında saklanır. Çift tıklayarak doğrudan açılabilir.
- **Çakışma Önleyici Takvim:** Seçilen salon, tarih ve saat aralığında çakışan
  rezervasyonları anında tespit eden akıllı motor.
- **Çoklu Etkinlik Türleri:** Düğün, Nişan, Konferans, Balo, İftar, Konser,
  Lansman, Toplantı ve Özel Etkinlikler.
- **E-posta & Otomatik Güncelleme:** Entegre SMTP Nodemailer mail gönderimi ve
  `electron-updater` güncelleme sistemi.
- **Şablonlu Kopyalama:** WhatsApp / SMS bilgilendirme metinlerini tek tıkla
  dinamik değişkenlerle kopyalama.

## 💻 Geliştirme Komutları

Paket yükleme:

```bash
pnpm install
```

Geliştirme sunucusu:

```bash
pnpm dev
```

Windows kurulum paketleyicisi (.exe):

```bash
pnpm run pack:win
```
