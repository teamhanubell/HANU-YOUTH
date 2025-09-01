import { ReactNode } from 'react';

declare module './chat-client' {
  interface ChatClientProps {
    children?: ReactNode;
    // Add any other props your ChatClient component accepts
  }

  const ChatClient: React.FC<ChatClientProps>;
  export default ChatClient;
}
