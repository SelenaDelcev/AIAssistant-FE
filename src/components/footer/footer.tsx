import React from "react";
import { Container, Typography, Box, Grid } from "@mui/material";
import styles from "./footer.module.css";

const Footer: React.FC = () => {
  return (
    <Box className={styles.footer}>
      <Container maxWidth="xl">
        <Grid container spacing={2} justifyContent={"center"}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              &copy; {new Date().getFullYear()} Positive. All rights
              reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
