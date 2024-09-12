"use client";

import React, { useState, useRef } from "react";
import { Container, Grid } from "@mui/material";
import ChatBoX from "@/components/chatBox/chatBox";
import UserShortcuts from "@/components/userScortcuts/userShortcuts";
import Tools from "@/components/tools/tools";
import { mockedCardDataRename } from "@/consts/cardDataMockConst";
import { mockedCardData } from "@/consts/cardShortcutsDataMockConst";
import { toolsMockedDataConst } from "@/consts/toolsMockedDataConst";
import SupportMenu from "@/components/supportMenu/supportMenu";
import KeywordForm from "@/components/tools/keywordForm/KeywordForm";
import Draggable from "react-draggable";

export default function ChatPageClient({
  translatedStrings,
  locale,
}: {
  translatedStrings: { userShortcutsTitle: string; toolsTitle: string };
  locale: string;
}) {
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const chatBoxRef = useRef<any>(null);

  const handleShowKeywordForm = (cardId: number) => {
    if (cardId === 1) {
      setShowKeywordForm(true);
    }
  };

  const handleFormSubmit = (message: string) => {
    if (chatBoxRef.current) {
      chatBoxRef.current.handleSubmit(message);
    }
  };

  const handleCloseKeywordForm = () => {
    setShowKeywordForm(false);
  };

  return (
    <main>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <UserShortcuts
              title={translatedStrings.userShortcutsTitle}
              cardData={mockedCardData}
              onCardClick={handleShowKeywordForm}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChatBoX locale={locale} ref={chatBoxRef} />
            {showKeywordForm && (
              <Draggable handle=".draggable">
                <KeywordForm handleSubmit={handleFormSubmit} onClose={handleCloseKeywordForm} />
              </Draggable>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <SupportMenu cardData={mockedCardDataRename} />
          </Grid>
          <Grid item xs={12}>
            <Tools title={translatedStrings.toolsTitle} items={toolsMockedDataConst} />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

