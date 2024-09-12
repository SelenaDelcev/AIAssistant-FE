import { useState, useCallback } from "react";
import { roles } from "@/consts/rolesConsts";

type chatResponseType = {
  role: string;
  content: string;
  type?: string;
};

const useChatEventSource = (sessionId: string, defaultLocale: string) => {
  const [messages, setMessages] = useState<chatResponseType[]>([]);

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
    const eventSource = new EventSource(
      `https://chatappdemobackend.azurewebsites.net/chat/stream?session_id=${sessionId}`,
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

      if (data.suggested_questions) {
        console.log(data.suggested_questions);
      }

      const filteredContent =
        defaultLocale === "en"
          ? content.replace(/Suggested questions:.*(?:\n|$)/g, "")
          : content.replace(/Predložena pitanja:.*(?:\n|$)/g, "");

      if (!content.endsWith("▌")) {
        eventSource.close();
        updateLastMessage({
          role: roles.assistant,
          content: filteredContent.replace("▌", ""),
        });
      }

      updateLastMessage({ role: roles.assistant, content: filteredContent });
    };

    eventSource.onerror = (event) => {
      console.error("EventSource failed.", event);
      eventSource.close();
    };
  }, [sessionId, defaultLocale, updateLastMessage]);

  return { messages, setMessages, getEventSource };
};

export default useChatEventSource;
