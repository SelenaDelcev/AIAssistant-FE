"use client";
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { 
  Container, 
  Box, 
  Button, 
  Typography, 
  Tooltip, 
  SpeedDialIcon,
  SpeedDial,
  SpeedDialAction,
  Chip,
  Avatar, } from "@mui/material";
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  AttachFileSharp as AttachFileSharpIcon,
  SaveAltSharp as SaveAltSharpIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  VolumeUp as VolumeUpIcon,
  KeyboardVoice as KeyboardVoiceIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import styles from "./chatBox.module.css";
import { roles } from "@/consts/rolesConsts";
import { useTranslation } from "react-i18next";
import { ChatMessage, sendMessage, transcribeAudio, handleFileSubmit } from "@/services/chatService";
import useChatEventSource from "@/hooks/useChatEventSource";

const Chat = forwardRef(({ locale }: { locale: string }, ref) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [userMessage, setUserMessage] = useState<string>("");
  const [apiKey] = useState<string>(process.env.NEXT_PUBLIC_OPENAI_API_KEY || "");
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [voiceRecordIconVisible] = useState(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('sr');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [openSpeedDial, setOpenSpeedDial] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [deleteIconVisible] = useState(true);
  const [attachFileIconVisible] = useState(true);
  const [saveIconVisible] = useState(true);
  const [audioResponseIconVisible] = useState(true);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioResponse, setAudioResponse] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tooltipText, setTooltipText] = useState<Record<string, unknown>>({});
  const [showTypingIndicator, setShowTypingIndicator] = useState<boolean>(false);

  const handleAudioResponse = (audioBase64: string) => {
    if (audioResponse) {
      setAudioBase64(audioBase64);
      const audio: HTMLAudioElement = new Audio(`data:audio/mp4;base64,${audioBase64}`);
      audioRef.current = audio;
    }
  };

  const { messages, setMessages, getEventSource, isAssistantResponding } = useChatEventSource(
    sessionId,
    locale,
    handleAudioResponse
  )

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

  const sanitizeText = (text: any) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleSaveChat = () => {
    const chatContent = messages.map(msg => `${msg.role}: ${sanitizeText(msg.content)}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleFileDelete = (index: any) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      return updatedFiles;
    });
  };

  const handleCopyToClipboard = (messageContent: any, index: number) => {
    const contentToSanitize = typeof messageContent === 'object' && messageContent !== null ? messageContent.content : messageContent;
    const sanitizedText = sanitizeText(contentToSanitize);
    const textArea = document.createElement('textarea');
    textArea.value = sanitizedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setTooltipText((prev) => ({
      ...prev,
      [index]: 'Kopirano!'
    }));
    setTimeout(() => {
      setTooltipText((prev) => ({
        ...prev,
        [index]: (language === 'en' ? 'Copy to clipboard' : 'Klikni da kopiraš tekst')
      }));
    }, 3000);
  };

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('sessionId');
    const newSessionId = uuidv4();
    sessionStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    setFiles([]);
    setAudioBase64(null);
    setAudioResponse(false);
  };

  const handleToggle = () => {
    setOpenSpeedDial(!openSpeedDial);
  };

  const handleActionClick = (actionOnClick: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    actionOnClick();
  };

  const handleAudioUpload = async (blob: any) => {
    const formData = new FormData();
    formData.append('blob', blob, 'blob.mp4');
    formData.append('session_id', sessionId);

    try {
      const transcript = await transcribeAudio(formData, sessionId);
      setUserMessage(transcript);
      setIsRecording(false);
    } catch (error) {
      console.log(error);
      setIsRecording(false);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/mp4' });
        let silenceTimeout: NodeJS.Timeout;
        let chunks: Blob[] = [];

        const resetSilenceTimeout = () => {
          clearTimeout(silenceTimeout);
          silenceTimeout = setTimeout(() => {
            mediaRecorderRef.current?.stop();
          }, 5000);
        };

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
          chunks.push(event.data);
        };

        mediaRecorderRef.current.onstart = () => {
          resetSilenceTimeout();
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp4' });
          handleAudioUpload(blob);
          chunks = [];
          clearTimeout(silenceTimeout);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);

        const audioContext = new (window.AudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.fftSize);

        const detectSilence = () => {
          analyser.getByteTimeDomainData(dataArray);
          const isSilent = dataArray.every(value => value === 128);
          if (!isSilent) {
            resetSilenceTimeout();
          }
          if (isRecording) {
            requestAnimationFrame(detectSilence);
          }
        };

        detectSilence();
      }).catch(() => {
        setIsRecording(false);
      });
    }
  };

  const handleSubmit = async (messageContent: string) => {
  
    if (messageContent.trim()) {
      setMessages([...messages, { role: roles.user, content: messageContent }]);
    }
    const newMessage: ChatMessage = {
      role: roles.user,
      content: messageContent.trim(),
      files: files,
    };

    setShowTypingIndicator(true);
  
    if (files.length > 0) {
      await handleFileSubmit(newMessage, sessionId);
    } else {
      await sendMessage(newMessage, sessionId, locale, audioResponse);
    }

    setFiles([]);
    setShowTypingIndicator(false);
    getEventSource();
  };
  
  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  const handleAudioResponseClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  
    if (!audioResponse) {
      setAudioBase64(null);
    }
  
    setAudioResponse(!audioResponse);
  };

  const actions = [
    deleteIconVisible && { icon: <DeleteIcon />, name: (language === 'en' ? 'Delete' : 'Obriši'), onClick: handleClearChat },
    attachFileIconVisible && {
      icon: (
        <div style={{ position: 'relative' }}>
          <AttachFileSharpIcon style={{ color: files.length > 0 ? 'red' : 'inherit' }} />
          {files.length > 0 && (
            files.map((file, index) => (
              <div key={index} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <CancelOutlinedIcon
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    cursor: 'pointer',
                    color: '#8695a3'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileDelete(index);
                  }}
                />
              </div>
            ))
          )}
        </div>
      ),
      name: files.length > 0 ? files.map(file => <p key={file.name}>{file.name}</p>) : (language === 'en' ? 'Attach files' : 'Dodaj priloge'),
      onClick: () => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
          fileInput.click();
        }
      }
    },
    saveIconVisible && { icon: <SaveAltSharpIcon />, name: (language === 'en' ? 'Save' : 'Sačuvaj'), onClick: handleSaveChat },
    audioResponseIconVisible && { icon: <VolumeUpIcon style={{ color: audioResponse ? 'red' : 'inherit' }} />, name: audioResponse ? (language === 'en' ? 'Turn off assistant audio response' : 'Isključi audio odgovor asistenta') : (language === 'en' ? 'Turn on assistant audio response' : 'Slušaj odgovor asistenta'), onClick: handleAudioResponseClick },
  ].filter(Boolean);

  return (
    <Container className={styles.chatContainer}>
      <>
      <Box className={styles.messages}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            className={styles.message}
          >
            <Box
              className={msg.role === roles.assistant ? styles.messageAssistant : styles.messageUser}      
            >
              <Tooltip
                    title={typeof tooltipText[index] === 'string' && tooltipText[index] !== '' ? tooltipText[index] : language === 'en' ? 'Copy to clipboard' : 'Klikni da kopiraš tekst'}
                    placement="top"
                    arrow
              >
                <Typography
                  color={"white"}
                  variant="body1"
                  onClick={() => handleCopyToClipboard(msg.content, index)}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </Tooltip>
              {msg.files && msg.files.length > 0 && (
                <Box className="attached-files" onClick={() => handleCopyToClipboard(msg.content, index)}>
                  {msg.files.map((file, fileIndex) => (
                    <Chip
                      key={fileIndex}
                      label={file.name}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              {msg.role === 'assistant' && audioResponse && audioBase64 && index === messages.length - 1 && !isAssistantResponding && (
                <audio controls autoPlay>
                  <source src={`data:audio/webm;base64,${audioBase64}`} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </Box>
          </Box>
        ))}
        {showTypingIndicator && (
          <Box className={styles.messageContainer}>
            <Box className={styles.typingIndicator}>
              <span className={styles.dot1}>.</span>
              <span className={styles.dot2}>.</span>
              <span className={styles.dot3}>.</span>
            </Box>
          </Box>
        )}
      </Box>
      <Box className={styles.inputRowContainer}>
        <Box className={styles.inputRow}>
          <form className={styles.messageInput} onSubmit={(e) => { e.preventDefault(); handleSubmit(userMessage); setUserMessage(""); }}>
            <Box className={styles.inputContainer}>
              <input
                type="text"
                className={styles.inputField}
                placeholder='Kako mogu da ti pomognem?'
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              {userMessage.trim() ? (
                  <Button type="submit" className={styles.sendButton}>
                    <SendIcon />
                  </Button>
                ) : (
                  voiceRecordIconVisible &&
                  <Tooltip title={isRecording ? 
                    (language === 'en' ? 'Click to stop recording' : 'Klikni da isključiš snimanje') : 
                    (language === 'en' ? 'Click to start recording' : 'Klikni da započneš snimanje')}>
                    <Button
                      className={`${styles.sendButton} ${isRecording ? styles.recording : ''}`}
                      onClick={handleVoiceClick}
                    >
                      <KeyboardVoiceIcon />
                    </Button>
                  </Tooltip>
                )}
            </Box>
            <Tooltip title={!openSpeedDial ? (language === 'en' ? 'More options' : 'Više opcija') : ''} placement="top">
                <SpeedDial
                  ariaLabel="SpeedDial basic example"
                  className={styles.speedDial}
                  icon={<SpeedDialIcon />}
                  onClick={handleToggle}
                  open={openSpeedDial} 
                  sx={{
                    '& .speedDial': {
                      backgroundColor: '#505050'
                    },
                    '& .MuiSpeedDial-fab': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                    },
                    '& .MuiSpeedDial-fab:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                    },
                  }}
                >
                  {actions
                    .map((action) => (
                      <SpeedDialAction
                        key={typeof action.name === 'string' ? action.name : action.name.toString()}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={handleActionClick(action.onClick)}
                      />
                  ))}
                </SpeedDial>
              </Tooltip>
              <input
                id="fileInput"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </form>
          </Box>
        </Box>
      <Box ref={messagesEndRef} />
    </>
  </Container>
  );
});

Chat.displayName = "Chat";

export default Chat;
