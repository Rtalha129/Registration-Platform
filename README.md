# EventFlow — Next.js & Supabase Event Registration Platform

A production-ready event management and attendee registration platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row-Level Security)**.

---

## 🚀 Key Features

- **Role-Based Access Control (RBAC)**: Dedicated authenticated sessions for **Event Organizers** to manage events, ticket sales, attendee forms, and live door check-ins.
- **Dynamic JSONB Registration Engine**: Organizers can customize attendee survey questions (Text, Number, Select dropdown, Checkbox, Textarea) stored in PostgreSQL `JSONB`.
- **Integrated Ticket Pricing in Cents**: Integer pricing (`ticket_price` in cents, e.g., `14900` = `$149.00`) with multi-currency support and free ticket handling.
- **Instant Digital Ticket Passes**: Issues unique UUID `check_in_token` badges with QR codes for attendees upon registration.
- **Live Check-in Desk**: Real-time scanner and attendee manager with instant token lookup, door check-in toggling, and timestamp recording (`checked_in_at`).
- **Supabase SSR Client & Evaluation Fallback**: Out-of-the-box support for both live Supabase projects and immediate local testing via pre-seeded organizer accounts.

---

## 🗄️ Database Schema & Relations

### 1. `users`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `UUID` | Primary Key, references `auth.users(id) ON DELETE CASCADE` |
| `email` | `TEXT` | `NOT NULL UNIQUE` |
| `name` | `TEXT` | Organizer's display name |
| `role` | `TEXT` | Default `'organizer'`, check `IN ('organizer', 'attendee', 'admin')` |
| `created_at` | `TIMESTAMPTZ` | Default `timezone('utc', now())` |

### 2. `events`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `UUID` | Primary Key, default `gen_random_uuid()` |
| `user_id` | `UUID` | Foreign Key references `public.users(id) ON DELETE CASCADE` |
| `title` | `TEXT` | Event title (`NOT NULL`) |
| `description` | `TEXT` | Detailed agenda and event overview |
| `custom_fields` | `JSONB` | Array of dynamic attendee field objects |
| `ticket_price` | `INTEGER` | Price in **cents** (e.g. `2500` for `$25.00`, `0` for free) |
| `currency` | `TEXT` | Currency code (`'USD'`, `'EUR'`, `'GBP'`) |
| `email_template` | `TEXT` | Custom confirmation email template with tags |
| `created_at` | `TIMESTAMPTZ` | Default `timezone('utc', now())` |

### 3. `registrations`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `UUID` | Primary Key, default `gen_random_uuid()` |
| `event_id` | `UUID` | Foreign Key references `public.events(id) ON DELETE CASCADE` |
| `attendee_name` | `TEXT` | Full name of registrant |
| `attendee_email` | `TEXT` | Email of registrant |
| `form_data` | `JSONB` | Key-value responses to organizer's `custom_fields` |
| `payment_status` | `TEXT` | Check `IN ('free', 'pending', 'paid')` |
| `stripe_payment_id` | `TEXT` | Stripe transaction / charge reference |
| `check_in_token` | `UUID` | Unique token pass for door check-in |
| `is_checked_in` | `BOOLEAN` | Default `false` |
| `checked_in_at` | `TIMESTAMPTZ` | Timestamp when checked in (updated by trigger / API) |
| `created_at` | `TIMESTAMPTZ` | Default `timezone('utc', now())` |

---

## 🔒 Row-Level Security (RLS) Policies

All tables have **Row-Level Security** enabled:
- **`users`**: Users can view and edit their own profiles (`auth.uid() = id`).
- **`events`**: Public can view all published events (`SELECT USING (true)`). Organizers can create, update, and delete events they own (`user_id = auth.uid() AND role IN ('organizer', 'admin')`).
- **`registrations`**: Organizers can view and check-in attendees for events they own (`events.user_id = auth.uid()`). Public can register for any published event. Attendees can view their registration via ticket pass token.

---

## 📦 Directory Structure

```
├── supabase/
│   ├── migrations/
│   │   └── 20261026000000_create_event_platform_schema.sql  # DDL, triggers, and RLS policies
│   └── seed.sql                                             # Realistic seed data (events & attendees)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Organizer login + 1-click evaluation switchers
│   │   │   └── signup/page.tsx              # Organizer registration
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                   # Route protection for Event Organizers
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                 # Overview stats & event cards
│   │   │       ├── events/new/page.tsx      # Create event with dynamic JSONB field builder
│   │   │       └── events/[id]/page.tsx     # Organizer Live Check-in Desk
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       ├── page.tsx                 # Public registration form
│   │   │       └── success/page.tsx         # Digital ticket pass confirmation
│   │   ├── api/
│   │   │   ├── auth/demo-login/route.ts     # Fast test session switcher
│   │   │   ├── auth/signout/route.ts        # Sign out handler
│   │   │   ├── events/route.ts              # Events CRUD API
│   │   │   ├── registrations/route.ts       # Attendee registration API
│   │   │   └── check-in/route.ts            # Live check-in scanner API
│   │   ├── layout.tsx                       # Root layout with navbar & footer
│   │   └── page.tsx                         # Landing page with events showcase
│   ├── components/
│   │   ├── dashboard/                       # Stats cards, check-in scanner, dynamic field builder
│   │   ├── events/                          # Registration form and ticket pass badge
│   │   ├── layout/                          # Navbar and footer
│   │   └── ui/                              # Buttons, badges, cards, inputs
│   ├── lib/
│   │   ├── auth.ts                          # Server-side organizer session validation
│   │   ├── utils.ts                         # Currency formatting (cents to $), dates, cn()
│   │   └── supabase/
│   │       ├── client.ts                    # Supabase browser client
│   │       ├── server.ts                    # Supabase SSR server client
│   │       ├── middleware.ts                # Session refresh & route guard
│   │       └── mock-store.ts                # In-memory store initialized with seed data
│   ├── types/
│   │   ├── database.types.ts                # Full Supabase typed schema
│   │   └── models.ts                        # Domain interfaces, Zod validation schemas
│   └── middleware.ts                        # Next.js session middleware
```

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the template and configure your keys (or use the built-in development credentials):
```bash
cp .env.example .env.local
```

### 3. Run Migrations & Seeds
If using Supabase CLI:
```bash
supabase db reset
# Or directly apply supabase/migrations/20261026000000_create_event_platform_schema.sql
# and supabase/seed.sql in your Supabase SQL editor
```

### 4. Start the Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Click **"Demo Organizer"** in the top navigation to immediately log in as an Event Organizer and explore the full dashboard!
