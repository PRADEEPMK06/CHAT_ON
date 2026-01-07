import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatProvider from './context/ChatProvider';

import Chat from "./pages/Chat";
import Authorization from "./pages/Authorization";

export default function App() {
  // Clear session on browser/tab close for security
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear user data when browser/tab is closed
      localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/auth" element={<Authorization />} />
          <Route path="/" element={<Chat />} />
        </Routes>
        <ToastContainer />
      </ChatProvider>
    </BrowserRouter>
  );
}