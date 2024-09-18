"use client";
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Container, Box, Button, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import styles from "./chatBox.module.css";
import { roles } from "@/consts/rolesConsts";
import { useTranslation } from "react-i18next";

const Chat = forwardRef(({ locale }: { locale: string }, ref) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [apiKey] = useState<string>(process.env.NEXT_PUBLIC_OPENAI_API_KEY || "");
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      sessionStorage.setItem("sessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (messageContent: string) => {
    if (!messageContent.trim()) return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: messageContent },
    ]);
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant", 
            content: msg.content,
          })),
          { role: 'user', content: messageContent },
        ],
        temperature: 0.0
      });
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: completion.choices[0].message.content },
      ]);
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
    } 
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <Container className={styles.chatContainer}>
      <Box className={styles.messages}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            className={styles.message}
          >
            <Box
              className={msg.role === roles.assistant ? styles.messageAssistant : styles.messageUser}      
            >
              <Typography
                color={"white"}
                variant="body1"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      <Box className={styles.inputRowContainer}>
        <form className={styles.messageInput} onSubmit={(e) => { e.preventDefault(); handleSubmit(input); setInput(""); }}>
          <Box className={styles.inputContainer}>
            <input
              type="text"
              className={styles.inputField}
              placeholder='Kako mogu da ti pomognem?'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" className={styles.sendButton}>
              <SendIcon />
            </Button>
          </Box>
        </form>
      </Box>
      <Box ref={messagesEndRef} />
    </Container>
  );
  
});

Chat.displayName = "Chat";

export default Chat;
