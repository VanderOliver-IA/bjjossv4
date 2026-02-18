import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to generate UUIDs
function generateUUID(): string {
  return crypto.randomUUID();
}

// Test data configuration
const CTS_DATA = [
  {
    id: generateUUID(),
    name: "Academia Gracie Barra Centro",
    cnpj: "12.345.678/0001-00",
    address: "Rua Principal, 123 - Centro, São Paulo - SP",
    phone: "(11) 3333-0001",
    email: "contato@gbcentro.com",
    logo_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200",
    subscription: "pro",
    subscription_status: "ativo",
    subscription_value: 299.90,
    subscription_due_day: 5,
  },
  {
    id: generateUUID(),
    name: "CT Alliance Rio",
    cnpj: "23.456.789/0001-00",
    address: "Av. Brasil, 456 - Copacabana, Rio de Janeiro - RJ",
    phone: "(21) 2222-0002",
    email: "contato@alliancerio.com",
    logo_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200",
    subscription: "enterprise",
    subscription_status: "ativo",
    subscription_value: 499.90,
    subscription_due_day: 10,
  },
  {
    id: generateUUID(),
    name: "Checkmat Curitiba",
    cnpj: "34.567.890/0001-00",
    address: "Rua XV de Novembro, 789 - Centro, Curitiba - PR",
    phone: "(41) 3333-0003",
    email: "contato@checkmatcwb.com",
    logo_url: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200",
    subscription: "basic",
    subscription_status: "ativo",
    subscription_value: 149.90,
    subscription_due_day: 15,
  },
];

