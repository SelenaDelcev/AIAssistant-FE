import React from "react";
import { Container } from "@mui/material";
import styles from "./mainContainer.module.css";

const MainContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <Container className={styles.customContainer}>{children}</Container>;
};

export default MainContainer;
