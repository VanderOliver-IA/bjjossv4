import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FaceComparisonResult {
  student_id: string;
  student_name: string;
  confidence: number;
  matched: boolean;
}

interface RecognitionResponse {
  success: boolean;
  recognized: boolean;
  results: FaceComparisonResult[];
  unrecognized_count: number;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();
    const { image_base64, ct_id, class_id, action, student_id, photo_angle, recognized_students, visitors, experimental, photo_url } = body;

    console.log(`Facial recognition action: ${action}, ct_id: ${ct_id}`);

    if (action === "register") {
      // Register a new face for a student
      if (!student_id || !image_base64 || !photo_angle) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: student_id, image_base64, photo_angle" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Upload photo to storage
      const fileName = `${student_id}/${photo_angle}_${Date.now()}.jpg`;
      const imageBuffer = Uint8Array.from(atob(image_base64), c => c.charCodeAt(0));
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(fileName, imageBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ success: false, error: `Upload failed: ${uploadError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("photos")
        .getPublicUrl(fileName);

      // Update student photo field
      const photoField = `photo_${photo_angle}`;
      const { error: updateError } = await supabaseAdmin
        .from("students")
        .update({ [photoField]: urlData.publicUrl })
        .eq("id", student_id);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: `Update failed: ${updateError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log(`Photo registered for student ${student_id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Photo registered successfully",
          photo_url: urlData.publicUrl 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (action === "recognize") {
      // Recognize faces in an image
      if (!image_base64 || !ct_id) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: image_base64, ct_id" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`Fetching students for CT: ${ct_id}`);

      // Fetch all students from the CT with their photos
      const { data: students, error: studentsError } = await supabaseAdmin
        .from("students")
        .select("id, name, photo_front, photo_left, photo_right, belt, stripes")
        .eq("ct_id", ct_id)
        .not("photo_front", "is", null);

      if (studentsError) {
        console.error("Students fetch error:", studentsError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to fetch students: ${studentsError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log(`Found ${students?.length || 0} students with photos`);

      if (!students || students.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            recognized: false, 
            results: [],
            unrecognized_count: 1,
            message: "No students with registered photos found in this CT" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      if (!lovableApiKey) {
        console.error("LOVABLE_API_KEY not configured");
        return new Response(
          JSON.stringify({ success: false, error: "AI service not configured. Please contact support." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Build the prompt for vision analysis
      const studentsList = students.map(s => 
        `- ${s.name} (ID: ${s.id}, Belt: ${s.belt}): Profile photo URL: ${s.photo_front}`
      ).join('\n');

      const prompt = `You are an AI facial recognition assistant for a Brazilian Jiu-Jitsu academy attendance system.

Your task is to analyze the provided photo and identify which registered students appear in it by comparing faces.

REGISTERED STUDENTS WITH THEIR PROFILE PHOTOS:
${studentsList}

INSTRUCTIONS:
1. Look at the captured photo carefully to identify faces
2. Compare each detected face with the profile photos of registered students (accessible via the URLs above)
3. For each face you can identify, estimate a similarity/confidence score from 0-100
4. A match should have confidence >= 70 to be considered positive

IMPORTANT: Return your analysis as a valid JSON object with this exact structure:
{
  "detected_faces": <number of faces found in the photo>,
  "matches": [
    {
      "student_id": "<exact UUID from the student list>",
      "student_name": "<exact name from the student list>",
      "confidence": <number 0-100>,
      "matched": <true if confidence >= 70, false otherwise>
    }
  ],
  "analysis_notes": "<brief description of what you observed>"
}

Only include students you are reasonably confident about (confidence >= 60).
Return ONLY the JSON object, no markdown formatting or additional text.`;

      console.log("Calling Lovable AI Gateway for facial recognition...");

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${image_base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 2000,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
          
          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ success: false, error: "AI service rate limit exceeded. Please try again later." }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
            );
          }
          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ success: false, error: "AI service credits exhausted. Please contact support." }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
            );
          }
          
          throw new Error(`AI Gateway error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "{}";
        
        console.log("AI response received:", content.substring(0, 500));

        // Parse AI response
        let parsedResult;
        try {
          // Clean the response if it has markdown
          const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
          parsedResult = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error("Failed to parse AI response:", content);
          console.error("Parse error:", parseError);
          parsedResult = { detected_faces: 0, matches: [] };
        }

        const results: FaceComparisonResult[] = (parsedResult.matches || []).map((m: any) => ({
          student_id: m.student_id,
          student_name: m.student_name,
          confidence: Math.round(m.confidence || 0),
          matched: m.matched || (m.confidence && m.confidence >= 70),
        }));

        const recognizedCount = results.filter(r => r.matched).length;
        const unrecognizedCount = Math.max(0, (parsedResult.detected_faces || 0) - recognizedCount);

        console.log(`Recognition complete: ${recognizedCount} matched, ${unrecognizedCount} unrecognized`);

        return new Response(
          JSON.stringify({
            success: true,
            recognized: recognizedCount > 0,
            results,
            unrecognized_count: unrecognizedCount,
            message: `Recognized ${recognizedCount} student(s)`,
            analysis_notes: parsedResult.analysis_notes || "",
          } as RecognitionResponse),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (aiError) {
        console.error("AI recognition error:", aiError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `AI recognition failed: ${aiError instanceof Error ? aiError.message : String(aiError)}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // Record attendance with facial recognition results
    if (action === "record_attendance") {
      if (!ct_id) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required field: ct_id" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Get auth user from request
      const authHeader = req.headers.get("Authorization");
      let createdBy = null;
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        
        if (user) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();
          
          if (profile) {
            createdBy = profile.id;
          }
        }
      }

      console.log(`Recording attendance for CT: ${ct_id}, class: ${class_id || 'none'}`);

      // Create attendance record
      const { data: attendance, error: attendanceError } = await supabaseAdmin
        .from("attendance_records")
        .insert({
          ct_id,
          class_id: class_id || null,
          date: new Date().toISOString().split("T")[0],
          visitors: visitors || 0,
          experimental: experimental || 0,
          photo_url: photo_url || null,
          created_by: createdBy,
        })
        .select()
        .single();

      if (attendanceError) {
        console.error("Attendance record error:", attendanceError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to create attendance: ${attendanceError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Add recognized students to attendance
      if (recognized_students && Array.isArray(recognized_students) && recognized_students.length > 0) {
        const studentRecords = recognized_students.map((studentResult: FaceComparisonResult) => ({
          attendance_id: attendance.id,
          student_id: studentResult.student_id,
          recognized: studentResult.matched,
        }));

        const { error: studentsError } = await supabaseAdmin
          .from("attendance_students")
          .insert(studentRecords);

        if (studentsError) {
          console.error("Attendance students error:", studentsError);
        }
      }

      console.log(`Attendance recorded: ${attendance.id} with ${recognized_students?.length || 0} students`);

      return new Response(
        JSON.stringify({
          success: true,
          attendance_id: attendance.id,
          message: `Attendance recorded with ${recognized_students?.length || 0} student(s)`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action. Use: register, recognize, or record_attendance" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Facial recognition error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
