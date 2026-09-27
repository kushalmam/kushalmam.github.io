import "@fontsource/redaction/latin-700.css";
import "@fontsource/redaction/latin-400-italic.css";
import "@fontsource/redaction-10/latin-700.css";
import "@fontsource/redaction-35/latin-700.css";
import "@fontsource/redaction-70/latin-700.css";
import "@fontsource/redaction-100/latin-700.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
