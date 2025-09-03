# OnePage SaaS Starter (Next.js 14 + Supabase + Stripe)

Mobil-öncelikli, **tek sayfa** üreten ve **6 saatte bir LLM** güncellemesi alan PWA iskeleti.
- **Next.js 14 (App Router, TS, RSC)**
- **Supabase (Auth/DB/Storage/Edge Functions/Cron)**
- **Stripe Checkout + Customer Portal**
- **Tag-based Revalidation** + PWA + minimal shadcn stil
- **QR/NFC claim** akışı için Edge Function örnekleri

> Kurulum ve dağıtım talimatları bu README’nin sonunda.

## Veri Modeli & RLS
SQL migrasyonları `supabase/migrations/0001_init.sql` içinde. RLS açık ve politikalar örneklenmiştir.

## Önemli Akışlar
- `/` OnePage landing + planlar
- `/dashboard` plan/kota ve “Sayfanı oluştur” formu
- `/u/[username]` herkese açık sayfa (ISR + tag revalidate)
- `/c/[claimCode]` NFC/QR claim
- `/api/revalidate` Bearer token zorunlu
- `/api/qrcode` QR üretir ve Supabase Storage’a kaydeder
- `/api/checkout` Stripe Checkout başlatır

## Geliştirme
```bash
pnpm i   # veya npm i / yarn
cp .env.example .env.local
pnpm dev
```

## Dağıtım (Özet)
- Vercel: repo’yu bağlayın, env’leri girin.
- Supabase: migrasyonları çalıştırın, Edge Functions’ı deploy edin; cron `*/360 * * * *` → `llm-refresh`.
- Stripe: tek ürün ve 3 fiyat oluşturun; webhook → `https://<project-ref>.functions.supabase.co/stripe-webhook`.

## Güvenlik Notları
- LLM anahtarı sadece server/edge tarafında; client’tan LLM çağrısı yok.
- `/api/revalidate` için `REVALIDATE_TOKEN` zorunlu ve IP allowlist tavsiye edilir.
- RLS ihlali testleri için e2e senaryosu `tests/e2e/basic.spec.ts`.
