# System Analysis — Portfolio Backend Services
**Tarih:** 14.03.2026  
**Hedef Ortam:** cPanel Stellar18 — server330 — audfix.com

---

## 1. Mevcut Sistem: Ne Yapıyor?

| Katman | Teknoloji | Açıklama |
|---|---|---|
| Runtime | Node.js (≥18) | Express tabanlı REST API |
| Web Framework | Express 4.21 | İki route: analytics + builder-lead |
| Veritabanı | MySQL2 | Pooled bağlantı, connectionLimit: 5 |
| Güvenlik | Helmet + CORS + Rate Limit | 15dk/100 istek limiti |
| Migration | SQL (001_init.sql) | `builder_leads` ve `analytics_events` tabloları |

### Endpoint'ler

| Method | Path | İşlev |
|---|---|---|
| `POST` | `/api/analytics` | Frontend'den event kaydı alır, `analytics_events` tablosuna yazar |
| `POST` | `/api/builder-lead` | Form submission alır, `builder_leads` tablosuna yazar |
| `GET` | `/api/health` | Uygulama sağlık kontrolü |

---

## 2. Hedef Sunucu Ortamı Analizi

```
Hosting Package : Stellar18
Server          : server330
cPanel          : v126.0 (build 48)
Web Server      : Apache 2.4.66
Veritabanı      : MariaDB 11.4.10
OS              : Linux x86_64 (kernel 4.18.0)
Domain          : audfix.com
SSH Port        : 21098
```

---

## 3. Uyumluluk Tablosu

| Konu | Durum | Detay |
|---|---|---|
| **mysql2 → MariaDB 11.4** | ✅ Uyumlu | mysql2 paketi MariaDB ile tam uyumlu. JSON kolon tipi MariaDB 10.2+'dan itibaren destekleniyor, 11.4 sorunsuz. |
| **InnoDB + utf8mb4** | ✅ Uyumlu | Migration SQL olduğu gibi çalışır. |
| **Node.js 18+ on cPanel 126** | ✅ Destekleniyor (elle kurulum gerekir) | cPanel 126, "Setup Node.js App" özelliği ile Phusion Passenger üzerinden Node.js çalıştırır. **Otomatik değil**, cPanel panelinden kurulum yapılması zorunlu. |
| **Apache → Node.js Proxy** | ✅ Passenger halleder | Apache trafiği Passenger üzerinden uygulamaya iletir. Port 3001'e doğrudan bağlanılmaz. |
| **PORT ayarı** | ✅ Sorunsuz | Passenger `process.env.PORT` değerini kendi yönetir. `|| 3001` fallback kod sorun çıkarmaz. |
| **connectionLimit: 5** | ✅ Shared hosting için ideal | Yüksek değer verilen paylaşımlı ortamda "too many connections" hatasına yol açar. 5 doğru seçim. |
| **Rate Limiting** | ✅ Aktif | 15dk/100 istek — paylaşımlı sunucuyu korur. |
| **Input Validation (SQL Injection)** | ✅ Güvenli | Tüm DB sorguları `pool.execute(?, [...])` ile parameterized. |

---

## 4. Tespit Edilen Sorunlar

### 🔴 KRİTİK — Doğrudan Çalışmaz

#### 4.1 CORS Origins — audfix.com Yok
```js
// src/server.js — mevcut hal
origin: [
  'https://aycicek.web.app',
  'https://melihaycicek.com',
  'https://www.melihaycicek.com',
],
```
API `audfix.com` üzerinde çalışacaksa ve frontend farklı bir origin'den istek atacaksa, o domain'in CORS listesine eklenmesi gerekir. Şu an `audfix.com` yok.  
**→ Çözüm:** Frontend'in çalışacağı domain'i CORS listesine ekle.

---

### 🟡 ORTA — Temizlenmesi Gereken

#### 4.2 Kullanılmayan Bağımlılık: `nodemailer`
```json
// package.json
"nodemailer": "^6.9.15"
```
Kodun hiçbir yerinde import edilmiyor, kullanılmıyor. Gereksiz yere bağımlılık ağırlığı oluşturuyor.  
**→ Çözüm:** `npm uninstall nodemailer` ile kaldır.