// User credentials to create
const USERS_TO_CREATE = [
  // Super Admin
  {
    email: "vanderoliver@bjjoss.com",
    password: "Entrar2026@",
    name: "Vander Oliver",
    role: "super_admin",
    ct_index: null,
    phone: "(11) 99999-0000",
    avatar_url: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  // Admin CT 1 (test account)
  {
    email: "adminct_test@academia.com",
    password: "test123",
    name: "Carlos Eduardo Silva",
    role: "admin_ct",
    ct_index: 0,
    phone: "(11) 98888-1111",
    avatar_url: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  // Admin CT 2
  {
    email: "admin@alliancerio.com",
    password: "Admin@2026",
    name: "Roberto Fernandes Costa",
    role: "admin_ct",
    ct_index: 1,
    phone: "(21) 97777-2222",
    avatar_url: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  // Admin CT 3
  {
    email: "admin@checkmatcwb.com",
    password: "Checkmat@2026",
    name: "Marcos Antônio Ribeiro",
    role: "admin_ct",
    ct_index: 2,
    phone: "(41) 96666-3333",
    avatar_url: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  // Professor 1 (test account)
  {
    email: "proftest@academia.com",
    password: "test123",
    name: "Mestre João Paulo Santos",
    role: "professor",
    ct_index: 0,
    phone: "(11) 95555-4444",
    avatar_url: "https://randomuser.me/api/portraits/men/22.jpg",
    belt: "preta",
    stripes: 3,
  },
  // Professor 2
  {
    email: "professor@alliancerio.com",
    password: "Prof@2026",
    name: "Professor André Luiz Gomes",
    role: "professor",
    ct_index: 1,
    phone: "(21) 94444-5555",
    avatar_url: "https://randomuser.me/api/portraits/men/28.jpg",
    belt: "preta",
    stripes: 2,
  },
  // Professor 3
  {
    email: "professor@checkmatcwb.com",
    password: "CheckProf@2026",
    name: "Mestre Ricardo Almeida",
    role: "professor",
    ct_index: 2,
    phone: "(41) 93333-6666",
    avatar_url: "https://randomuser.me/api/portraits/men/35.jpg",
    belt: "preta",
    stripes: 4,
  },
  // Atendente (test account)
  {
    email: "atendtest@academia.com",
    password: "test123",
    name: "Maria Aparecida Santos",
    role: "atendente",
    ct_index: 0,
    phone: "(11) 92222-7777",
    avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  // Aluno test (test account)
  {
    email: "alunotest@email.com",
    password: "test123",
    name: "Pedro Henrique Costa",
    role: "aluno",
    ct_index: 0,
    phone: "(11) 91111-8888",
    avatar_url: "https://randomuser.me/api/portraits/men/1.jpg",
    belt: "azul",
    stripes: 2,
  },
];

// Generate 29 more students (10 per CT, minus the test account)
const STUDENT_NAMES = [
  // CT 1 - 9 more students
  { name: "Ana Carolina Oliveira", gender: "women", num: 2, ct_index: 0 },
  { name: "Lucas Mendes Silva", gender: "men", num: 3, ct_index: 0 },
  { name: "Julia Santos Ferreira", gender: "women", num: 4, ct_index: 0 },
  { name: "Rafael Lima Souza", gender: "men", num: 5, ct_index: 0 },
  { name: "Carla Rodrigues Alves", gender: "women", num: 6, ct_index: 0 },
  { name: "Bruno Almeida Castro", gender: "men", num: 7, ct_index: 0 },
  { name: "Fernanda Costa Nunes", gender: "women", num: 8, ct_index: 0 },
  { name: "Diego Ferreira Lima", gender: "men", num: 9, ct_index: 0 },
  { name: "Patrícia Souza Ramos", gender: "women", num: 10, ct_index: 0 },
  // CT 2 - 10 students
  { name: "Thiago Martins Rocha", gender: "men", num: 11, ct_index: 1 },
  { name: "Camila Nunes Pereira", gender: "women", num: 12, ct_index: 1 },
  { name: "Gustavo Ribeiro Santos", gender: "men", num: 13, ct_index: 1 },
  { name: "Larissa Gomes Costa", gender: "women", num: 14, ct_index: 1 },
  { name: "Eduardo Campos Silva", gender: "men", num: 15, ct_index: 1 },
  { name: "Amanda Lopes Ferreira", gender: "women", num: 16, ct_index: 1 },
  { name: "Marcelo Dias Almeida", gender: "men", num: 17, ct_index: 1 },
  { name: "Beatriz Cardoso Lima", gender: "women", num: 18, ct_index: 1 },
  { name: "Felipe Moreira Santos", gender: "men", num: 19, ct_index: 1 },
  { name: "Isabela Pereira Costa", gender: "women", num: 20, ct_index: 1 },
  // CT 3 - 10 students
  { name: "Vinícius Oliveira Ramos", gender: "men", num: 21, ct_index: 2 },
  { name: "Mariana Silva Gomes", gender: "women", num: 22, ct_index: 2 },
  { name: "Gabriel Santos Ribeiro", gender: "men", num: 23, ct_index: 2 },
  { name: "Carolina Ferreira Lima", gender: "women", num: 24, ct_index: 2 },
  { name: "André Luiz Souza", gender: "men", num: 25, ct_index: 2 },
  { name: "Renata Costa Almeida", gender: "women", num: 26, ct_index: 2 },
  { name: "Leonardo Alves Martins", gender: "men", num: 27, ct_index: 2 },
  { name: "Daniela Nunes Rocha", gender: "women", num: 28, ct_index: 2 },
  { name: "Rodrigo Lima Campos", gender: "men", num: 29, ct_index: 2 },
  { name: "Aline Gomes Ferreira", gender: "women", num: 30, ct_index: 2 },
];

const BELTS = ["branca", "azul", "roxa", "marrom", "preta"] as const;
const STATUSES = ["ativo", "ativo", "ativo", "ativo", "experimental", "inativo"] as const;

// Products data
const PRODUCTS_DATA = [
  // Cantina
  { name: "Açaí 300ml", category: "cantina", price: 15.00, stock: 50 },
  { name: "Açaí 500ml", category: "cantina", price: 22.00, stock: 40 },
  { name: "Água Mineral 500ml", category: "cantina", price: 4.00, stock: 100 },
  { name: "Água de Coco", category: "cantina", price: 6.00, stock: 60 },
  { name: "Isotônico", category: "cantina", price: 8.00, stock: 40 },
  { name: "Barra de Proteína", category: "cantina", price: 12.00, stock: 30 },
  { name: "Vitamina de Banana", category: "cantina", price: 10.00, stock: 25 },
  { name: "Sanduíche Natural", category: "cantina", price: 14.00, stock: 20 },
  // Loja
  { name: "Kimono Azul Adulto", category: "loja", price: 350.00, stock: 15 },
  { name: "Kimono Branco Adulto", category: "loja", price: 320.00, stock: 20 },
  { name: "Kimono Infantil", category: "loja", price: 250.00, stock: 10 },
  { name: "Faixa Branca", category: "loja", price: 35.00, stock: 50 },
  { name: "Faixa Azul", category: "loja", price: 40.00, stock: 30 },
  { name: "Faixa Roxa", category: "loja", price: 45.00, stock: 20 },
  { name: "Faixa Marrom", category: "loja", price: 50.00, stock: 15 },
  { name: "Faixa Preta", category: "loja", price: 60.00, stock: 10 },
  { name: "Rashguard Academia", category: "loja", price: 120.00, stock: 25 },
  { name: "Short de Treino", category: "loja", price: 90.00, stock: 30 },
  { name: "Mochila Academia", category: "loja", price: 180.00, stock: 10 },
  { name: "Protetor Bucal", category: "loja", price: 45.00, stock: 40 },
];

// Classes per CT
const CLASSES_TEMPLATES = [
  { name: "Jiu-Jitsu Avançado", days_of_week: ["segunda", "quarta", "sexta"], time_start: "19:00", time_end: "20:30", level: "avancado", max_students: 20 },
  { name: "Jiu-Jitsu Intermediário", days_of_week: ["terça", "quinta"], time_start: "19:00", time_end: "20:30", level: "intermediario", max_students: 20 },
  { name: "Jiu-Jitsu Iniciante", days_of_week: ["segunda", "quarta", "sexta"], time_start: "18:00", time_end: "19:00", level: "iniciante", max_students: 25 },
  { name: "Competição", days_of_week: ["sábado"], time_start: "10:00", time_end: "12:00", level: "avancado", max_students: 15 },
  { name: "Open Mat", days_of_week: ["domingo"], time_start: "09:00", time_end: "11:00", level: "todos", max_students: 30 },
  { name: "Kids Jiu-Jitsu", days_of_week: ["terça", "quinta"], time_start: "17:00", time_end: "18:00", level: "iniciante", max_students: 20 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: any = {
      cts: [],
      users: [],
      students: [],
      classes: [],
      products: [],
      transactions: [],
      attendance: [],
      messages: [],
      leads: [],
      events: [],
    };

    console.log("Starting seed process...");

    // 1. Create CTs
    console.log("Creating CTs...");
    const { data: ctsData, error: ctsError } = await supabaseAdmin
      .from("cts")
      .upsert(CTS_DATA, { onConflict: "id" })
      .select();

    if (ctsError) {
      console.error("Error creating CTs:", ctsError);
      throw ctsError;
    }
    results.cts = ctsData;
    console.log(`Created ${ctsData?.length} CTs`);

    const ctIds = CTS_DATA.map((ct) => ct.id);

    // 2. Create products for each CT
    console.log("Creating products...");
    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      const ctProducts = PRODUCTS_DATA.map((p) => ({
        id: generateUUID(),
        ct_id: ctIds[ctIndex],
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        active: true,
        image_url: p.category === "cantina" 
          ? `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200`
          : `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200`,
      }));

      const { data: productsData, error: productsError } = await supabaseAdmin
        .from("products")
        .upsert(ctProducts, { onConflict: "id" })
        .select();

      if (productsError) {
        console.error("Error creating products:", productsError);
      } else {
        results.products.push(...(productsData || []));
      }
    }
    console.log(`Created ${results.products.length} products`);

    // 3. Create users and their profiles
    console.log("Creating users...");
    const createdProfiles: any[] = [];
    const professorProfiles: { [key: number]: string } = {};

    for (const userData of USERS_TO_CREATE) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { name: userData.name },
        });

        if (authError) {
          console.error(`Error creating user ${userData.email}:`, authError);
          // If user already exists, try to get their ID
          if (authError.message.includes("already been registered")) {
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers.users.find((u) => u.email === userData.email);
            if (existingUser) {
              console.log(`User ${userData.email} already exists, using existing ID`);
              // Continue with existing user
              const ctId = userData.ct_index !== null ? ctIds[userData.ct_index] : null;
              
              // Update profile
              const { data: profileData } = await supabaseAdmin
                .from("profiles")
                .upsert({
                  user_id: existingUser.id,
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  avatar_url: userData.avatar_url,
                  ct_id: ctId,
                }, { onConflict: "user_id" })
                .select()
                .single();

              if (profileData) {
                createdProfiles.push(profileData);
                if (userData.role === "professor" && userData.ct_index !== null) {
                  professorProfiles[userData.ct_index] = profileData.id;
                }
              }

              // Ensure user role exists
              await supabaseAdmin
                .from("user_roles")
                .upsert({ user_id: existingUser.id, role: userData.role }, { onConflict: "user_id,role" });
            }
            continue;
          }
          continue;
        }

        if (!authData.user) continue;

        const userId = authData.user.id;
        const ctId = userData.ct_index !== null ? ctIds[userData.ct_index] : null;

        // Wait for trigger to create profile, then update it
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update profile with full data
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            name: userData.name,
            phone: userData.phone,
            avatar_url: userData.avatar_url,
            ct_id: ctId,
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (profileError) {
          console.error(`Error updating profile for ${userData.email}:`, profileError);
        } else if (profileData) {
          createdProfiles.push(profileData);
          if (userData.role === "professor" && userData.ct_index !== null) {
            professorProfiles[userData.ct_index] = profileData.id;
          }
        }

        // Create user role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role: userData.role });

        if (roleError) {
          console.error(`Error creating role for ${userData.email}:`, roleError);
        }

        results.users.push({ email: userData.email, role: userData.role, profile_id: profileData?.id });
        console.log(`Created user: ${userData.email} with role ${userData.role}`);
      } catch (error) {
        console.error(`Error processing user ${userData.email}:`, error);
      }
    }

    // 4. Create classes for each CT
    console.log("Creating classes...");
    const createdClasses: any[] = [];
    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      const professorId = professorProfiles[ctIndex] || null;
      
      for (const classTemplate of CLASSES_TEMPLATES) {
        const classData = {
          id: generateUUID(),
          ct_id: ctIds[ctIndex],
          name: classTemplate.name,
          professor_id: professorId,
          days_of_week: classTemplate.days_of_week,
          time_start: classTemplate.time_start,
          time_end: classTemplate.time_end,
          level: classTemplate.level,
          max_students: classTemplate.max_students,
          active: true,
          schedule: `${classTemplate.days_of_week.join(", ")} - ${classTemplate.time_start}`,
        };

        const { data, error } = await supabaseAdmin
          .from("training_classes")
          .upsert(classData, { onConflict: "id" })
          .select()
          .single();

        if (error) {
          console.error("Error creating class:", error);
        } else if (data) {
          createdClasses.push(data);
        }
      }
    }
    results.classes = createdClasses;
    console.log(`Created ${createdClasses.length} classes`);

    // 5. Create additional students (29 more)
    console.log("Creating students...");
    const createdStudents: any[] = [];

    for (const studentData of STUDENT_NAMES) {
      try {
        const email = `${studentData.name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@email.com`;
        const password = `Student@${Math.floor(Math.random() * 9000) + 1000}`;
        
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: studentData.name },
        });

        if (authError) {
          console.error(`Error creating student ${studentData.name}:`, authError);
          continue;
        }

        if (!authData.user) continue;

        const userId = authData.user.id;
        const ctId = ctIds[studentData.ct_index];
        const beltIndex = Math.floor(Math.random() * 4); // 0-3 (not preta for students)
        const stripes = Math.floor(Math.random() * 5);
        const statusIndex = Math.floor(Math.random() * STATUSES.length);

        // Wait for profile trigger
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Update profile
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .update({
            name: studentData.name,
            phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            avatar_url: `https://randomuser.me/api/portraits/${studentData.gender}/${studentData.num}.jpg`,
            ct_id: ctId,
          })
          .eq("user_id", userId)
          .select()
          .single();

        // Create user role as aluno
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role: "aluno" });

        // Create student record
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 36));
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - (18 + Math.floor(Math.random() * 25)));

        const studentRecord = {
          id: generateUUID(),
          ct_id: ctId,
          profile_id: profileData?.id,
          name: studentData.name,
          email,
          phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          belt: BELTS[beltIndex],
          stripes,
          status: STATUSES[statusIndex],
          enrollment_date: startDate.toISOString().split("T")[0],
          birth_date: birthDate.toISOString().split("T")[0],
          balance: Math.random() > 0.7 ? -(Math.floor(Math.random() * 4) + 1) * 150 : 0,
          photo_front: `https://randomuser.me/api/portraits/${studentData.gender}/${studentData.num}.jpg`,
          photo_left: `https://randomuser.me/api/portraits/${studentData.gender}/${((studentData.num + 30) % 100)}.jpg`,
          photo_right: `https://randomuser.me/api/portraits/${studentData.gender}/${((studentData.num + 60) % 100)}.jpg`,
          address: `Rua ${["das Flores", "Principal", "Santos Dumont", "Brasil", "Tiradentes"][Math.floor(Math.random() * 5)]}, ${Math.floor(Math.random() * 1000) + 1}`,
          emergency_contact: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          jj_start_date: startDate.toISOString().split("T")[0],
        };

        const { data: studentDataResult, error: studentError } = await supabaseAdmin
          .from("students")
          .upsert(studentRecord, { onConflict: "id" })
          .select()
          .single();

        if (studentError) {
          console.error(`Error creating student record for ${studentData.name}:`, studentError);
        } else if (studentDataResult) {
          createdStudents.push(studentDataResult);
        }
      } catch (error) {
        console.error(`Error processing student ${studentData.name}:`, error);
      }
    }

    // Also create student record for the test aluno user
    const testAlunoProfile = createdProfiles.find((p) => p.email === "alunotest@email.com");
    if (testAlunoProfile) {
      const testStudentRecord = {
        id: generateUUID(),
        ct_id: ctIds[0],
        profile_id: testAlunoProfile.id,
        name: "Pedro Henrique Costa",
        email: "alunotest@email.com",
        phone: "(11) 91111-8888",
        belt: "azul",
        stripes: 2,
        status: "ativo",
        enrollment_date: "2023-01-15",
        birth_date: "1995-03-20",
        balance: 0,
        photo_front: "https://randomuser.me/api/portraits/men/1.jpg",
        photo_left: "https://randomuser.me/api/portraits/men/31.jpg",
        photo_right: "https://randomuser.me/api/portraits/men/61.jpg",
        address: "Rua das Flores, 123",
        emergency_contact: "(11) 98765-4321",
        jj_start_date: "2022-06-01",
      };

      await supabaseAdmin
        .from("students")
        .upsert(testStudentRecord, { onConflict: "id" });
      
      createdStudents.push(testStudentRecord);
    }

    results.students = createdStudents;
    console.log(`Created ${createdStudents.length} students`);

    // 6. Enroll students in classes
    console.log("Enrolling students in classes...");
    for (const student of createdStudents) {
      // Find classes for this student's CT
      const ctClasses = createdClasses.filter((c) => c.ct_id === student.ct_id);
      // Enroll in 1-3 random classes
      const numClasses = Math.floor(Math.random() * 3) + 1;
      const shuffled = ctClasses.sort(() => 0.5 - Math.random());
      const selectedClasses = shuffled.slice(0, Math.min(numClasses, shuffled.length));

      for (const cls of selectedClasses) {
        await supabaseAdmin
          .from("student_classes")
          .upsert({ student_id: student.id, class_id: cls.id }, { onConflict: "student_id,class_id" });
      }
    }

    // 7. Create financial transactions
    console.log("Creating financial transactions...");
    const transactionTypes = ["mensalidade", "cantina", "loja", "evento"] as const;
    const paymentMethods = ["pix", "cartao", "dinheiro", "boleto"] as const;
    const paymentStatuses = ["pago", "pendente", "atrasado"] as const;

    for (const student of createdStudents) {
      // Create 3-6 transactions per student
      const numTransactions = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < numTransactions; i++) {
        const typeIndex = i === 0 ? 0 : Math.floor(Math.random() * transactionTypes.length);
        const type = transactionTypes[typeIndex];
        const statusIndex = Math.floor(Math.random() * paymentStatuses.length);
        const status = paymentStatuses[statusIndex];
        
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 60));

        let amount = 0;
        let description = "";
        
        switch (type) {
          case "mensalidade":
            amount = 200 + Math.floor(Math.random() * 100);
            description = `Mensalidade ${["Janeiro", "Fevereiro", "Março", "Abril", "Maio"][Math.floor(Math.random() * 5)]}/2026`;
            break;
          case "cantina":
            amount = 10 + Math.floor(Math.random() * 30);
            description = ["Açaí + Água", "Vitamina", "Lanche", "Isotônico"][Math.floor(Math.random() * 4)];
            break;
          case "loja":
            amount = 50 + Math.floor(Math.random() * 300);
            description = ["Kimono", "Rashguard", "Faixa", "Short"][Math.floor(Math.random() * 4)];
            break;
          case "evento":
            amount = 80 + Math.floor(Math.random() * 150);
            description = ["Campeonato Interno", "Seminário", "Graduação"][Math.floor(Math.random() * 3)];
            break;
        }

        const transaction = {
          id: generateUUID(),
          ct_id: student.ct_id,
          student_id: student.id,
          type,
          description,
          amount,
          status,
          due_date: transactionDate.toISOString().split("T")[0],
          paid_date: status === "pago" ? transactionDate.toISOString().split("T")[0] : null,
          payment_method: status === "pago" ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null,
        };

        const { error } = await supabaseAdmin
          .from("financial_transactions")
          .insert(transaction);

        if (!error) {
          results.transactions.push(transaction);
        }
      }
    }
    console.log(`Created ${results.transactions.length} transactions`);

    // 8. Create attendance records
    console.log("Creating attendance records...");
    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      const ctStudents = createdStudents.filter((s) => s.ct_id === ctIds[ctIndex]);
      const ctClassesForCt = createdClasses.filter((c) => c.ct_id === ctIds[ctIndex]);
      const professorId = Object.values(professorProfiles)[ctIndex];

      // Create attendance for last 30 days
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dayOfWeek = date.getDay();

        // Only create attendance for weekdays and Saturday
        if (dayOfWeek === 0) continue; // Skip Sunday (except Open Mat sometimes)

        for (const cls of ctClassesForCt) {
          // Check if class runs on this day
          const classDay = cls.days_of_week?.[0]?.toLowerCase();
          if (!classDay) continue;

          const attendance = {
            id: generateUUID(),
            ct_id: ctIds[ctIndex],
            class_id: cls.id,
            date: date.toISOString().split("T")[0],
            visitors: Math.floor(Math.random() * 3),
            experimental: Math.floor(Math.random() * 2),
            created_by: professorId,
          };

          const { data: attendanceData, error } = await supabaseAdmin
            .from("attendance_records")
            .insert(attendance)
            .select()
            .single();

          if (!error && attendanceData) {
            // Add students to attendance
            const numPresent = Math.floor(ctStudents.length * (0.5 + Math.random() * 0.4));
            const shuffledStudents = ctStudents.sort(() => 0.5 - Math.random());
            const presentStudents = shuffledStudents.slice(0, numPresent);

            for (const student of presentStudents) {
              await supabaseAdmin
                .from("attendance_students")
                .insert({
                  attendance_id: attendanceData.id,
                  student_id: student.id,
                  recognized: Math.random() > 0.1, // 90% recognized by facial recognition
                });
            }

            results.attendance.push(attendanceData);
          }
        }
      }
    }
    console.log(`Created ${results.attendance.length} attendance records`);

    // 9. Create leads (CRM)
    console.log("Creating leads...");
    const leadStatuses = ["novo", "contatado", "agendado", "experimental", "matriculado", "perdido"] as const;
    const leadSources = ["instagram", "facebook", "indicacao", "site", "outros"] as const;
    const leadNames = [
      "João Silva", "Maria Santos", "Carlos Oliveira", "Ana Costa", "Pedro Lima",
      "Juliana Ferreira", "Roberto Almeida", "Fernanda Gomes", "Ricardo Souza", "Patricia Nunes",
    ];

    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      for (let i = 0; i < 10; i++) {
        const lead = {
          id: generateUUID(),
          ct_id: ctIds[ctIndex],
          name: leadNames[i],
          phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `${leadNames[i].toLowerCase().replace(" ", ".")}@email.com`,
          status: leadStatuses[Math.floor(Math.random() * leadStatuses.length)],
          source: leadSources[Math.floor(Math.random() * leadSources.length)],
          notes: ["Interessado em aulas", "Quer fazer aula experimental", "Indicação de aluno", "Viu no Instagram"][Math.floor(Math.random() * 4)],
          last_contact: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        };

        const { error } = await supabaseAdmin.from("leads").insert(lead);
        if (!error) results.leads.push(lead);
      }
    }
    console.log(`Created ${results.leads.length} leads`);

    // 10. Create events
    console.log("Creating events...");
    const eventTypes = ["graduacao", "campeonato", "interno", "seminario"] as const;
    const eventTitles = {
      graduacao: ["Cerimônia de Graduação", "Entrega de Faixas"],
      campeonato: ["Campeonato Interno", "Open de Jiu-Jitsu", "Copa Regional"],
      interno: ["Treino Especial", "Roda de Treino", "Workshop Técnico"],
      seminario: ["Seminário com Mestre", "Aula Magna", "Workshop Especial"],
    };

    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      for (let i = 0; i < 4; i++) {
        const eventType = eventTypes[i];
        const titles = eventTitles[eventType];
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90) - 30);

        const event = {
          id: generateUUID(),
          ct_id: ctIds[ctIndex],
          title: titles[Math.floor(Math.random() * titles.length)],
          type: eventType,
          date: eventDate.toISOString().split("T")[0],
          description: `Evento de ${eventType} na academia`,
          location: ctIndex === 0 ? "Academia Gracie Barra Centro" : ctIndex === 1 ? "CT Alliance Rio" : "Checkmat Curitiba",
          price: eventType === "seminario" ? 150 : eventType === "campeonato" ? 80 : 0,
        };

        const { data: eventData, error } = await supabaseAdmin
          .from("events")
          .insert(event)
          .select()
          .single();

        if (!error && eventData) {
          results.events.push(eventData);

          // Add participants
          const ctStudents = createdStudents.filter((s) => s.ct_id === ctIds[ctIndex]);
          const numParticipants = Math.floor(ctStudents.length * (0.3 + Math.random() * 0.5));
          const shuffled = ctStudents.sort(() => 0.5 - Math.random());
          
          for (const student of shuffled.slice(0, numParticipants)) {
            await supabaseAdmin
              .from("event_participants")
              .insert({ event_id: eventData.id, student_id: student.id });
          }
        }
      }
    }
    console.log(`Created ${results.events.length} events`);

    // 11. Create messages
    console.log("Creating messages...");
    const messageSubjects = [
      "Aviso de Treino",
      "Confirmação de Matrícula",
      "Lembrete de Mensalidade",
      "Evento de Graduação",
      "Horários Alterados",
      "Boas-vindas à Academia",
    ];

    for (const profile of createdProfiles) {
      if (!profile.ct_id) continue;

      // Find admin of this CT to send messages
      const adminProfile = createdProfiles.find(
        (p) => p.ct_id === profile.ct_id && p.email?.includes("admin")
      );

      if (adminProfile && profile.id !== adminProfile.id) {
        const message = {
          id: generateUUID(),
          ct_id: profile.ct_id,
          from_profile_id: adminProfile.id,
          to_profile_id: profile.id,
          subject: messageSubjects[Math.floor(Math.random() * messageSubjects.length)],
          content: "Esta é uma mensagem automática do sistema. Por favor, entre em contato caso tenha dúvidas.",
          read: Math.random() > 0.5,
        };

        const { error } = await supabaseAdmin.from("messages").insert(message);
        if (!error) results.messages.push(message);
      }
    }
    console.log(`Created ${results.messages.length} messages`);

    // 12. Create daily cash records
    console.log("Creating daily cash records...");
    for (let ctIndex = 0; ctIndex < ctIds.length; ctIndex++) {
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        if (date.getDay() === 0) continue; // Skip Sundays

        const openingBalance = 500 + Math.floor(Math.random() * 500);
        const isClosed = day > 0;

        const dailyCash = {
          id: generateUUID(),
          ct_id: ctIds[ctIndex],
          date: date.toISOString().split("T")[0],
          opening_balance: openingBalance,
          closing_balance: isClosed ? openingBalance + Math.floor(Math.random() * 800) - 200 : null,
          status: isClosed ? "fechado" : "aberto",
        };

        const { data: cashData, error } = await supabaseAdmin
          .from("daily_cash")
          .insert(dailyCash)
          .select()
          .single();

        if (!error && cashData) {
          // Add cash transactions
          const numTransactions = Math.floor(Math.random() * 5) + 2;
          for (let t = 0; t < numTransactions; t++) {
            const isEntrada = Math.random() > 0.3;
            await supabaseAdmin.from("cash_transactions").insert({
              daily_cash_id: cashData.id,
              type: isEntrada ? "entrada" : "saida",
              amount: isEntrada ? 50 + Math.floor(Math.random() * 200) : 20 + Math.floor(Math.random() * 80),
              description: isEntrada 
                ? ["Venda Cantina", "Mensalidade", "Venda Loja"][Math.floor(Math.random() * 3)]
                : ["Troco", "Despesa", "Fornecedor"][Math.floor(Math.random() * 3)],
              payment_method: ["pix", "cartao", "dinheiro"][Math.floor(Math.random() * 3)],
            });
          }
        }
      }
    }

    // 13. Create role permissions for each CT
    console.log("Creating role permissions...");
    for (const ctId of ctIds) {
      const roles = ["professor", "atendente", "aluno"] as const;
      for (const role of roles) {
        const modules = {
          alunos: role === "professor" || role === "atendente",
          turmas: role === "professor",
          presenca: role === "professor",
          crm: role === "atendente",
          financeiro: role === "atendente",
          cantina: role === "atendente",
          eventos: true,
          graduacao: role === "professor",
          comunicacao: true,
          relatorios: false,
        };

        await supabaseAdmin.from("role_permissions").upsert(
          { ct_id: ctId, role, modules },
          { onConflict: "ct_id,role" }
        );
      }
    }

    // 14. Create graduation records
    console.log("Creating graduation records...");
    for (const student of createdStudents) {
      if (student.belt !== "branca") {
        const graduation = {
          id: generateUUID(),
          ct_id: student.ct_id,
          student_id: student.id,
          from_belt: "branca",
          to_belt: student.belt,
          from_stripes: 4,
          to_stripes: student.stripes,
          date: student.enrollment_date,
          notes: "Graduação regular",
        };

        await supabaseAdmin.from("graduation_records").insert(graduation);
      }
    }

    console.log("Seed completed successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados de teste criados com sucesso!",
        summary: {
          cts: results.cts.length,
          users: results.users.length,
          students: results.students.length,
          classes: results.classes.length,
          products: results.products.length,
          transactions: results.transactions.length,
          attendance: results.attendance.length,
          leads: results.leads.length,
          events: results.events.length,
          messages: results.messages.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
