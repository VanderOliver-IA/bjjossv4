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

interface DetectedFaceBox {
  /** Normalized 0..1 */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedFaceMatch {
  student_id: string;
  confidence: number;
  matched?: boolean;
}

interface DetectedFaceResult {
  face_id: string;
  box: DetectedFaceBox;
  match: DetectedFaceMatch | null;
}

interface RecognitionResponse {
  success: boolean;
  recognized: boolean;
  results: FaceComparisonResult[];
  unrecognized_count: number;
  message: string;
  detected_faces?: DetectedFaceResult[];
  analysis_notes?: string;
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
}

function clamp01(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function extractPhotosPathFromUrl(url: string): string | null {
  // Typical public URL: .../storage/v1/object/public/photos/<path>
  const m = url.match(/\/storage\/v1\/object\/(?:public\/)?photos\/(.+)$/);
  return m?.[1] ?? null;
}

async function toSignedPhotoUrl(
  // Use `any` here to avoid edge-runtime typing mismatches across supabase-js builds.
  // (We only need `storage.from(...).createSignedUrl(...)` at runtime.)
  supabaseAdmin: any,
  url: string | null,
): Promise<string | null> {
  if (!url) return null;
  // If already a signed URL or external URL, keep it.
  if (url.includes('/storage/v1/object/sign/photos/')) return url;
  const path = extractPhotosPathFromUrl(url);
  if (!path) return url;

  const { data, error } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUrl(path, 60 * 10);

  if (error) {
    console.warn('Could not create signed URL, falling back to stored URL:', error.message);
    return url;
  }
  return data.signedUrl;
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

      // Hard validation: do not allow analysis with empty/invalid image
      let imageBytes: Uint8Array;
      try {
        imageBytes = base64ToBytes(String(image_base64));
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid image_base64" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      if (imageBytes.length < 5_000) {
        return new Response(
          JSON.stringify({ success: false, error: "Image too small or empty" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`Fetching students for CT: ${ct_id}`);

      // Fetch all students from the CT with their photos
      const { data: students, error: studentsError } = await supabaseAdmin
        .from("students")
        .select("id, name, photo_front, photo_left, photo_right, belt, stripes")
        .eq("ct_id", ct_id)
        .or("photo_front.not.is.null,photo_left.not.is.null,photo_right.not.is.null");

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

      // Ensure the AI can actually fetch student photos (signed URLs)
      const studentsWithSigned = await Promise.all(
        students.map(async (s) => {
          const front = await toSignedPhotoUrl(supabaseAdmin, s.photo_front);
          const left = await toSignedPhotoUrl(supabaseAdmin, s.photo_left);
          const right = await toSignedPhotoUrl(supabaseAdmin, s.photo_right);
          return { ...s, front, left, right };
        })
      );

      const studentsById = new Map<string, { id: string; name: string; belt: string | null }>();
      for (const s of studentsWithSigned) {
        studentsById.set(s.id, { id: s.id, name: s.name, belt: s.belt ?? null });
      }

      const studentsList = studentsWithSigned
        .map(
          (s) =>
            `- ${s.name} (ID: ${s.id}, Belt: ${s.belt ?? ""}): front=${s.front ?? ""} left=${s.left ?? ""} right=${s.right ?? ""}`
        )
        .join("\n");

       const prompt = `You are an AI facial recognition assistant for a Brazilian Jiu-Jitsu academy attendance system.

Your task is to analyze the provided photo and identify which registered students appear in it by comparing faces.

REGISTERED STUDENTS WITH THEIR PROFILE PHOTOS:
${studentsList}

INSTRUCTIONS:
 1. Look at the captured photo carefully to identify faces.
 2. For each face, output a bounding box in normalized coordinates (0..1): x, y, width, height.
 3. Compare each detected face with the profile photos of registered students (accessible via the URLs above).
 4. Only return a match when you can actually compare faces. If you're not sure or can't access the URLs, set match=null.
 5. A match is considered positive when confidence >= 70.
 6. NEVER invent students or faces.

IMPORTANT: Return your analysis as a valid JSON object with this exact structure:
{
  "detected_faces": [
    {
      "face_id": "face_1",
      "box": {"x": 0.1, "y": 0.2, "width": 0.2, "height": 0.25},
      "match": {
        "student_id": "<exact UUID from the student list>",
        "confidence": 0
      } | null
    }
  ],
  "analysis_notes": "<brief description of what you observed>"
}

Only include match objects when confidence >= 60; otherwise use null.
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
        let parsedResult: any;
        try {
          // Clean the response if it has markdown
          const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
          parsedResult = JSON.parse(cleanContent);
        } catch (parseError) {
          console.error("Failed to parse AI response:", content);
          console.error("Parse error:", parseError);
          parsedResult = { detected_faces: [] };
        }

        const rawFaces = Array.isArray(parsedResult.detected_faces) ? parsedResult.detected_faces : [];

        const detectedFaces: DetectedFaceResult[] = rawFaces
          .map((f: any, idx: number) => {
            const box = f?.box ?? {};
            const x = clamp01(box.x);
            const y = clamp01(box.y);
            const width = clamp01(box.width);
            const height = clamp01(box.height);

            // Ignore invalid boxes
            if (width <= 0 || height <= 0) return null;

            const rawMatch = f?.match ?? null;
            const studentId = rawMatch?.student_id ? String(rawMatch.student_id) : null;
            const confidence = Math.round(Number(rawMatch?.confidence ?? 0));

            const isValidStudent = studentId ? studentsById.has(studentId) : false;
            const match: DetectedFaceMatch | null = isValidStudent
              ? {
                  student_id: studentId!,
                  confidence,
                  matched: confidence >= 70,
                }
              : null;

            return {
              face_id: typeof f?.face_id === 'string' ? f.face_id : `face_${idx + 1}`,
              box: { x, y, width, height },
              match,
            };
          })
          .filter(Boolean) as DetectedFaceResult[];

        // Aggregate legacy `results` from face matches (best per student)
        const bestByStudent = new Map<string, FaceComparisonResult>();
        for (const face of detectedFaces) {
          const m = face.match;
          if (!m) continue;

          const student = studentsById.get(m.student_id);
          if (!student) continue;

          const candidate: FaceComparisonResult = {
            student_id: m.student_id,
            student_name: student.name,
            confidence: Math.round(m.confidence || 0),
            matched: !!m.matched,
          };

          const prev = bestByStudent.get(m.student_id);
          if (!prev || candidate.confidence > prev.confidence) {
            bestByStudent.set(m.student_id, candidate);
          }
        }
        const results = Array.from(bestByStudent.values());

        const faceRecognizedCount = detectedFaces.filter((f) => f.match?.matched).length;
        const recognizedCount = results.filter((r) => r.matched).length;
        const unrecognizedCount = Math.max(0, detectedFaces.length - faceRecognizedCount);

        console.log(`Recognition complete: ${recognizedCount} matched, ${unrecognizedCount} unrecognized`);

        return new Response(
          JSON.stringify({
            success: true,
            recognized: recognizedCount > 0,
            results,
            unrecognized_count: unrecognizedCount,
            message: `Recognized ${recognizedCount} student(s)`,
            detected_faces: detectedFaces,
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
