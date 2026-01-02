import { useState, useCallback } from 'react';
import { Attachment } from '@/types/chat';

const generateId = () => Math.random().toString(36).substring(2, 15);

const IMAGE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export function useMediaGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async (prompt: string): Promise<Attachment | null> => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(IMAGE_GEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const data = await response.json();
      
      return {
        id: generateId(),
        type: 'image',
        url: data.imageUrl,
        name: `Generated: ${prompt.slice(0, 30)}...`,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        resolve({
          id: generateId(),
          type,
          url: reader.result as string,
          name: file.name,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  return {
    isGenerating,
    generateImage,
    uploadFile,
  };
}
