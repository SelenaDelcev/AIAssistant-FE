import { useState, useCallback } from "react";
import { roles } from "@/consts/rolesConsts";
type chatResponseType = {
  role: string;
  content: string;
  files?: File[];
};
const useChatEventSource = (sessionId: string, defaultLocale: string, handleAudioResponse: (audioBase64: string) => void) => {
  const [messages, setMessages] = useState<chatResponseType[]>([]);
  const [isAssistantResponding, setIsAssistantResponding] = useState<boolean>(false);

  const updateLastMessage = useCallback((newMessage: chatResponseType) => {
    setMessages((prevMessages) => {
      const lastIndex = prevMessages.length - 1;
      if (
        prevMessages[lastIndex] &&
        prevMessages[lastIndex].role === roles.assistant
      ) {
        const updatedMessages = [...prevMessages];
        updatedMessages[lastIndex] = newMessage;
        return updatedMessages;
      }
      return [...prevMessages, newMessage];
    });
  }, []);
  const getEventSource = useCallback(() => {
    setIsAssistantResponding(true);
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_CHAT_BE_URL}/chat/stream?session_id=${sessionId}`,
      {
        withCredentials: true,
      }
    );
    eventSource.onopen = () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: roles.assistant, content: "" },
      ]);
    };
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const content = data.content;

      if (data.audio) {
        handleAudioResponse(data.audio);
      }

      if (!content.endsWith("▌")) {
        eventSource.close();
        updateLastMessage({
          role: roles.assistant,
          content: content.replace("▌", ""),
        });
        setIsAssistantResponding(false);
      }
      updateLastMessage({ role: roles.assistant, content: content });
    };
    eventSource.onerror = (event) => {
      console.error("EventSource failed.", event);
      eventSource.close();
      setIsAssistantResponding(false);
    };
  }, [sessionId, defaultLocale, updateLastMessage, handleAudioResponse]);
  return { messages, setMessages, getEventSource, isAssistantResponding };
};
export default useChatEventSource;