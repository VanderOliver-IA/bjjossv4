-- ====================================================================
-- SEED DATA - FULL DEMO ENVIRONMENT
-- Creates 3 CTs, Real Users (Auth+Profiles), Classes, Students, Products
-- Password for all users: 123456
-- ====================================================================

-- Enable pgcrypto for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create CTs
INSERT INTO public.cts (id, name, slug, subscription, features, active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brasília BJJ Central', 'brasilia-bjj', 'enterprise', '{"crm": true, "financeiro": true, "gestao_alunos": true}', true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Alliance Jardins', 'alliance-jardins', 'premium', '{"crm": true, "financeiro": true}', true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Gracie Barra Sul', 'gb-sul', 'standard', '{"gestao_alunos": true}', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Helper to Create User (This is a simplified representation of auth.users insertion)
-- NOTE: In a real Supabase migration via CLI, we can insert into auth.users.
-- We will insert predefined UUIDs to link profiles easily.

DO $$
DECLARE
    ct_bsb UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    ct_all UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    ct_gb  UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    
    -- User IDs
    uid_super      UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380s00';
    
    uid_admin_bsb  UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    uid_prof_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380p11';
    uid_desk_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11';
    uid_stud_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380u11';

    uid_admin_all  UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    uid_prof_all   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380p22';
    uid_desk_all   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22';
    
    uid_admin_gb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    
    hashed_pw      TEXT := crypt('123456', gen_salt('bf'));
BEGIN

    -- 2.1 Insert Auth Users (Idempotent)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
    VALUES 
    -- Super Admin
    (uid_super, '00000000-0000-0000-0000-000000000000', 'super@bjjoss.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Super Admin Global"}', now(), now(), 'authenticated', true),
    
    -- CT Brasilia Users
    (uid_admin_bsb, '00000000-0000-0000-0000-000000000000', 'admin@brasilia.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Mestre Ricardo Silva"}', now(), now(), 'authenticated', false),
    (uid_prof_bsb, '00000000-0000-0000-0000-000000000000', 'prof@brasilia.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Prof. Rodrigo Santos"}', now(), now(), 'authenticated', false),
    (uid_desk_bsb, '00000000-0000-0000-0000-000000000000', 'atendente@brasilia.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Maria Cantina"}', now(), now(), 'authenticated', false),
    (uid_stud_bsb, '00000000-0000-0000-0000-000000000000', 'aluno@brasilia.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "João Aluno"}', now(), now(), 'authenticated', false),
    
    -- CT Alliance Users
    (uid_admin_all, '00000000-0000-0000-0000-000000000000', 'admin@alliance.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Mestre Fabio Gurgel"}', now(), now(), 'authenticated', false),
    (uid_prof_all, '00000000-0000-0000-0000-000000000000', 'prof@alliance.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Prof. Lucas Lepri"}', now(), now(), 'authenticated', false),
    
    -- CT GB Users
    (uid_admin_gb, '00000000-0000-0000-0000-000000000000', 'admin@gb.com', hashed_pw, now(), '{"provider": "email", "providers": ["email"]}', '{"name": "Mestre Carlos Jr"}', now(), now(), 'authenticated', false)
    
    ON CONFLICT (id) DO NOTHING;

    -- 2.2 Insert Profiles (Linked to Auth Users)
    INSERT INTO public.profiles (id, user_id, ct_id, name, email, photo_url) VALUES
    (uid_super, uid_super, NULL, 'Super Admin Global', 'super@bjjoss.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Super'),
    
    (uid_admin_bsb, uid_admin_bsb, ct_bsb, 'Mestre Ricardo Silva', 'admin@brasilia.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Ricardo'),
    (uid_prof_bsb, uid_prof_bsb, ct_bsb, 'Prof. Rodrigo Santos', 'prof@brasilia.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Rodrigo'),
    (uid_desk_bsb, uid_desk_bsb, ct_bsb, 'Maria Cantina', 'atendente@brasilia.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Maria'),
    (uid_stud_bsb, uid_stud_bsb, ct_bsb, 'João Aluno', 'aluno@brasilia.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Joao'),
    
    (uid_admin_all, uid_admin_all, ct_all, 'Mestre Fabio Gurgel', 'admin@alliance.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Fabio'),
    (uid_prof_all, uid_prof_all, ct_all, 'Prof. Lucas Lepri', 'prof@alliance.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Lucas'),
    
    (uid_admin_gb, uid_admin_gb, ct_gb, 'Mestre Carlos Jr', 'admin@gb.com', 'https://api.dicebear.com/9.x/dylan/svg?seed=Carlos')
    ON CONFLICT (id) DO NOTHING;

    -- 2.3 Insert User Roles
    INSERT INTO public.user_roles (user_id, role) VALUES
    (uid_super, 'super_admin'),
    (uid_admin_bsb, 'admin_ct'),
    (uid_prof_bsb, 'professor'),
    (uid_desk_bsb, 'atendente'),
    (uid_stud_bsb, 'aluno'),
    (uid_admin_all, 'admin_ct'),
    (uid_prof_all, 'professor'),
    (uid_admin_gb, 'admin_ct')
    ON CONFLICT DO NOTHING;

    -- 2.4 Insert Classes (Turmas)
    INSERT INTO public.training_classes (id, ct_id, professor_id, name, description, days, time_start, time_end, sport, level) VALUES
    -- Brasilia Classes
    (gen_random_uuid(), ct_bsb, uid_prof_bsb, 'Jiu Jitsu Manhã', 'Treino técnico e rola', '{1,3,5}', '07:00', '08:30', 'jiu_jitsu', 'todos'),
    (gen_random_uuid(), ct_bsb, uid_prof_bsb, 'No-Gi Submission', 'Sem kimono', '{2,4}', '19:00', '20:30', 'submission', 'intermediario'),
    (gen_random_uuid(), ct_bsb, uid_prof_bsb, 'Fundamentos Adulto', 'Base e defesa pessoal', '{1,3,5}', '18:00', '19:00', 'jiu_jitsu', 'iniciante'),
    (gen_random_uuid(), ct_bsb, uid_admin_bsb, 'Competição Pro', 'Treino de alta intensidade', '{6}', '10:00', '12:00', 'jiu_jitsu', 'avancado'),
    -- Alliance Classes
    (gen_random_uuid(), ct_all, uid_prof_all, 'Advanced Guard', 'Técnicas de guarda moderna', '{2,4}', '12:00', '13:30', 'jiu_jitsu', 'avancado'),
    (gen_random_uuid(), ct_all, uid_prof_all, 'Executivo Manhã', 'Treino rápido para executivos', '{1,3,5}', '06:00', '07:00', 'jiu_jitsu', 'todos');

    -- 2.5 Insert Products (Cantina)
    INSERT INTO public.products (ct_id, name, description, price, stock_quantity, category, image_url) VALUES
    (ct_bsb, 'Açaí 500ml', 'Açaí puro com granola', 25.00, 50, 'alimentacao', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80'),
    (ct_bsb, 'Água Mineral', '500ml Sem Gás', 5.00, 100, 'bebidas', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80'),
    (ct_bsb, 'Kimono Oficial BjjOss', 'Kimono trançado branco', 450.00, 10, 'equipamentos', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80'),
    (ct_bsb, 'Energético Monster', 'Lata 473ml', 15.00, 30, 'bebidas', NULL);
    
    -- 2.6 Seed Students (Create 15 random students for BSB)
    -- This is a simplified loop to create bulk students
    FOR i IN 1..15 LOOP
        INSERT INTO public.students (ct_id, name, email, phone, status, graduation_level)
        VALUES (
            ct_bsb, 
            'Aluno ' || i, 
            'aluno' || i || '@bsb.com', 
            '619999999' || i, 
            'ativo', 
            CASE (floor(random() * 5))::int 
                WHEN 0 THEN 'branca' 
                WHEN 1 THEN 'azul' 
                WHEN 2 THEN 'roxa' 
                WHEN 3 THEN 'marrom' 
                ELSE 'preta' 
            END
        );
    END LOOP;

END $$;
