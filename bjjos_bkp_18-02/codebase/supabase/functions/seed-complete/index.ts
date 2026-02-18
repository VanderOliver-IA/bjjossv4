import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateUUID(): string {
  return crypto.randomUUID();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log("Completing remaining seed data...");

    // Get existing CTs
    const { data: cts } = await supabaseAdmin.from("cts").select("id");
    const ctIds = cts?.map(ct => ct.id) || [];
    
    if (ctIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No CTs found. Run seed-test-data first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get students
    const { data: students } = await supabaseAdmin.from("students").select("id, ct_id, belt, stripes, enrollment_date");
    
    // Get profiles with ct_id
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, ct_id, email");
    
    const results: any = { leads: 0, events: 0, messages: 0, daily_cash: 0, graduations: 0 };

    // 1. Create Leads
    console.log("Creating leads...");
    const leadStatuses = ["novo", "contatado", "agendado", "experimental", "matriculado", "perdido"] as const;
    const leadSources = ["instagram", "facebook", "indicacao", "site", "outros"] as const;
    const leadNames = [
      "João Silva", "Maria Santos", "Carlos Oliveira", "Ana Costa", "Pedro Lima",
      "Juliana Ferreira", "Roberto Almeida", "Fernanda Gomes", "Ricardo Souza", "Patricia Nunes",
      "Lucas Martins", "Camila Rocha", "André Pereira", "Beatriz Campos", "Marcos Dias",
    ];

    for (const ctId of ctIds) {
      for (let i = 0; i < 10; i++) {
        const lead = {
          id: generateUUID(),
          ct_id: ctId,
          name: leadNames[i % leadNames.length] + ` ${i + 1}`,
          phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `lead${i + 1}_${ctId.substring(0, 4)}@email.com`,
          status: leadStatuses[Math.floor(Math.random() * leadStatuses.length)],
          source: leadSources[Math.floor(Math.random() * leadSources.length)],
          notes: ["Interessado em aulas", "Quer fazer aula experimental", "Indicação de aluno", "Viu no Instagram", "Pesquisou no Google"][Math.floor(Math.random() * 5)],
          last_contact: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        };

        const { error } = await supabaseAdmin.from("leads").insert(lead);
        if (!error) results.leads++;
      }
    }
    console.log(`Created ${results.leads} leads`);

    // 2. Create Events
    console.log("Creating events...");
    const eventTypes = ["graduacao", "campeonato", "interno", "seminario"] as const;
    const eventTitles = {
      graduacao: ["Cerimônia de Graduação", "Entrega de Faixas", "Graduação Semestral"],
      campeonato: ["Campeonato Interno", "Open de Jiu-Jitsu", "Copa Regional", "Torneio Kids"],
      interno: ["Treino Especial", "Roda de Treino", "Workshop Técnico", "Treino Livre"],
      seminario: ["Seminário com Mestre", "Aula Magna", "Workshop Especial", "Curso de Raspagens"],
    };

    for (const ctId of ctIds) {
      for (let i = 0; i < 6; i++) {
        const eventType = eventTypes[i % eventTypes.length];
        const titles = eventTitles[eventType];
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90) - 30);

        const event = {
          id: generateUUID(),
          ct_id: ctId,
          title: titles[Math.floor(Math.random() * titles.length)],
          type: eventType,
          date: eventDate.toISOString().split("T")[0],
          description: `Evento de ${eventType} organizado pela academia. Não perca!`,
          location: "Na própria academia",
          price: eventType === "seminario" ? 150 : eventType === "campeonato" ? 80 : 0,
        };

        const { data: eventData, error } = await supabaseAdmin.from("events").insert(event).select().single();
        if (!error && eventData) {
          results.events++;
          
          // Add some participants
          const ctStudents = students?.filter(s => s.ct_id === ctId) || [];
          const numParticipants = Math.floor(ctStudents.length * (0.3 + Math.random() * 0.4));
          const shuffled = ctStudents.sort(() => 0.5 - Math.random());
          
          for (const student of shuffled.slice(0, numParticipants)) {
            await supabaseAdmin.from("event_participants").insert({ 
              event_id: eventData.id, 
              student_id: student.id 
            });
          }
        }
      }
    }
    console.log(`Created ${results.events} events`);

    // 3. Create Messages
    console.log("Creating messages...");
    const messageSubjects = [
      "Aviso de Treino",
      "Confirmação de Matrícula",
      "Lembrete de Mensalidade",
      "Evento de Graduação",
      "Horários Alterados",
      "Boas-vindas à Academia",
      "Informativo Semanal",
      "Campeonato Próximo",
    ];
    const messageContents = [
      "Prezado aluno, gostaríamos de informar sobre as novidades da academia.",
      "Lembramos que sua mensalidade vence em breve. Por favor, regularize.",
      "Temos um evento especial programado. Não perca a oportunidade!",
      "Os horários de treino foram alterados. Confira os novos horários.",
      "Bem-vindo à nossa academia! Estamos felizes em tê-lo conosco.",
    ];

    for (const ctId of ctIds) {
      const ctProfiles = profiles?.filter(p => p.ct_id === ctId) || [];
      const adminProfile = ctProfiles.find(p => p.email?.includes("admin"));
      
      if (adminProfile) {
        for (const profile of ctProfiles) {
          if (profile.id !== adminProfile.id && Math.random() > 0.5) {
            const message = {
              id: generateUUID(),
              ct_id: ctId,
              from_profile_id: adminProfile.id,
              to_profile_id: profile.id,
              subject: messageSubjects[Math.floor(Math.random() * messageSubjects.length)],
              content: messageContents[Math.floor(Math.random() * messageContents.length)],
              read: Math.random() > 0.5,
            };

            const { error } = await supabaseAdmin.from("messages").insert(message);
            if (!error) results.messages++;
          }
        }
      }
    }
    console.log(`Created ${results.messages} messages`);

    // 4. Create Daily Cash
    console.log("Creating daily cash...");
    for (const ctId of ctIds) {
      for (let day = 1; day <= 14; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        if (date.getDay() === 0) continue;

        const openingBalance = 500 + Math.floor(Math.random() * 500);

        const dailyCash = {
          id: generateUUID(),
          ct_id: ctId,
          date: date.toISOString().split("T")[0],
          opening_balance: openingBalance,
          closing_balance: openingBalance + Math.floor(Math.random() * 800) - 200,
          status: "fechado",
        };

        const { data: cashData, error } = await supabaseAdmin.from("daily_cash").insert(dailyCash).select().single();
        if (!error && cashData) {
          results.daily_cash++;
          
          // Add cash transactions
          for (let t = 0; t < 3; t++) {
            const isEntrada = Math.random() > 0.3;
            await supabaseAdmin.from("cash_transactions").insert({
              daily_cash_id: cashData.id,
              type: isEntrada ? "entrada" : "saida",
              amount: isEntrada ? 50 + Math.floor(Math.random() * 200) : 20 + Math.floor(Math.random() * 80),
              description: isEntrada 
                ? ["Venda Cantina", "Mensalidade", "Venda Loja", "Matrícula"][Math.floor(Math.random() * 4)]
                : ["Troco", "Despesa", "Fornecedor", "Limpeza"][Math.floor(Math.random() * 4)],
              payment_method: ["pix", "cartao", "dinheiro"][Math.floor(Math.random() * 3)],
            });
          }
        }
      }
    }
    console.log(`Created ${results.daily_cash} daily cash records`);

    // 5. Create Graduation Records
    console.log("Creating graduation records...");
    const belts = ["branca", "azul", "roxa", "marrom", "preta"];
    
    for (const student of students || []) {
      if (student.belt !== "branca") {
        const currentBeltIndex = belts.indexOf(student.belt);
        
        for (let i = 0; i < currentBeltIndex; i++) {
          const graduation = {
            id: generateUUID(),
            ct_id: student.ct_id,
            student_id: student.id,
            from_belt: belts[i],
            to_belt: belts[i + 1],
            from_stripes: 4,
            to_stripes: 0,
            date: new Date(Date.now() - (currentBeltIndex - i) * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            notes: `Graduação para faixa ${belts[i + 1]}`,
          };

          const { error } = await supabaseAdmin.from("graduation_records").insert(graduation);
          if (!error) results.graduations++;
        }
      }
    }
    console.log(`Created ${results.graduations} graduation records`);

    console.log("Seed completion finished!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados complementares criados com sucesso!",
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Seed completion error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
