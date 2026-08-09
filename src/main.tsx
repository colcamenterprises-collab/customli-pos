import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { installApiBase } from "@/lib/apiBase";
import { installPosNativeCheckoutBridge } from "@/lib/posNativeCheckoutBridge";
installApiBase();
installPosNativeCheckoutBridge();
const root=document.getElementById("root");if(!root)throw new Error("Root element not found");createRoot(root).render(<StrictMode><App/></StrictMode>);
