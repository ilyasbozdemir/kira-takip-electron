# İşletmeTakipAppPro — Mekan, Salon & Etkinlik Yönetim Sistemi

İşletmeTakipAppPro; mekanların, salonların, balo salonlarının, konferans
merkezlerinin, toplantı odalarının ve etkinlik alanlarının randevu, takvim,
tahsilat, müşteri ve evrak takibini tamamen yerel (offline) **SQLite**
veritabanı altyapısıyla gerçekleştiren profesyonel masaüstü uygulamasıdır.

---

## ✨ Ana Özellikler

### 1️⃣ Çakışma Önleyici Takvim

Salon + Tarih + Saat → Çakışan randevuları otomatik tespit.

> **Örnek:** Aynı salona 2 düğün aynı saatte eklenemez — sistem anında uyarır.

### 2️⃣ Çoklu Etkinlik Türleri

| Emoji | Etkinlik      |
| ----- | ------------- |
| 💒    | Düğün         |
| 💍    | Nişan         |
| 🎤    | Konferans     |
| 🎭    | Balo          |
| 🕌    | İftar         |
| 🎸    | Konser        |
| 🚀    | Lansman       |
| 📅    | Toplantı      |
| ✨    | Özel Etkinlik |

### 3️⃣ Otomatik E-posta

SMTP + Nodemailer entegrasyonu → Müşterilere otomatik bilgilendirme e-postası.

### 4️⃣ Şablonlu Mesajlaşma

WhatsApp / SMS şablonları ile dinamik değişkenler (`{Müşteri Adı}`, `{Tarih}`
vb.) → Tek tıkla kopyala ve gönder.

### 5️⃣ Taşınabilir Veritabanı (.vke)

Tüm veriler tek bir **`.vke`** (SQLite) dosyasında saklanır.\
Çift tıkla doğrudan açılır — USB'de taşınabilir, yedeklenebilir.

### 6️⃣ Kapanışta Otomatik Yedekleme

- Uygulama her kapandığında aktif `.vke` dosyasının yerel yedeği alınır (son **7
  yedek** rotasyonu).
- SMTP ayarları yapılıysa yedek dosya e-posta eki olarak belirtilen adrese
  otomatik gönderilir.

---

## 💡 Kullanım Alanları

### ✅ Düğün / Nikah Salonları

- Çakışma yok
- Müşteri listesi & geçmiş
- E-posta otomasyonu

### ✅ Konferans Merkezleri

- Toplantı takvimi
- Kişi sayısı yönetimi
- İftar / etkinlik planlama

### ✅ Balo / Etkinlik Mekanları

- Kapasite kontrolü
- Fiyat & Tahsilat takibi
- WhatsApp notifikasyon

---

## 🔍 Neden İyi Bir Proje?

| Avantaj             | Açıklama                               |
| ------------------- | -------------------------------------- |
| **Offline Çalışır** | İnternet gerekmez, yerel SQLite        |
| **Taşınabilir**     | `.vke` dosyası → USB'de taşı           |
| **Otomatik Yedek**  | Kapanışta e-posta + yerel yedek        |
| **Profesyonel**     | E-posta, SMS, Takvim, Müşteri Yönetimi |
| **Otomasyon**       | Şablonlu mesajlar, çakışma kontrolü    |
| **Modern Stack**    | Electron + React + Tailwind CSS v4     |

---

## 🎯 Çözdüğü Sorunlar

| Sorun                               | Çözüm                                   |
| ----------------------------------- | --------------------------------------- |
| ❌ "2 düğün aynı saatte kitleniyor" | ✅ Otomatik çakışma kontrolü            |
| ❌ "Müşteri hatırlamıyor"           | ✅ E-posta / WhatsApp otomasyonu        |
| ❌ "Veriler bulutta mı?"            | ✅ Kendi bilgisayarında, `.vke` dosyası |
| ❌ "Tek tek SMS yazıyorum"          | ✅ Şablonlar, dinamik değişkenler       |
| ❌ "Yedek almayı unuttum"           | ✅ Kapanışta otomatik e-posta yedeği    |

---

## 📁 Proje Yapısı

```
kira-takip-electron/
├── electron/              ← Electron ana işlemi (main, preload, database)
│   ├── main.ts            ← IPC, pencere yönetimi, yedekleme
│   ├── preload.ts         ← Güvenli IPC köprüsü
│   └── database.ts        ← SQLite sorgu katmanı
├── src/                   ← React uygulaması (TSX)
│   ├── screens/           ← Sayfa bileşenleri
│   ├── components/        ← UI bileşenleri
│   ├── store/             ← Zustand store
│   └── App.tsx            ← Ana uygulama
├── public/                ← Statik dosyalar
├── build/                 ← Build kaynakları (icon, nsis)
├── package.json           ← Proje bağımlılıkları
├── vite.config.ts         ← Vite konfigürasyonu
├── tsconfig.json          ← TypeScript ayarları
├── eslint.config.js       ← Kod kalitesi
└── AGENTS.md              ← AI agent rehberi
```

---

## 🚀 Nasıl Çalıştırılır?

### Geliştirme

```bash
pnpm install    # Bağımlılıkları yükle
pnpm dev        # Dev sunucusu başlat
```

### Windows Kurulum Paketi (.exe)

```bash
pnpm run pack:win    # .exe oluştur (release klasörüne)
```

### Release Yayımlama (GitHub Actions)

```bash
pnpm run release    # Build + GitHub Releases'e yükle
```

---

## 🛠️ Teknoloji Yığını

- **Electron** — Masaüstü çerçevesi
- **React 19 + TypeScript** — Arayüz
- **Tailwind CSS v4** — Stil
- **Radix UI** — Erişilebilir UI bileşenleri
- **better-sqlite3** — Yerel SQLite veritabanı
- **Nodemailer** — SMTP e-posta
- **electron-updater** — Otomatik güncelleme
- **Vite** — Geliştirme & build aracı
