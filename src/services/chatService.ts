// services/chatService.ts
import axios from "axios";

export interface ChatMessage {
  role: string;
  content: string;
}

export const sendMessage = async (
  message: ChatMessage,
  sessionId: string,
  suggestQuestions: boolean,
  language: string
) => {
  const response = await axios.post(
    "https://chatappdemobackend.azurewebsites.net/chat",
    {
      message,
      suggest_questions: suggestQuestions,
      language,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Session-ID": sessionId,
      },
      withCredentials: true,
    }
  );

  return response.data;
};
