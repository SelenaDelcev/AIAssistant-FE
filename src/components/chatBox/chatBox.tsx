"use client";
import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import styles from "./chatBox.module.css";
import useChatEventSource from "@/hooks/useChatEventSource";
import { ChatMessage, sendMessage } from "@/services/chatService";
import { roles } from "@/consts/rolesConsts";
import { useTranslation } from "react-i18next";

const Chat = forwardRef(({ locale }: { locale: string }, ref) => {
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>("");
  const [suggestQuestions, setSuggestQuestions] = useState<boolean>(false);
  const { t } = useTranslation();

  const { messages, setMessages, getEventSource } = useChatEventSource(
    sessionId,
    locale
  );

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSubmit(input);
    }
  };

  const handleSubmit = async (messageContent: string) => {
    let displayMessage = messageContent;

    if (messageContent.startsWith("Prompt:")) {
      displayMessage = messageContent.replace("Prompt:", "");
    }
  
    if (displayMessage.trim()) {
      setMessages([...messages, { role: roles.user, content: displayMessage }]);
    }

    const newMessage: ChatMessage = {
      role: roles.user,
      content: messageContent.trim(),
    };

    console.log("Nova poruka:", newMessage);
  
    await sendMessage(newMessage, sessionId, suggestQuestions, locale);
    getEventSource();
  };
  

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <Container className={styles.chatContainer}>
      <Paper className={styles.chatPaper}>
        <Box className={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <Box
              sx={{ margin: "1rem 0 1rem 0" }}
              key={index}
              className={
                msg.role === roles.assistant
                  ? styles.botMessage
                  : styles.userMessage
              }
            >
              <Box
                className={
                  msg.role === roles.assistant
                    ? styles.botMessageContent
                    : styles.userMessageContent
                }
              >
                <Typography
                  color={"white"}
                  variant="body1"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </Box>
            </Box>
          ))}
          <Box ref={messagesEndRef} />
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              inputProps={{
                sx: {
                  "&::placeholder": {
                    color: "white",
                  },
                  color: "white",
                  borderRadius: 0,
                },
              }}
              sx={{
                borderRadius: "0.5rem",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.5rem",
                },
              }}
              className={styles.textField}
              fullWidth
              variant="outlined"
              placeholder={t("chatInputPlaceHolder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e)}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              endIcon={<SendIcon />}
              onClick={() => handleSubmit(input)}
            >
              {t("send")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
});

export default Chat;
