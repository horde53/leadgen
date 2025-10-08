import { supabase } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Faz upload de um arquivo para o bucket 'energy-bills' do Supabase
 * @param file - Arquivo a ser enviado
 * @param leadId - ID do lead (para organizar os arquivos)
 * @returns Promise com resultado do upload
 */
export async function uploadEnergyBill(
  file: File, 
  leadId: string
): Promise<UploadResult> {
  try {
    // Validar tamanho do arquivo (máx. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'Arquivo muito grande! Tamanho máximo permitido: 10MB'
      };
    }

    // Validar tipo do arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo não permitido! Use PDF, JPG ou PNG.'
      };
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${leadId}_${Date.now()}.${fileExtension}`;
    const filePath = `leads/${fileName}`;

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage
      .from('energy-bills')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: `Erro no upload: ${error.message}`
      };
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('energy-bills')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return {
      success: false,
      error: 'Erro inesperado durante o upload'
    };
  }
}

/**
 * Remove um arquivo do storage
 * @param filePath - Caminho do arquivo no storage
 * @returns Promise com resultado da remoção
 */
export async function deleteEnergyBill(filePath: string): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage
      .from('energy-bills')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      return {
        success: false,
        error: `Erro ao deletar arquivo: ${error.message}`
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Erro inesperado ao deletar arquivo:', error);
    return {
      success: false,
      error: 'Erro inesperado ao deletar arquivo'
    };
  }
}

/**
 * Obtém URL pública de um arquivo
 * @param filePath - Caminho do arquivo no storage
 * @returns URL pública do arquivo
 */
export function getEnergyBillUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('energy-bills')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

