import React, { createContext, useContext, useMemo, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast({ type = "info", message }) {
    const id = toastCounter += 1;
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3600);
  }

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
