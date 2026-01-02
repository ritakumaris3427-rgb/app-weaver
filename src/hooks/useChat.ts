import { useState, useCallback } from 'react';
import { Message, Attachment } from '@/types/chat';

const generateId = () => Math.random().toString(36).substring(2, 15);

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateImageFromPrompt = async (prompt: string): Promise<Attachment | null> => {
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
        throw new Error("Failed to generate image");
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
      return null;
    }
  };

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      attachments: attachments || [],
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Check if user is asking to generate an image
    const lowerContent = content.toLowerCase();
    const isImageGenRequest = lowerContent.includes('generate image') || 
                              lowerContent.includes('create image') ||
                              lowerContent.includes('make image') ||
                              lowerContent.includes('draw') ||
                              lowerContent.includes('generate a picture') ||
                              lowerContent.includes('create a picture');

    if (isImageGenRequest) {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Generating your image...',
        timestamp: new Date(),
        isStreaming: true,
        attachments: [{
          id: generateId(),
          type: 'image',
          url: '',
          isGenerating: true,
        }],
      };

      setMessages(prev => [...prev, assistantMessage]);

      try {
        // Extract the image description from the request
        const imagePrompt = content.replace(/generate\s*(an?\s*)?image\s*(of)?/i, '')
                                   .replace(/create\s*(an?\s*)?image\s*(of)?/i, '')
                                   .replace(/make\s*(an?\s*)?image\s*(of)?/i, '')
                                   .replace(/draw\s*(an?\s*)?(picture\s*of)?/i, '')
                                   .replace(/generate\s*(a\s*)?picture\s*(of)?/i, '')
                                   .replace(/create\s*(a\s*)?picture\s*(of)?/i, '')
                                   .trim() || content;

        const generatedImage = await generateImageFromPrompt(imagePrompt);
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: generatedImage 
                    ? `Here's the image I generated based on your request: "${imagePrompt}"` 
                    : 'Sorry, I couldn\'t generate the image. Please try again.',
                  isStreaming: false,
                  attachments: generatedImage ? [generatedImage] : [],
                }
              : msg
          )
        );
      } catch (error) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: 'Sorry, there was an error generating the image.',
                  isStreaming: false,
                  attachments: [],
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular chat flow
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Build messages array for API, include attachment descriptions
      const apiMessages = [...messages, userMessage].map(msg => {
        let msgContent = msg.content;
        if (msg.attachments && msg.attachments.length > 0) {
          const attachmentDesc = msg.attachments
            .map(a => `[${a.type}: ${a.name || 'unnamed'}]`)
            .join(' ');
          msgContent = `${msgContent} ${attachmentDesc}`.trim();
        }
        return {
          role: msg.role,
          content: msgContent,
        };
      });

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
            }
          } catch { /* ignore */ }
        }
      }

      // Mark streaming complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: assistantContent, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
