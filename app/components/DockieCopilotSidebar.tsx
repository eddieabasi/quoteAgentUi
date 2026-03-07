"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

export default function DockieCopilotSidebar() {
  return (
    <CopilotSidebar
      labels={{
        modalHeaderTitle: "Dockie AI Assistant",
        welcomeMessageText: "Ask me anything — shipping, tracking, logistics.",
        // chatInputPlaceholder: "Ask or search for anything…",
        chatDisclaimerText: "AI can make mistakes. Please verify important information.",
      }}
      header={{
        className: "cpk-sidebar-header",
        titleContent: () => (
          <span className="cpk-sidebar-header-title cpk-sidebar-header-with-logo">
            <img
              src="/dockie_logo.svg"
              alt="Dockie"
              width={64}
              height={20}
              className="cpk-sidebar-header-logo"
            />
            <span>.ai</span>
          </span>
        ),
        closeButton: { className: "cpk-sidebar-header-close" },
      }}
      messageView={{ className: "cpk-sidebar-messages" }}
      scrollView={{ className: "cpk-sidebar-scroll" }}
      welcomeScreen={{ className: "cpk-sidebar-welcome" }}
      input={{
        className: "cpk-sidebar-input",
        textArea: { className: "cpk-sidebar-input-field" },
        sendButton: { className: "cpk-sidebar-send-btn" },
        disclaimer: { className: "cpk-sidebar-disclaimer" },
      }}
      suggestionView={{
        container: { className: "cpk-sidebar-suggestions" },
        suggestion: { className: "cpk-sidebar-suggestion-pill" },
      }}
      toggleButton={{ className: "cpk-sidebar-toggle" }}
    />
  );
}
