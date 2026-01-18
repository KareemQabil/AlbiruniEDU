/**
 * Message Input Component
 *
 * Arabic-first input for sending chat messages
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'اكتب سؤالك هنا...',
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div
      className={cn(
        'glass rounded-2xl p-3 shadow-lg',
        'border border-border/50',
        className
      )}
      dir="rtl"
    >
      <div className="flex gap-2 items-end">
        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none',
            'min-h-[44px] max-h-[200px]',
            'text-base leading-relaxed',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ direction: 'rtl' }}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="shrink-0 h-11 w-11 rounded-xl"
        >
          <SendIcon className="h-5 w-5" />
          <span className="sr-only">إرسال</span>
        </Button>
      </div>

      {/* Hint text */}
      <div className="mt-2 text-xs text-muted-foreground text-start">
        اضغط <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> للإرسال
        • <kbd className="px-1.5 py-0.5 rounded bg-muted">Shift+Enter</kbd> لسطر جديد
      </div>
    </div>
  );
}

/**
 * Send icon (arrow)
 */
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
