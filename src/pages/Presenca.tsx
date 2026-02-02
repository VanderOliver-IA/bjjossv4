import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/DevAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFacialRecognition, type DetectedFaceBox, type DetectedFaceResult } from '@/hooks/useFacialRecognition';

type PresenceStep = 'select' | 'capture' | 'processing' | 'results' | 'confirm';
type CaptureMode = 'camera' | 'upload';
type UnknownFaceDecision = 'recognized' | 'pending' | 'visitor' | 'experimental' | 'new_student' | 'professor' | 'ignore';

interface TrainingClass {
  id: string;
  name: string;
  schedule: string | null;
  time_start: string | null;
  time_end: string | null;
}

interface RecognizedFace {
  student_id: string;
  student_name: string;
  confidence: number;
  matched: boolean;
  belt?: string;
  photo_url?: string;
}

interface DetectedFaceUI {
  face_id: string;
  box: DetectedFaceBox;
  thumbnail_url: string | null;
  match: RecognizedFace | null;
  decision: UnknownFaceDecision;
}

async function cropFaceFromDataUrl(dataUrl: string, box: DetectedFaceBox): Promise<string | null> {
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const sx = Math.max(0, Math.min(img.width, Math.round(box.x * img.width)));
    const sy = Math.max(0, Math.min(img.height, Math.round(box.y * img.height)));
    const sw = Math.max(1, Math.min(img.width - sx, Math.round(box.width * img.width)));
    const sh = Math.max(1, Math.min(img.height - sy, Math.round(box.height * img.height)));

    const canvas = document.createElement('canvas');
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

const Presenca = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isProcessing, recognizeFaces, recordAttendance } = useFacialRecognition();
  
  const ctId = profile?.ct_id;
  
  const [step, setStep] = useState<PresenceStep>('select');
  const [captureMode, setCaptureMode] = useState<CaptureMode | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFaceUI[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!ctId) return;
      
      const { data, error } = await supabase
        .from('training_classes')
        .select('id, name, schedule, time_start, time_end')
        .eq('ct_id', ctId)
        .eq('active', true);
      
      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }
      
      setClasses(data || []);
    };
    
    fetchClasses();
  }, [ctId]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao acessar câmera',
        description: 'Verifique as permissões do navegador.',
      });
      setIsCameraActive(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    if (!video.videoWidth || !video.videoHeight) {
      toast({
        variant: 'destructive',
        title: 'Câmera ainda não pronta',
        description: 'Aguarde 1 segundo e tente capturar novamente.',
      });
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = imageData.split(',')[1];
    setCapturedImage(imageData);
    stopCamera();
    
    return base64;
  }, [stopCamera, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = async (imageBase64: string) => {
    if (!ctId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'CT não identificado.',
      });
      return;
    }

    if (!imageBase64 || imageBase64.length < 1000) {
      toast({
        variant: 'destructive',
        title: 'Envie ou tire uma foto',
        description: 'A análise só pode começar após uma imagem real ser enviada ou capturada.',
      });
      return;
    }

    setStep('processing');
    setProcessingProgress(0);

    // UI stages (sem iniciar análise automaticamente; só entra aqui após captura/envio)
    const stages = [
      { progress: 20, text: 'Otimizando imagem...' },
      { progress: 40, text: 'Enviando para análise...' },
      { progress: 60, text: 'Detectando rostos...' },
      { progress: 75, text: 'Exibindo rostos detectados...' },
      { progress: 90, text: 'Comparando com alunos cadastrados...' },
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setProcessingProgress(stages[stageIndex].progress);
        setProcessingStage(stages[stageIndex].text);
        stageIndex++;
      }
    }, 1000);

    try {
      const response = await recognizeFaces(imageBase64, ctId);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setProcessingStage('Concluído!');

      if (response) {
        const studentIds = Array.from(new Set((response.results || []).map(r => r.student_id).filter(Boolean)));
        const { data: studentsInfo } = studentIds.length
          ? await supabase
              .from('students')
              .select('id, belt, photo_front')
              .in('id', studentIds)
          : { data: [] as any[] };

        const enrichedResults: RecognizedFace[] = (response.results || []).map(result => {
          const studentInfo = studentsInfo?.find(s => s.id === result.student_id);
          return {
            ...result,
            belt: studentInfo?.belt || '',
            photo_url: studentInfo?.photo_front || '',
          };
        });

        setRecognizedFaces(enrichedResults);

        // Prefer per-face payload when available
        if (capturedImage && Array.isArray(response.detected_faces) && response.detected_faces.length > 0) {
          const faceUI: DetectedFaceUI[] = await Promise.all(
            response.detected_faces.map(async (f: DetectedFaceResult) => {
              const matchFromResults = f.match
                ? enrichedResults.find(r => r.student_id === f.match?.student_id) || null
                : null;

              const thumbnail = await cropFaceFromDataUrl(capturedImage, f.box);

              const match: RecognizedFace | null = matchFromResults
                ? matchFromResults
                : f.match
                  ? {
                      student_id: f.match.student_id,
                      student_name: enrichedResults.find(r => r.student_id === f.match?.student_id)?.student_name || 'Possível match',
                      confidence: Math.round(f.match.confidence || 0),
                      matched: !!f.match.matched,
                    }
                  : null;

              return {
                face_id: f.face_id,
                box: f.box,
                thumbnail_url: thumbnail,
                match,
                decision: match?.matched ? 'recognized' : 'pending',
              };
            })
          );

          setDetectedFaces(faceUI);

          const unrecognized = faceUI.filter(f => !f.match?.matched).length;
          setUnrecognizedCount(unrecognized);
        } else {
          setDetectedFaces([]);
          setUnrecognizedCount(response.unrecognized_count || 0);
        }

        setTimeout(() => setStep('results'), 300);
      } else {
        setStep('select');
        setCapturedImage(null);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no processamento',
        description: 'Falha ao processar a imagem. Tente novamente.',
      });
      setStep('select');
      setCapturedImage(null);
    }
  };

  const handleCaptureAndProcess = () => {
    const base64 = capturePhoto();
    if (base64) {
      processImage(base64);
    }
  };

  const handleUploadAndProcess = () => {
    if (!capturedImage) return;
    const base64 = capturedImage.split(',')[1];
    processImage(base64);
  };

  const handleConfirmAttendance = async () => {
    if (!ctId) return;

    const matchedStudents = recognizedFaces.filter(f => f.matched);

    const visitors = detectedFaces.filter(f => f.decision === 'visitor').length;
    const experimental = detectedFaces.filter(f => f.decision === 'experimental').length;
    
    const attendanceId = await recordAttendance(
      ctId,
      selectedClass && selectedClass !== 'none' ? selectedClass : undefined,
      matchedStudents,
      visitors,
      experimental,
      capturedImage || undefined
    );

    if (attendanceId) {
      setStep('confirm');
    }
  };

  const resetFlow = () => {
    setStep('select');
    setSelectedClass('');
    setCaptureMode(null);
    setCapturedImage(null);
    setRecognizedFaces([]);
    setUnrecognizedCount(0);
    setDetectedFaces([]);
    stopCamera();
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Envie ou tire uma foto para iniciar a análise.
          </p>
        </CardContent>
      </Card>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Turma (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma turma..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem turma específica</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.time_start && cls.time_end ? `- ${cls.time_start} às ${cls.time_end}` : cls.schedule ? `- ${cls.schedule}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Capture Options */}
      <div className="flex flex-col md:flex-row gap-3">
        <Button
          className="gap-2 justify-center"
          onClick={() => {
            setCaptureMode('camera');
            startCamera();
          }}
        >
          <Camera className="h-4 w-4" />
          Tirar foto
        </Button>
        <Button
          variant="secondary"
          className="gap-2 justify-center"
          onClick={() => {
            setCaptureMode('upload');
            fileInputRef.current?.click();
          }}
        >
          <Upload className="h-4 w-4" />
          Enviar foto
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Preview */}
      {isCameraActive && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={stopCamera}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleCaptureAndProcess} className="gap-2">
                <Camera className="h-4 w-4" />
                Capturar e Analisar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Preview */}
      {capturedImage && captureMode === 'upload' && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={capturedImage}
                alt="Foto enviada"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setCapturedImage(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleUploadAndProcess} className="gap-2">
                <Users className="h-4 w-4" />
                Analisar Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderProcessingStep = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Processando Imagem</h3>
        <p className="text-muted-foreground mb-6">{processingStage}</p>
        <Progress value={processingProgress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">{processingProgress}%</p>
      </CardContent>
    </Card>
  );

  const renderResultsStep = () => {
    const matchedFaces = recognizedFaces.filter(f => f.matched);
    const lowConfidenceFaces = recognizedFaces.filter(f => !f.matched);

    const counts = {
      detected: detectedFaces.length,
      recognized: detectedFaces.filter(f => f.match?.matched).length,
      pending: detectedFaces.filter(f => !f.match?.matched && f.decision === 'pending').length,
      visitors: detectedFaces.filter(f => f.decision === 'visitor').length,
      experimental: detectedFaces.filter(f => f.decision === 'experimental').length,
      ignored: detectedFaces.filter(f => f.decision === 'ignore').length,
    };

    const canFinalize = counts.pending === 0;

    return (
      <div className="space-y-6">
        {/* Summary */}
        {detectedFaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{counts.detected}</p>
                  <p className="text-xs text-muted-foreground">Rostos detectados</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-2xl font-bold text-success">{counts.recognized}</p>
                  <p className="text-xs text-muted-foreground">Reconhecidos</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-2xl font-bold text-warning">{counts.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{counts.visitors + counts.experimental}</p>
                  <p className="text-xs text-muted-foreground">Classificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captured Image */}
        {capturedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Foto Analisada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Foto analisada"
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detected faces (per-face, never invented) */}
        {detectedFaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rostos detectados ({detectedFaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detectedFaces.map((face) => {
                  const isRecognized = !!face.match?.matched;

                  return (
                    <div
                      key={face.face_id}
                      className={
                        isRecognized
                          ? 'rounded-lg border border-success/20 bg-success/5 p-3'
                          : 'rounded-lg border border-warning/20 bg-warning/5 p-3'
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                          {face.thumbnail_url ? (
                            <img
                              src={face.thumbnail_url}
                              alt="Rosto detectado"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {isRecognized ? face.match?.student_name : 'Não reconhecido'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isRecognized
                              ? `Confiança: ${face.match?.confidence ?? 0}%`
                              : face.match
                                ? `Possível match: ${face.match.student_name} (${face.match.confidence}%)`
                                : 'Sem match sugerido'}
                          </p>
                          {isRecognized && face.match?.belt && (
                            <p className="text-xs text-muted-foreground capitalize">Faixa: {face.match.belt}</p>
                          )}
                        </div>
                      </div>

                      {!isRecognized && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={face.decision === 'visitor' ? 'default' : 'outline'}
                            onClick={() =>
                              setDetectedFaces((prev) =>
                                prev.map((p) =>
                                  p.face_id === face.face_id ? { ...p, decision: 'visitor' } : p
                                )
                              )
                            }
                          >
                            Visitante
                          </Button>
                          <Button
                            size="sm"
                            variant={face.decision === 'experimental' ? 'default' : 'outline'}
                            onClick={() =>
                              setDetectedFaces((prev) =>
                                prev.map((p) =>
                                  p.face_id === face.face_id ? { ...p, decision: 'experimental' } : p
                                )
                              )
                            }
                          >
                            Experimental
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDetectedFaces((prev) =>
                                prev.map((p) =>
                                  p.face_id === face.face_id ? { ...p, decision: 'ignore' } : p
                                )
                              )
                            }
                          >
                            Ignorar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recognized (legacy / quick view) */}
        {matchedFaces.length > 0 && detectedFaces.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Alunos Reconhecidos ({matchedFaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {matchedFaces.map((face, index) => (
                  <div 
                    key={face.student_id || index} 
                    className="text-center p-3 rounded-lg bg-success/5 border border-success/20"
                  >
                    {face.photo_url && (
                      <img 
                        src={face.photo_url} 
                        alt={face.student_name}
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
                      />
                    )}
                    <p className="font-medium text-sm truncate">{face.student_name}</p>
                    {face.belt && (
                      <p className="text-xs text-muted-foreground capitalize">{face.belt}</p>
                    )}
                    <Badge className="mt-2 bg-success/10 text-success text-xs">
                      {face.confidence}% confiança
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Confidence Faces (legacy) */}
        {lowConfidenceFaces.length > 0 && detectedFaces.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                Baixa Confiança ({lowConfidenceFaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lowConfidenceFaces.map((face, index) => (
                  <div 
                    key={face.student_id || index} 
                    className="p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <p className="font-medium text-sm">{face.student_name}</p>
                    <Badge variant="outline" className="mt-2 text-warning text-xs">
                      {face.confidence}% confiança
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unknown Faces (legacy) */}
        {unrecognizedCount > 0 && detectedFaces.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                Rostos Não Identificados ({unrecognizedCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Foram detectados {unrecognizedCount} rosto(s) que não correspondem a nenhum aluno cadastrado.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline">
                  Marcar como Visitante
                </Button>
                <Button size="sm" variant="outline">
                  Marcar como Experimental
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No matches at all */}
        {matchedFaces.length === 0 && lowConfidenceFaces.length === 0 && detectedFaces.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-warning mb-4" />
              <h3 className="font-semibold mb-2">Nenhum aluno reconhecido</h3>
              <p className="text-sm text-muted-foreground">
                Não foi possível identificar nenhum aluno cadastrado na foto.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetFlow}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nova Captura
          </Button>
          {(matchedFaces.length > 0 || detectedFaces.length > 0) && (
            <Button 
              onClick={handleConfirmAttendance} 
              disabled={isProcessing || !canFinalize}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Finalizar registro de presença
            </Button>
          )}
        </div>

        {detectedFaces.length > 0 && !canFinalize && (
          <p className="text-sm text-muted-foreground text-center">
            Existem rostos pendentes. Marque cada rosto como Visitante, Experimental ou Ignorar.
          </p>
        )}
      </div>
    );
  };

  const renderConfirmStep = () => {
    const matchedCount = recognizedFaces.filter(f => f.matched).length;
    const visitors = detectedFaces.filter(f => f.decision === 'visitor').length;
    const experimental = detectedFaces.filter(f => f.decision === 'experimental').length;

    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Presença Registrada!</h3>
          <p className="text-muted-foreground mb-6">
            Os registros foram salvos com sucesso.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-2xl font-bold text-success">{matchedCount}</p>
              <p className="text-xs text-muted-foreground">Presentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{visitors + experimental}</p>
              <p className="text-xs text-muted-foreground">Classificados</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{matchedCount + visitors + experimental}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          <Button onClick={resetFlow}>
            Finalizar
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrar Presença</h1>
        <p className="text-muted-foreground">Use o reconhecimento facial para registrar presenças automaticamente</p>
      </div>

      {step === 'select' && renderSelectStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'results' && renderResultsStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
};

export default Presenca;
