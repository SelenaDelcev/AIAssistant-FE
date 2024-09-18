"use client";
import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  styled,
} from "@mui/material";
import style from "./userShortcut.module.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "70vh",
  overflow: "auto",
  position: "relative",
  paddingTop: "0px",
}));

const StickyTitle = styled(Typography)(({ theme }) => ({
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  zIndex: 1,
  padding: theme.spacing(2),
  paddingLeft: 0,
  paddingRight: 0,
  textTransform: "uppercase",
}));

const UserShortcuts = ({
  title,
  cardData,
  onCardClick,
}: {
  title: string;
  cardData: any;
  onCardClick: (cardId: number) => void;
}) => {
  const handleCardClick = (cardId: number) => {
    onCardClick(cardId);
  };

  return (
    <Item>
      <StickyTitle variant="h6" gutterBottom>
        {title}
      </StickyTitle>
      <Grid container spacing={2} padding={1}>
        {cardData.map((card: any) => (
          <Grid item xs={6} key={card.id}>
            <a
              href="#"
              onClick={() => handleCardClick(card.id)} 
              style={{ textDecoration: "none" }}
            >
              <Card className={style.card}>
                <CardContent>
                  <Typography variant="h6" component="div" >
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </a>
          </Grid>
        ))}
      </Grid>
    </Item>
  );
};

export default UserShortcuts;
