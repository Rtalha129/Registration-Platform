-- Seed Migration: Initial sample data for Event Organizers, Events, and Registrations
-- Can be executed via Supabase CLI (`supabase db reset` or `supabase db seed`) or directly in PostgreSQL

-- 1. Create Mock Organizer Auth Users in auth.users if not present
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
    (
        'a1111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000000',
        'organizer@eventflow.dev',
        crypt('OrganizerPass123!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Sarah Connor (Lead Organizer)","role":"organizer"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000000',
        'alex.chen@innovateconf.io',
        crypt('OrganizerPass123!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Alex Chen","role":"organizer"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure public.users are populated
INSERT INTO public.users (id, email, name, role, created_at)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'organizer@eventflow.dev',
        'Sarah Connor (Lead Organizer)',
        'organizer',
        now() - INTERVAL '30 days'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        'alex.chen@innovateconf.io',
        'Alex Chen',
        'organizer',
        now() - INTERVAL '15 days'
    )
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- 3. Seed Events
INSERT INTO public.events (id, user_id, title, description, custom_fields, ticket_price, currency, email_template, created_at)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'Global AI & Agentic Systems Summit 2027',
        'Join 500+ top engineering leaders, autonomous agent researchers, and systems architects for keynotes, workshops, and high-impact networking in San Francisco & online.',
        '[
            {"id": "company", "label": "Company / Organization", "type": "text", "required": true},
            {"id": "role_title", "label": "Job Title", "type": "text", "required": true},
            {"id": "tshirt_size", "label": "T-Shirt Size", "type": "select", "options": ["S", "M", "L", "XL", "2XL"], "required": true},
            {"id": "dietary_needs", "label": "Dietary Restrictions", "type": "text", "required": false},
            {"id": "github_handle", "label": "GitHub Profile / Handle", "type": "text", "required": false}
        ]'::jsonb,
        14900, -- $149.00 USD
        'USD',
        'Hi {{attendee_name}},\n\nYour registration for {{event_title}} is confirmed!\n\nYour check-in badge token is: {{check_in_token}}\nPlease present the QR code / token at the door.\n\nSee you there!\nEventFlow Team',
        now() - INTERVAL '14 days'
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'a1111111-1111-1111-1111-111111111111',
        'Modern Next.js & React 19 Architecture Masterclass',
        'A comprehensive deep dive into Server Components, Server Actions, Edge Streaming, and high-performance Web apps with hands-on labs.',
        '[
            {"id": "experience_years", "label": "Years of React Experience", "type": "select", "options": ["<1 year", "1-3 years", "3-5 years", "5+ years"], "required": true},
            {"id": "operating_system", "label": "Preferred OS for Workshop", "type": "select", "options": ["macOS", "Linux", "Windows / WSL"], "required": true}
        ]'::jsonb,
        4900, -- $49.00 USD
        'USD',
        'Welcome {{attendee_name}},\n\nGet ready for the Masterclass! Access links and setup repository instructions are inside.\nTicket Token: {{check_in_token}}',
        now() - INTERVAL '7 days'
    ),
    (
        'e3333333-3333-3333-3333-333333333333',
        'a1111111-1111-1111-1111-111111111111',
        'Open Source Community Hackathon & Demo Day',
        'A free 48-hour open hackathon focused on developer tooling and local AI models. Cash prizes, mentorship, and free catered meals provided.',
        '[
            {"id": "team_name", "label": "Team Name (if participating with team)", "type": "text", "required": false},
            {"id": "discord_tag", "label": "Discord Tag", "type": "text", "required": true},
            {"id": "project_idea", "label": "Proposed Project Summary", "type": "textarea", "required": false}
        ]'::jsonb,
        0, -- Free
        'USD',
        'Hey {{attendee_name}},\n\nYou are signed up for the Open Source Hackathon! Join our Discord channel with token: {{check_in_token}} to find teammates.',
        now() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Registrations for Event 1 (AI Summit)
