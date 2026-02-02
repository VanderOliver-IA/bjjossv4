import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FaceComparisonResult {
  student_id: string;
  student_name: string;
  confidence: number;
  matched: boolean;
}

export interface DetectedFaceBox {
  /** Normalized 0..1 */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFaceMatch {
  student_id: string;
  student_name?: string;
  confidence: number;
  matched: boolean;
}

export interface DetectedFaceResult {
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

export function useFacialRecognition() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<FaceComparisonResult[]>([]);
  const { toast } = useToast();

  const recognizeFaces = useCallback(async (
    imageBase64: string,
    ctId: string
  ): Promise<RecognitionResponse | null> => {
    if (!imageBase64 || imageBase64.length < 1000) {
      toast({
        variant: 'destructive',
        title: 'Envie ou tire uma foto',
        description: 'A análise só pode começar após uma imagem real ser enviada ou capturada.',
      });
      return null;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('facial-recognition', {
        body: {
          action: 'recognize',
          image_base64: imageBase64,
          ct_id: ctId,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no reconhecimento',
          description: error.message,
        });
        return null;
      }

      setResults(data.results || []);
      return data as RecognitionResponse;
    } catch (err) {
      console.error('Facial recognition error:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao processar reconhecimento facial',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const registerFace = useCallback(async (
    studentId: string,
    imageBase64: string,
    photoAngle: 'front' | 'left' | 'right'
  ): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('facial-recognition', {
        body: {
          action: 'register',
          student_id: studentId,
          image_base64: imageBase64,
          photo_angle: photoAngle,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar foto',
          description: error.message,
        });
        return false;
      }

      toast({
        title: 'Foto registrada',
        description: 'Foto facial registrada com sucesso!',
      });
      return true;
    } catch (err) {
      console.error('Face registration error:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao registrar foto facial',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const recordAttendance = useCallback(async (
    ctId: string,
    classId: string | undefined,
    recognizedStudents: FaceComparisonResult[],
    visitors: number = 0,
    experimental: number = 0,
    photoUrl?: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('facial-recognition', {
        body: {
          action: 'record_attendance',
          ct_id: ctId,
          class_id: classId || null,
          recognized_students: recognizedStudents.filter(r => r.matched),
          visitors,
          experimental,
          photo_url: photoUrl,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar presença',
          description: error.message,
        });
        return null;
      }

      toast({
        title: 'Presença registrada',
        description: `${recognizedStudents.filter(r => r.matched).length} aluno(s) registrado(s)`,
      });
      return data.attendance_id;
    } catch (err) {
      console.error('Attendance recording error:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao registrar presença',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    isProcessing,
    results,
    recognizeFaces,
    registerFace,
    recordAttendance,
    clearResults,
  };
}
