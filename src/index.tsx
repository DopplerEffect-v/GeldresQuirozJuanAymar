import * as React from "react";
import { render } from "react-dom";
import Heading from "./Heading";
import AppRoot from './app-root';
import "./styles.css";

function App() {
  return (
    <AppRoot/>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
