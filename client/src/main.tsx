import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure correct title is set, overriding any browser cache
document.title = "Restricted: Location based listening";

createRoot(document.getElementById("root")!).render(<App />);
