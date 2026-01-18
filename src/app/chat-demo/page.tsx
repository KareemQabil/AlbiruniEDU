/**
 * Chat Demo Page
 *
 * Test the chat interface with all agents
 */

import { ChatContainer } from '@/components/chat';

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
      <div className="container mx-auto max-w-4xl h-[calc(100vh-2rem)]">
        <ChatContainer userId="demo-user" dialect="MSA" />
      </div>
    </div>
  );
}
