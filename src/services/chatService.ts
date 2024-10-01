// services/chatService.ts
import axios from "axios";

export interface ChatMessage {
  role: string;
  content: string;
  files: File[];
}

export const sendMessage = async (
  message: ChatMessage,
  sessionId: string,
  language: string,
  audioResponse: boolean
) => {
  const response = await axios.post(
    "http://localhost:8000/chat",
    {
      message,
      language,
      play_audio_response: audioResponse,
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

export const transcribeAudio = async (formData: FormData, sessionId: string) => {
  try {
    const response = await axios.post('http://localhost:8000/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Session-ID': sessionId,
      },
    });
    return response.data.transcript;
  } catch (error) {
    console.error("Error during audio transcription:", error);
    throw error;
  }
};

export const handleFileSubmit = async (newMessage: ChatMessage, sessionId: string) => {
  const formData = new FormData();

  newMessage.files.forEach(file => formData.append('files', file));

  formData.append('message', newMessage.content);

  console.log("FORM DATA>>>", formData)

  try {
    const response = await axios.post(
      "http://localhost:8000/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Session-ID": sessionId,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error; 
  }
};

