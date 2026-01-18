/**
 * Gemini Streaming Utilities
 *
 * Server-Sent Events (SSE) streaming for Next.js API routes
 */

import { GeminiClient } from './client';
import type { GeminiModel } from './client';

/**
 * Stream configuration
 */
export interface StreamConfig {
  model?: GeminiModel;
  systemInstruction?: string;
  temperature?: number;
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (metadata: {
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
    durationMs: number;
  }) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a streaming response for Next.js API routes
 *
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   const { message } = await req.json();
 *
 *   const stream = await createStreamingResponse(message, {
 *     model: 'flash',
 *     systemInstruction: 'You are a helpful AI tutor.',
 *   });
 *
 *   return stream;
 * }
 * ```
 */
export async function createStreamingResponse(
  prompt: string,
  config: StreamConfig = {}
): Promise<Response> {
  const client = new GeminiClient({ model: config.model });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        config.onStart?.();

        const generator = client.generateStream(prompt, {
          model: config.model,
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
        });

        for await (const chunk of generator) {
          config.onToken?.(chunk);

          // Send SSE format: data: {json}\n\n
          const data = JSON.stringify({ token: chunk });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }

        // Get final metadata
        const finalResult = await generator.next();
        if (!finalResult.done && finalResult.value) {
          const metadata = {
            tokensInput: finalResult.value.tokensInput,
            tokensOutput: finalResult.value.tokensOutput,
            costUsd: finalResult.value.costUsd,
            durationMs: finalResult.value.durationMs,
          };

          config.onComplete?.(metadata);

          // Send metadata as final event
          const metadataData = JSON.stringify({
            type: 'metadata',
            ...metadata,
          });
          controller.enqueue(encoder.encode(`data: ${metadataData}\n\n`));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        config.onError?.(errorObj);

        const errorData = JSON.stringify({
          type: 'error',
          error: errorObj.message,
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Client-side hook to consume SSE stream
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useGeminiStream('/api/chat', {
 *   message: 'Hello',
 * });
 * ```
 */
export async function consumeStream(
  url: string,
  body: any,
  callbacks: {
    onToken?: (token: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  let fullText = '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete?.(fullText);
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            callbacks.onComplete?.(fullText);
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'error') {
              callbacks.onError?.(parsed.error);
              return;
            }

            if (parsed.type === 'metadata') {
              // Handle metadata if needed
              continue;
            }

            if (parsed.token) {
              fullText += parsed.token;
              callbacks.onToken?.(parsed.token);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    callbacks.onError?.(message);
  }
}

/**
 * React hook for streaming (client-side)
 */
export interface UseStreamOptions {
  url: string;
  body?: any;
  auto?: boolean;
}

export interface UseStreamReturn {
  text: string;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  reset: () => void;
}

/**
 * Simple streaming state manager (non-React)
 */
export class StreamManager {
  private text = '';
  private isLoading = false;
  private error: string | null = null;
  private listeners: Set<(state: UseStreamReturn) => void> = new Set();

  subscribe(listener: (state: UseStreamReturn) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state: UseStreamReturn = {
      text: this.text,
      isLoading: this.isLoading,
      error: this.error,
      start: this.start.bind(this),
      reset: this.reset.bind(this),
    };
    this.listeners.forEach((listener) => listener(state));
  }

  async start(url: string, body: any) {
    this.isLoading = true;
    this.error = null;
    this.text = '';
    this.notify();

    await consumeStream(url, body, {
      onToken: (token) => {
        this.text += token;
        this.notify();
      },
      onComplete: () => {
        this.isLoading = false;
        this.notify();
      },
      onError: (error) => {
        this.error = error;
        this.isLoading = false;
        this.notify();
      },
    });
  }

  reset() {
    this.text = '';
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  getState(): UseStreamReturn {
    return {
      text: this.text,
      isLoading: this.isLoading,
      error: this.error,
      start: this.start.bind(this),
      reset: this.reset.bind(this),
    };
  }
}
