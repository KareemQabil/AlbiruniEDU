/**
 * Message Bubble Component
 *
 * Displays individual chat messages with glass morphism design
 */

'use client';

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage } from '@/lib/agents/base/types';

interface MessageBubbleProps {
  message: ChatMessage;
  agentName?: string;
  className?: string;
}

export function MessageBubble({ message, agentName, className }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'agent';
  const isSystem = message.role === 'system';

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        isUser && 'items-end',
        isAgent && 'items-start',
        isSystem && 'items-center',
        className
      )}
      dir="rtl"
    >
      {/* Agent name badge */}
      {isAgent && agentName && (
        <Badge variant="secondary" className="text-xs">
          {agentName}
        </Badge>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          'transition-all duration-200',
          isUser &&
            'bg-primary text-primary-foreground',
          isAgent && 'glass',
          isSystem && 'glass-dark text-muted-foreground text-sm max-w-[60%]'
        )}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words text-start">
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'mt-2 text-xs opacity-70 text-end',
            isUser && 'text-primary-foreground/80',
            isAgent && 'text-muted-foreground'
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * Format timestamp in Arabic
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${ampm}`;
}
