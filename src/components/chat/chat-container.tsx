/**
 * Chat Container Component
 *
 * Main chat interface with message history and input
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage } from '@/lib/agents/base/types';

interface ChatContainerProps {
  userId: string;
  sessionId?: string;
  dialect?: 'MSA' | 'Egyptian' | 'Gulf' | 'Levantine' | 'Maghrebi';
  className?: string;
}

export function ChatContainer({
  userId,
  sessionId,
  dialect = 'MSA',
  className,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message: string) => {
    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          sessionId,
          dialect,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      const data = await response.json();

      // Add agent response to history
      const agentMessage: ChatMessage = {
        role: 'agent',
        content: data.message.content,
        timestamp: new Date(data.message.timestamp),
        agentId: data.message.agentId,
        metadata: {
          agentName: data.message.agentName,
          visualizations: data.visualizations,
          questions: data.questions,
          usage: data.usage,
        },
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError((err as Error).message);

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'system',
        content: `حدث خطأ: ${(err as Error).message}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'glass rounded-3xl border border-border/50',
        className
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
          <h2 className="text-lg font-semibold">البيروني</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? 'يكتب...' : 'متصل'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="text-6xl">🌟</div>
              <h3 className="text-2xl font-bold">مرحباً بك في البيروني!</h3>
              <p className="text-muted-foreground max-w-md">
                أنا هنا لمساعدتك في التعلم من خلال 18 وكيلاً ذكياً متخصصاً.
                اسألني أي سؤال في الرياضيات، العلوم، البرمجة، أو أي موضوع تعليمي!
              </p>
            </div>
          )}

          {/* Message history */}
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              agentName={msg.metadata?.agentName as string}
            />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loading size="sm" />
              <span className="text-sm">جارٍ التفكير...</span>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/50">
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-6 py-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