INSERT INTO public.registrations (id, event_id, attendee_name, attendee_email, form_data, payment_status, stripe_payment_id, check_in_token, is_checked_in, checked_in_at, created_at)
VALUES
    (
        'r1111111-1111-1111-1111-111111111111',
        'e1111111-1111-1111-1111-111111111111',
        'Elena Rostova',
        'elena.rostova@deepkernel.ai',
        '{"company": "DeepKernel Systems", "role_title": "Principal AI Engineer", "tshirt_size": "M", "dietary_needs": "Vegetarian", "github_handle": "erostova"}'::jsonb,
        'paid',
        'ch_3M4qL82eZvKYlo2C1g9XxYzA',
        'c1000000-0000-0000-0000-000000000001',
        true,
        now() - INTERVAL '2 hours',
        now() - INTERVAL '10 days'
    ),
    (
        'r2222222-2222-2222-2222-222222222222',
        'e1111111-1111-1111-1111-111111111111',
        'Marcus Vance',
        'mvance@hypercloud.io',
        '{"company": "HyperCloud Labs", "role_title": "VP of Engineering", "tshirt_size": "L", "dietary_needs": "None", "github_handle": "mvance-hyper"}'::jsonb,
        'paid',
        'ch_3M4qL82eZvKYlo2C2h0YyZ1B',
        'c2000000-0000-0000-0000-000000000002',
        true,
        now() - INTERVAL '45 minutes',
        now() - INTERVAL '8 days'
    ),
    (
        'r3333333-3333-3333-3333-333333333333',
        'e1111111-1111-1111-1111-111111111111',
        'David Thorne',
        'dthorne@synthetics.tech',
        '{"company": "Synthetic Robotics", "role_title": "Lead Software Architect", "tshirt_size": "XL", "dietary_needs": "Gluten-Free", "github_handle": "dthorne-dev"}'::jsonb,
        'paid',
        'ch_3M4qL82eZvKYlo2C3i1ZzZ2C',
        'c3000000-0000-0000-0000-000000000003',
        false,
        null,
        now() - INTERVAL '5 days'
    ),
    (
        'r4444444-4444-4444-4444-444444444444',
        'e1111111-1111-1111-1111-111111111111',
        'Sophia Liang',
        'sliang@fintech-matrix.com',
        '{"company": "Matrix Capital", "role_title": "Data Scientist", "tshirt_size": "S", "dietary_needs": "None", "github_handle": "sophial-ai"}'::jsonb,
        'pending',
        'ch_3M4qL82eZvKYlo2C4j2AaA3D',
        'c4000000-0000-0000-0000-000000000004',
        false,
        null,
        now() - INTERVAL '1 day'
    ),
    -- Seed Registrations for Event 3 (Free Hackathon)
    (
        'r5555555-5555-5555-5555-555555555555',
        'e3333333-3333-3333-3333-333333333333',
        'Jordan Rivera',
        'jordan@codecraft.org',
        '{"team_name": "AgentForge", "discord_tag": "jordan_r#4401", "project_idea": "Multi-agent autonomous QA pipeline"}'::jsonb,
        'free',
        null,
        'c5000000-0000-0000-0000-000000000005',
        true,
        now() - INTERVAL '15 minutes',
        now() - INTERVAL '2 days'
    ),
    (
        'r6666666-6666-6666-6666-666666666666',
        'e3333333-3333-3333-3333-333333333333',
        'Amara Patel',
        'amara.patel@nexusbuild.io',
        '{"team_name": "CyberPulse", "discord_tag": "amara_p#8820", "project_idea": "Decentralized event verification with zero-knowledge proofs"}'::jsonb,
        'free',
        null,
        'c6000000-0000-0000-0000-000000000006',
        false,
        null,
        now() - INTERVAL '12 hours'
    )
ON CONFLICT (id) DO NOTHING;
