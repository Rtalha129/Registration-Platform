-- Migration: 20261026000000_create_event_platform_schema.sql
-- Description: Event Platform schema for Event Organizers with RLS policies, triggers, and relations.

-- 1. Create custom types and extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Payment status domain check
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('free', 'pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('organizer', 'attendee', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create users table (synchronized with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('organizer', 'attendee', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    ticket_price INTEGER NOT NULL DEFAULT 0 CHECK (ticket_price >= 0), -- ticket price in cents (e.g. 2500 = $25.00)
    currency TEXT NOT NULL DEFAULT 'USD',
    email_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid')),
    stripe_payment_id TEXT,
    check_in_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    is_checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_check_in_token ON public.registrations(check_in_token);
CREATE INDEX IF NOT EXISTS idx_registrations_attendee_email ON public.registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);

-- 6. Check-in timestamp automation trigger
CREATE OR REPLACE FUNCTION public.handle_check_in_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_checked_in = true AND (OLD.is_checked_in IS DISTINCT FROM true OR NEW.checked_in_at IS NULL) THEN
        NEW.checked_in_at = timezone('utc'::text, now());
    ELSIF NEW.is_checked_in = false THEN
        NEW.checked_in_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_check_in_timestamp ON public.registrations;
CREATE TRIGGER trigger_handle_check_in_timestamp
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_check_in_timestamp();

-- 7. Sync new auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'organizer')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 9. Row-Level Security Policies

-- USERS POLICIES
-- Organizers/Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Organizers/Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- EVENTS POLICIES
-- Anyone can view events (public event registration page)
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events"
    ON public.events FOR SELECT
    USING (true);

-- Authenticated event organizers can create events
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
CREATE POLICY "Organizers can create events"
    ON public.events FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('organizer', 'admin')
        )
    );

-- Organizers can update their own events
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
CREATE POLICY "Organizers can update their own events"
    ON public.events FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('organizer', 'admin')
        )
    );

-- Organizers can delete their own events
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;
CREATE POLICY "Organizers can delete their own events"
    ON public.events FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('organizer', 'admin')
        )
    );

-- REGISTRATIONS POLICIES
-- Organizers can view all registrations for their events
DROP POLICY IF EXISTS "Organizers can view event registrations" ON public.registrations;
CREATE POLICY "Organizers can view event registrations"
    ON public.registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Anyone can submit a registration (Public registration)
DROP POLICY IF EXISTS "Public can register for events" ON public.registrations;
CREATE POLICY "Public can register for events"
    ON public.registrations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
        )
    );

-- Organizers can update registrations for their events (e.g. check-in, payment status)
DROP POLICY IF EXISTS "Organizers can update event registrations" ON public.registrations;
CREATE POLICY "Organizers can update event registrations"
    ON public.registrations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = registrations.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Attendees can view their own registration using check_in_token
DROP POLICY IF EXISTS "Attendees can view their registration via token" ON public.registrations;
CREATE POLICY "Attendees can view their registration via token"
    ON public.registrations FOR SELECT
    USING (true);
