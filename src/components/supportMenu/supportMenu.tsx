"use client";
import React from "react";
import { Card, CardContent, Grid, Typography, styled } from "@mui/material";

const Container = styled("div")(() => ({
  maxHeight: "70vh",
  overflow: "auto",
}));
//TODO cardData should be a type same as we get it from BE
const SupportMenu = ({ cardData }: { cardData: any }) => {
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
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
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
