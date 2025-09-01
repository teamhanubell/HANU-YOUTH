import { languages } from "../../i18n/settings";
import { ChatClient } from "./chat-client";

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

export default function ChatPage() {
  return <ChatClient />;
}
