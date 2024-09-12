"use client";
import React from "react";
import {
  Divider,
  Grid,
  Paper,
  Typography,
  styled,
  useTheme,
} from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  overflowX: "auto",
  whiteSpace: "nowrap",
}));

const Tools = ({ title, items }: { title: string; items: any }) => {
  const theme = useTheme();
  return (
    <Item>
      <Grid
        sx={{ padding: theme.spacing(1) }}
        container
        alignItems="center"
        wrap="nowrap"
      >
        <Grid item>
          <Typography
            variant="h6"
            component="div"
            sx={{ whiteSpace: "nowrap", textTransform: "uppercase" }}
          >
            {title}
          </Typography>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            height: "2.5rem",
            alignSelf: "center",
          }}
        />
        {items.map((item: any, index: any) => (
          <Grid item key={index}>
            <Paper
              sx={{
                padding: theme.spacing(3),
                textAlign: "center",
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "3rem",
                height: "3rem",
              }}
            >
              {item}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Item>
  );
};

export default Tools;
