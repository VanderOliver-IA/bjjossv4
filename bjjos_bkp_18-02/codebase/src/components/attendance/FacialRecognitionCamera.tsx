import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, CheckCircle, XCircle, UserPlus, Users } from 'lucide-react';
import { useFacialRecognition } from '@/hooks/useFacialRecognition';
import { cn } from '@/lib/utils';

interface FacialRecognitionCameraProps {
  ctId: string;
  classId?: string;
  mode: 'recognition' | 'registration';
  studentId?: string;
  photoAngle?: 'front' | 'left' | 'right';
  onRecognitionComplete?: (results: any[]) => void;
  onRegistrationComplete?: () => void;
}

const FacialRecognitionCamera = ({
  ctId,
  classId,
  mode,
  studentId,
  photoAngle = 'front',
  onRecognitionComplete,
  onRegistrationComplete,
}: FacialRecognitionCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const {
    isProcessing,
    results,
    recognizeFaces,
    registerFace,
    recordAttendance,
    clearResults,
  } = useFacialRecognition();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedImage(null);
      clearResults();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [clearResults]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = imageData.split(',')[1];
    setCapturedImage(imageData);
    
    return base64;
  }, []);

  const handleCapture = useCallback(async () => {
    const imageBase64 = captureImage();
    if (!imageBase64) return;

    if (mode === 'recognition') {
      const response = await recognizeFaces(imageBase64, ctId);
      if (response && onRecognitionComplete) {
        onRecognitionComplete(response.results);
      }
    } else if (mode === 'registration' && studentId) {
      const success = await registerFace(studentId, imageBase64, photoAngle);
      if (success && onRegistrationComplete) {
        onRegistrationComplete();
      }
    }
  }, [captureImage, mode, ctId, studentId, photoAngle, recognizeFaces, registerFace, onRecognitionComplete, onRegistrationComplete]);

  const handleRecordAttendance = useCallback(async () => {
    if (!classId || results.length === 0) return;

    await recordAttendance(
      ctId,
      classId,
      results,
      0, // visitors
      0, // experimental
      capturedImage || undefined
    );

    stopCamera();
    clearResults();
  }, [classId, ctId, results, capturedImage, recordAttendance, stopCamera, clearResults]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'recognition' ? (
            <>
              <Users className="h-5 w-5" />
              Reconhecimento Facial - Presença
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              Cadastro de Foto Facial
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera / Image Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {isCameraActive ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Camera className="h-16 w-16 opacity-50" />
            </div>
          )}
          
          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Processando...</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!isCameraActive ? (
            <Button onClick={startCamera} className="gap-2">
              <Camera className="h-4 w-4" />
              Iniciar Câmera
            </Button>
          ) : (
            <>
              <Button onClick={handleCapture} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {mode === 'recognition' ? 'Reconhecer' : 'Capturar'}
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Parar Câmera
              </Button>
            </>
          )}
        </div>

        {/* Recognition Results */}
        {mode === 'recognition' && results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Alunos Reconhecidos:</h4>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    result.matched 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-secondary/50 border-secondary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {result.matched ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{result.student_name}</span>
                  </div>
                  <Badge variant={result.matched ? 'default' : 'secondary'}>
                    {result.confidence}% confiança
                  </Badge>
                </div>
              ))}
            </div>

            {classId && (
              <Button
                onClick={handleRecordAttendance}
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Registrar Presença ({results.filter(r => r.matched).length} alunos)
              </Button>
            )}
          </div>
        )}

        {/* Registration Instructions */}
        {mode === 'registration' && (
          <div className="text-center text-sm text-muted-foreground">
            {photoAngle === 'front' && 'Posicione o rosto de frente para a câmera'}
            {photoAngle === 'left' && 'Vire levemente para o lado esquerdo'}
            {photoAngle === 'right' && 'Vire levemente para o lado direito'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialRecognitionCamera;
