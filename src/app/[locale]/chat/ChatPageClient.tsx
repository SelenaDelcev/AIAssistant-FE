"use client";

import React, { useState, useRef } from "react";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import ChatBoX from "@/components/chatBox/chatBox";
import UserShortcuts from "@/components/userScortcuts/userShortcuts";
import { mockedCardDataRename } from "@/consts/cardDataMockConst";
import { mockedCardData } from "@/consts/cardShortcutsDataMockConst";
import SupportMenu from "@/components/supportMenu/supportMenu";
import KeywordForm from "@/components/tools/keywordForm/KeywordForm";
import styles from './chat.module.css';

export default function ChatPageClient({
  translatedStrings,
  locale,
}: {
  translatedStrings: { toolsTitle: string };
  locale: string;
}) {
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const chatBoxRef = useRef<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleShowKeywordForm = (cardId: number) => {
    if (cardId === 1) {
      setShowKeywordForm(true);
    }
  };

  const handleFormSubmit = (message: string) => {
    if (chatBoxRef.current) {
      chatBoxRef.current.handleAppendToInput(message);
    }
  };

  const handleCloseKeywordForm = () => {
    setShowKeywordForm(false);
  };

  return (
    <main className={styles.main}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <UserShortcuts
              cardData={mockedCardData}
              onCardClick={handleShowKeywordForm}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChatBoX locale={locale} ref={chatBoxRef} />
            {showKeywordForm && (
              <KeywordForm handleAppendToInput={handleFormSubmit} onClose={handleCloseKeywordForm} />
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <SupportMenu
              cardData={mockedCardDataRename}
              onHelpClick={handleOpenDialog}
            />
          </Grid>
        </Grid>
      </Container>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Uputstvo za korišćenje chatbot-a</DialogTitle>
        <DialogContent>
          <DialogContentText component={'div'}>
            Ovaj chatbot vam omogućava brz i jednostavan pristup informacijama o stomatološkim proizvodima, njihovim karakteristikama, savete u vezi sa upotrebom i komparaciju dostupnih opcija na tržištu.
            <br /><br />
            <strong>Funkcionalnosti chatbota:</strong>
            <ol>
              <li>
                <strong>Prikaz karakteristika proizvoda:</strong>
                <ul>
                  <li>
                    Chatbot može pružiti osnovne informacije o <b>karakteristikama stomatoloških proizvoda</b>.
                  </li>
                  <li>
                    Postavite konkretno pitanje o proizvodu ili specifikacijama i chatbot će vam dati relevantne informacije.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Saveti za korišćenje proizvoda:</strong>
                <ul>
                  <li>
                    Ukoliko vam je potreban savet u vezi sa određenim proizvodom ili njegovom primenom, chatbot je dostupan da pruži odgovore na vaša pitanja
                  </li>
                </ul>
              </li>
              <li>
                <strong>Komparacija proizvoda:</strong>
                <ul>
                  <li>
                    Chatbot je u stanju da <b>uporedi proizvode</b> na osnovu dostupnih informacija.
                  </li>
                  <li>
                    Poređenje se može izvršiti između proizvoda iz asortimana vaše firme ili uopšteno sa <b>tržištem stomatološke opreme</b>.
                  </li>
                  <li>
                    Postavite pitanje, npr. &quot;Koja je razlika između proizvoda A i proizvoda B?&quot; ili &quot;Kako se proizvod X upoređuje sa sličnim proizvodima na tržištu?&quot;.
                  </li>
                </ul>
              </li>
            </ol>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleCloseDialog}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}