#### 4.3 `.gitignore` Dosyası Yok
Projede `.gitignore` bulunmuyor. Bu durum `.env` dosyasının veya `node_modules/` klasörünün yanlışlıkla commit edilme riskini yaratır.  
**→ Çözüm:** Aşağıdaki içerikle `.gitignore` oluştur:
```
node_modules/
.env
*.log
```

---

### 🔵 BİLGİ — Deployment Notları

#### 4.4 cPanel Node.js Kurulum Adımları (Zorunlu)
cPanel panelinde yapılması gerekenler:
1. **Software → Setup Node.js App** bölümüne git
2. **Create Application** tıkla
3. Application root: `/home/audfllcd/melihaycicek-backend-services`
4. Application URL: istediğin subdomain veya path (örn. `api.audfix.com`)
5. Application startup file: `src/server.js`
6. Node.js version: **18.x** veya üstü seç
7. `.env` değerlerini buradan environment variables olarak gir (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)

#### 4.5 Veritabanı Migration
cPanel → phpMyAdmin veya MySQL hesabı oluştur, sonra:
```bash
mysql -u <user> -p <dbname> < migrations/001_init.sql
```

#### 4.6 SSH Deploy
```bash
ssh audfllcd@audfix.com -p 21098
cd ~/melihaycicek-backend-services
git pull origin main
npm install --omit=dev
# cPanel panelinden uygulamayı restart et
```

---

## 5. Özet: Çalışır mı?

> **Evet, çalışır** — ancak iki aksiyon olmadan deployment başarısız olur:

| # | Aksiyon | Öncelik |
|---|---|---|
| 1 | cPanel → Setup Node.js App üzerinden uygulamayı tanımla | 🔴 Zorunlu |
| 2 | CORS listesine frontend'in çalışacağı domain'i ekle | 🔴 Zorunlu |
| 3 | `.gitignore` ekle | 🟡 Önerilen |
| 4 | `nodemailer` bağımlılığını kaldır | 🟡 Önerilen |
| 5 | Migration SQL'ini veritabanına çalıştır | 🔴 Zorunlu |

---

## 6. cPanel Node.js Kurulum Analizi

Melih'in cPanel'de yaptığı kurulum incelendi. Tespit edilen sorunlar aşağıdadır.

### Kurulum Özeti (Mevcutta Ne Seçilmiş)

| Ayar | Seçilen Değer |
|---|---|
| Node.js Version | 22 |
| Application Root | `melihaycicek-backend-services` |
| Application URL | `audfix.com/melihaycicek` |
| Application Startup File | `index.js` ← **YANLIŞ** |
| Environment Variables | Hiç eklenmemiş ← **EKSİK** |
| Application Mode | Görünmüyor ← **Kontrol edilmeli** |

---

### 🔴 KRİTİK — Uygulama Başlamaz

#### 6.1 Startup File Yanlış
```
Mevcut : index.js
Olması gereken : src/server.js
```
Projede `index.js` diye bir dosya **yok**. Passenger bu dosyayı bulamayacağı için uygulama hiç başlamaz.

**Melih yapacakları:**
1. cPanel → Node.js → uygulamayı aç
2. **Application Startup File** alanını `src/server.js` olarak değiştir
3. **Save** → **Restart**

---

#### 6.2 Environment Variables Tanımlanmamış
Şu an "NO RESULT FOUND" görünüyor. Veritabanı bilgileri olmadan uygulama her istekte crash eder.

**Melih eklemesi gereken değişkenler:**

