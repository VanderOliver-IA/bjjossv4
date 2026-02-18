-- ====================================================================
-- STRESS SEED SCRIPT - POPULATE GRAPHS AND DASHBOARDS
-- ====================================================================

DO $$
DECLARE
    ct_bsb UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    uid_admin_bsb  UUID := 'd0eebc99-2222-4ef8-bb6d-6bb9bd380a11';
    uid_prof_bsb   UUID := 'd0eebc99-3333-4ef8-bb6d-6bb9bd380e11';
    
    i INTEGER;
    v_date DATE;
    v_amount DECIMAL;
    v_type TEXT;
    v_cat TEXT;
BEGIN
    console_log('Iniciando Injeção de dados de stress...');

    -- 1. Injetar Transações Financeiras (Últimos 6 meses)
    FOR i IN 1..150 LOOP
        v_date := CURRENT_DATE - (random() * 180)::int; -- Datas aleatórias nos últimos 180 dias
        
        IF random() > 0.3 THEN
            v_type := 'receita';
            v_amount := (random() * 200 + 50)::decimal(10,2);
            v_cat := (ARRAY['mensalidade', 'venda_produto', 'evento'])[floor(random() * 3 + 1)];
        ELSE
            v_type := 'despesa';
            v_amount := (random() * 500 + 100)::decimal(10,2);
            v_cat := (ARRAY['aluguel', 'limpeza', 'marketing', 'manutencao'])[floor(random() * 4 + 1)];
        END IF;

        INSERT INTO public.financial_transactions (ct_id, type, category, amount, description, date, status, payment_method, created_by)
        VALUES (ct_bsb, v_type, v_cat, v_amount, 'Lançamento Automático Audit ' || i, v_date, 'concluido', 
               (ARRAY['pix', 'dinheiro', 'cartao_credito'])[floor(random() * 3 + 1)]::payment_method, uid_admin_bsb);
    END LOOP;

    -- 2. Injetar Alunos (Massa Crítica)
    FOR i IN 1..60 LOOP
        INSERT INTO public.students (ct_id, name, email, status, graduation_level, created_at)
        VALUES (ct_bsb, 'Aluno Audit ' || i, 'aluno' || i || '@test.com', 
               (ARRAY['ativo', 'ativo', 'ativo', 'inativo', 'pendente'])[floor(random() * 5 + 1)],
               (ARRAY['branca', 'azul', 'roxa', 'marrom', 'preta'])[floor(random() * 5 + 1)],
               CURRENT_TIMESTAMP - (random() * 365 * interval '1 day'));
    END LOOP;

    -- 3. Injetar Leads (Kanban Stress)
    FOR i IN 1..45 LOOP
        INSERT INTO public.leads (ct_id, name, status, source, value_potential, created_at)
        VALUES (ct_bsb, 'Lead Potencial ' || i, 
               (ARRAY['novo', 'contato', 'agendado', 'experimental', 'perdido'])[floor(random() * 5 + 1)]::lead_status,
               (ARRAY['instagram', 'facebook', 'indicacao', 'site'])[floor(random() * 4 + 1)],
               (random() * 300 + 100)::decimal(10,2),
               CURRENT_TIMESTAMP - (random() * 30 * interval '1 day'));
    END LOOP;

    -- 4. Injetar Histórico de Presença (Últimas 4 semanas)
    -- Primeiro cria registros de aula (attendance_records)
    FOR i IN 0..28 LOOP
        v_date := CURRENT_DATE - i;
        IF extract(dow from v_date) IN (1, 2, 3, 4, 5) THEN -- Dias de semana
            INSERT INTO public.attendance_records (ct_id, class_id, date, professor_id)
            SELECT ct_id, id, v_date, professor_id 
            FROM public.training_classes 
            WHERE ct_id = ct_bsb;
        END IF;
    END LOOP;

    -- Associa alunos aleatórios às presenças
    INSERT INTO public.attendance_students (attendance_id, student_id, status)
    SELECT ar.id, s.id, 'presente'
    FROM public.attendance_records ar
    CROSS JOIN LATERAL (
        SELECT id FROM public.students WHERE ct_id = ar.ct_id ORDER BY random() LIMIT 15
    ) s
    ON CONFLICT DO NOTHING;

END $$;
