"use client";
import React from "react";
import { Box, Card, CardContent, Grid, Typography, styled } from "@mui/material";
import style from './supportMenu.module.css';

const Container = styled("div")(() => ({
  maxHeight: "70vh",
  overflow: "auto",
}));
const SupportMenu = ({ cardData, onHelpClick }: { cardData: any; onHelpClick: () => void; }) => {
  return (
    <Container>
      <Grid container spacing={2} direction="column">
        {cardData.map((card: any) => (
          <Grid item key={card.id}>
            <a
              href={card.url}
              target="_self"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Card className={style.card} onClick={onHelpClick}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    {card.icon && React.createElement(card.icon, { style: { marginRight: 8 } })}
                    <Typography variant="body1" className={style.cardDetail} component="div">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{card.content}</Typography>
                </CardContent>
              </Card>
            </a>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SupportMenu;
