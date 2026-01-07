import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js"; // fully-specified import to satisfy ESM resolution
import "./index.css"; // optional - keep if you have global styles

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
