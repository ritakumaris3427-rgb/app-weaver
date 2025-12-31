import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock AI responses for demo (will be replaced with real AI)
const mockResponses = [
  "I understand you're looking to build something impressive. Let me help you architect a solution that's both scalable and maintainable.\n\n**Key considerations:**\n\n1. **Architecture**: Use a modular component structure\n2. **Performance**: Implement lazy loading and code splitting\n3. **UX**: Focus on responsive design and smooth animations\n\n```typescript\n// Example component structure\ninterface ComponentProps {\n  data: DataType;\n  onAction: () => void;\n}\n```\n\nWould you like me to elaborate on any of these points?",
  
  "Great question! Here's how I'd approach this:\n\n## Solution Overview\n\nThe key is to break down the problem into manageable pieces. Let's start with the core functionality:\n\n```javascript\nconst handleSubmit = async (data) => {\n  try {\n    const result = await processData(data);\n    return { success: true, data: result };\n  } catch (error) {\n    console.error('Processing failed:', error);\n    return { success: false, error: error.message };\n  }\n};\n```\n\n### Next Steps\n- Implement error boundaries\n- Add loading states\n- Write unit tests\n\nLet me know if you need more details on any step.",

  "I'll help you build this properly. Here's a production-ready approach:\n\n**Database Schema:**\n```sql\nCREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n```\n\n**API Endpoint:**\n```typescript\nexport async function POST(req: Request) {\n  const body = await req.json();\n  // Validate input\n  // Process request\n  // Return response\n}\n```\n\nThis ensures type safety, proper error handling, and follows REST best practices.",
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate streaming response
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Get random mock response
    const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Simulate streaming by adding characters progressively
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < responseText.length) {
        const chunkSize = Math.floor(Math.random() * 5) + 1;
        currentIndex = Math.min(currentIndex + chunkSize, responseText.length);
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: responseText.substring(0, currentIndex) }
              : msg
          )
        );
      } else {
        clearInterval(streamInterval);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    }, 15);

  }, [isLoading]);

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
