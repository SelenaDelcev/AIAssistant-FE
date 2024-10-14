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
  backgroundColor: theme.palette.secondary.main,
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
  zIndex: 1,
  padding: theme.spacing(2),
  paddingLeft: 0,
  paddingRight: 0,
  textTransform: "uppercase",
}));

const UserShortcuts = ({
  cardData,
  onCardClick,
}: {
  cardData: any;
  onCardClick: (cardId: number) => void;
}) => {
  const handleCardClick = (cardId: number) => {
    onCardClick(cardId);
  };

  return (
    <Item className={style.userShortcut}>
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
                  {card.icon && React.createElement(card.icon)}
                  <Typography variant="body1" style={{ fontSize: '13px' }}component="div" >
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
