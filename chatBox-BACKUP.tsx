"use client";
import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { defaultLocale } from "./i18nConfig";

const Chat = () => {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>(
    []
  );

  const [message, setMessage] = useState<
    {
      role: string;
      content: string;
      type: string;
    }[]
  >([]);
  const [input, setInput] = useState("");
  const [suggestQuestions, setSuggestQuestions] = useState(false); //Flag for suggest questions
  const [userSuggestQuestions, setUserSuggestQuestions] = useState([]);

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

  const handleSend = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        { user: true, text: input },
        { user: false, text: "This is a bot response." },
      ]);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const newMessage = {
      role: "user",
      content: input.trim(),
    };

    const response = await axios.post(
      "https://chatappdemobackend.azurewebsites.net/chat",
      {
        message: newMessage,
        suggest_questions: suggestQuestions,
        language: defaultLocale, // send the flag to the backend
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Session-ID": sessionId,
        },
        withCredentials: true,
      }
    );

    const data = response.data;
    console.log("DATA", data);
    setMessage((prevMessage) => [
      ...prevMessage,
      { role: "assistant", content: data.calendly_url, type: "calendly" },
    ]);
  };

  return (
    <Container className={styles.chatContainer}>
      <Paper className={styles.chatPaper}>
        <Box className={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              className={msg.user ? styles.userMessage : styles.botMessage}
            >
              <Box
                className={
                  msg.user
                    ? styles.userMessageContent
                    : styles.botMessageContent
                }
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        {sessionId}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              endIcon={<SendIcon />}
              onClick={(e) => handleSubmit(e)}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Chat;