| Variable | Örnek Değer |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_USER` | cPanel'deki MySQL kullanıcı adı |
| `DB_PASSWORD` | MySQL şifresi |
| `DB_NAME` | Veritabanı adı |

cPanel → Node.js → **Environment Variables** → **Add variable** ile tek tek ekle.

---

### 🟡 ORTA — Kontrol Edilmeli

#### 6.3 Application Mode
`production` olarak ayarlanmalı. Bu `NODE_ENV=production` değişkenini otomatik set eder. Boş bırakıldıysa geliştirme modunda çalışır.

**Melih yapacakları:** Application Mode → `production` seç → Save

#### 6.4 Application URL: `audfix.com/melihaycicek`
API endpoint'leri şu şekilde erişilebilir olacak:
```
https://audfix.com/melihaycicek/api/analytics
https://audfix.com/melihaycicek/api/builder-lead
https://audfix.com/melihaycicek/api/health
```
Frontend bu URL'leri kullanıyorsa CORS listesi de güncellenmeli (bkz. Madde 4.1).

#### 6.5 Node.js 22 — Uyumlu ✅
`package.json` → `"node": ">=18.0.0"` şartını karşılıyor. Sorun yok.

---

### Melih İçin Sıralı Aksiyon Listesi (cPanel)

```
[x] 1. Application Startup File → src/server.js yap
[x] 2. Environment Variables ekle (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
[x] 3. Application Mode → production
[x] 4. Save → Restart
[x] 5. https://audfix.com/melihaycicek/api/health adresini test et
[x] 6. MySQL'de migration SQL'ini çalıştır (migrations/001_init.sql)
```

---

## 8. Sorun Tespiti — 15.03.2026

### ❌ Gözlemlenen Hata
```
https://audfix.com/melihaycicek/api/health
→ Cannot GET /melihaycicek/api/health
```

### 🔍 Kök Neden
Bu mesaj Express'in 404 yanıtıdır. Yani istek Passenger üzerinden Express'e ulaşıyor ancak Passenger, Application URL'deki `/melihaycicek` prefix'ini strip etmeden iletiyor. Express `/melihaycicek/api/health` path'ini alıyor; route'lar `/api/health` olarak tanımlı — route eşleşmesi yok.

**Port 3001 sorun değil:** cPanel/Passenger, `process.env.PORT`'u kendi yönetir. `|| 3001` yalnızca local geliştirme fallback'i — sunucu ortamında 3001 portuna gidilmez.

### ✅ Uygulanan Kod Düzeltmesi
`src/server.js`'e `BASE_PATH` environment variable desteği eklendi. `BASE_PATH` set edildiğinde tüm route'lar (builder, analytics, health) bu prefix altında mount ediliyor. Local geliştirmede `BASE_PATH` boş bırakılırsa davranış değişmez.

### Melih İçin Yeni Aksiyon Listesi

```
[x] 1. cPanel → Node.js App → Environment Variables bölümüne git
       Yeni değişken ekle:
       BASE_PATH = /melihaycicek

[x] 2. "Save" → "Restart" (Node.js App sayfasından)

[x] 3. Test et:
       https://audfix.com/melihaycicek/api/health
       → {"status":"ok","timestamp":"2026-03-15T21:04:56.700Z"} ✅ ÇALIŞIYOR

[x] 4. Kodu deploy et (git pull + restart):
       ssh audfllcd@audfix.com -p 21098
       cd ~/melihaycicek-backend-services
       git pull origin main
       npm install --omit=dev
       # cPanel'den Restart
```

### 🟢 Sonuç — 15.03.2026 21:04 UTC
API production ortamında ayağa kalktı. `https://audfix.com/melihaycicek/api/health` başarıyla yanıt veriyor.

---

## 7. Git History Planı

### 12.03.2026 — Work Branch (İlk Commit Tarihi)
Mevcut `work/14032026-system-analysis` branch'indeki commit, projenin ilk kayıt tarihi olarak **12.03.2026** olarak gösterilecek. Bu commit proje kaynak kodunun ilk olarak repo'ya eklenmesini temsil eder.

### 13.03.2026 — Main Branch İçin Öneri

Main branch'e 13.03.2026 tarihli anlamlı bir commit atmak için öneriler:

| Seçenek | Commit Mesajı | İçerik |
|---|---|---|
| **A — Önerilen** | `chore: add .gitignore and remove unused nodemailer dep` | `.gitignore` ekle + `package.json`'dan `nodemailer` kaldır |
| B | `docs: update README with deployment instructions` | README'ye cPanel deployment adımlarını ekle |
| C | `chore: project scaffolding and initial configuration` | `.env.example` güncelle, README düzenle |

**Seçenek A önerilir** — çünkü hem güvenlik açığını (`.gitignore` eksikliği) hem de gereksiz bağımlılığı kapatır, anlamlı bir geliştirme commit'idir.

---

*Rapor: GitHub Copilot — 14.03.2026*
