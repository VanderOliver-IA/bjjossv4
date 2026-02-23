import imageCompression from 'browser-image-compression';
import { supabase } from '@/integrations/supabase/client';

export async function optimizeAndUpload(file: File, path: string): Promise<string | null> {
  const options = { 
    maxSizeMB: 0.5, 
    maxWidthOrHeight: 800, 
    useWebWorker: true 
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    const { data, error } = await supabase.storage
      .from('students-photos')
      .upload(path, compressedFile, { upsert: true });

    if (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('students-photos')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro na compressão de imagem:', error);
    return null;
  }
}
