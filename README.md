# OnePage SaaS Starter (Next.js 14 + Supabase + Stripe)

Mobil-öncelikli, **tek sayfa** üreten ve **6 saatte bir LLM** güncellemesi alan PWA.

## Özellikler

✨ **Tek Sayfa Odaklı**: Her kullanıcı için özel bir sayfa
🤖 **AI Güncelleme**: 6 saatte bir otomatik içerik yenileme
📱 **QR Kod Paylaşımı**: Kolay paylaşım için QR kod üretimi
🔐 **Güvenli**: Supabase RLS + HMAC imzalı claim sistemi
💳 **Stripe Entegrasyonu**: Monthly/Yearly/Lifetime planlar
🌍 **Çoklu Dil**: EN/TR/ES desteği

- **Next.js 14 (App Router, TS, RSC)**
- **Supabase (Auth/DB/Storage/Edge Functions/Cron)**
- **Stripe Checkout + Customer Portal**
- **Tag-based Revalidation** + PWA + minimal shadcn stil
- **QR/NFC claim** akışı için Edge Function örnekleri

## Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Geliştirme sunucusunu başlat
npm run dev
```

> Detaylı kurulum ve dağıtım talimatları aşağıda.

## Veri Modeli & RLS
SQL migrasyonları `supabase/migrations/0001_init.sql` içinde. RLS açık ve politikalar örneklenmiştir.

## Önemli Akışlar
- `/` OnePage landing + planlar
- `/dashboard` plan/kota ve "Sayfanı oluştur" formu
- `/u/[username]` herkese açık sayfa (ISR + tag revalidate)
- `/c/[claimCode]` NFC/QR claim
- `/api/revalidate` Bearer token zorunlu
- `/api/qrcode` QR üretir ve Supabase Storage'a kaydeder
- `/api/checkout` Stripe Checkout başlatır

## Geliştirme
```bash
npm install   # veya pnpm i / yarn
cp .env.example .env.local
npm run dev
```

## Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da `supabase/migrations/0001_init.sql` dosyasını çalıştırın
4. `.env.local` dosyasına Supabase URL ve anahtarları ekleyin

## Dağıtım (Özet)
- Vercel: repo'yu bağlayın, env'leri girin.
- Supabase: migrasyonları çalıştırın, Edge Functions'ı deploy edin; cron `*/360 * * * *` → `llm-refresh`.
- Stripe: tek ürün ve 3 fiyat oluşturun; webhook → `https://<project-ref>.functions.supabase.co/stripe-webhook`.

## Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:ui
```

## Güvenlik Notları
- LLM anahtarı sadece server/edge tarafında; client'tan LLM çağrısı yok.
- `/api/revalidate` için `REVALIDATE_TOKEN` zorunlu ve IP allowlist tavsiye edilir.
- RLS ihlali testleri için e2e senaryosu `tests/e2e/basic.spec.ts`.