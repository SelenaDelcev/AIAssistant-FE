import React from "react";
import { Container, Typography, Box, Link, Grid } from "@mui/material";
import styles from "./footer.module.css";

const Footer: React.FC = () => {
  return (
    <Box className={styles.footer}>
      <Container maxWidth="xl">
        <Grid container spacing={2} justifyContent={"center"}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">CyberCompany</Typography>
            <Typography variant="body2">
              &copy; {new Date().getFullYear()} CyberCompany. All rights
              reserved.
              {/* TODO move this to localization */}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
