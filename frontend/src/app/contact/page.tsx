"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Contact.module.css";

// Extend Window interface for Cap.js
declare global {
  interface Window {
    Cap?: new (options: { apiEndpoint: string }) => {
      solve: () => Promise<{ token: string }>;
      addEventListener: (event: string, callback: (e: { detail: { progress: number } }) => void) => void;
    };
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    consulta: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [capProgress, setCapProgress] = useState<number | null>(null);
  const capWidgetRef = useRef<HTMLElement | null>(null);

  // Load Cap.js widget script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@cap.js/widget@latest";
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    setCapProgress(0);

    try {
      // Get the Cap API endpoint from environment
      const capEndpoint = process.env.NEXT_PUBLIC_CAP_API_ENDPOINT || "http://localhost:3001";
      const capSiteKey = process.env.NEXT_PUBLIC_CAP_SITE_KEY || "";

      // Use invisible mode to solve Cap challenge programmatically
      if (!window.Cap) {
        throw new Error("Cap.js not loaded");
      }

      const cap = new window.Cap({
        apiEndpoint: `${capEndpoint}/${capSiteKey}/`,
      });

      // Listen for progress updates
      cap.addEventListener("progress", (event) => {
        setCapProgress(event.detail.progress);
      });

      const solution = await cap.solve();
      const token = solution.token;

      if (!token) {
        throw new Error("Cap verification failed on client");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337";
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formData,
          capToken: token
        }),
      });

      if (!res.ok) {
        throw new Error("Error al enviar el mensaje.");
      }

      setStatus("success");
      setFormData({ nombre: "", email: "", consulta: "" });
      setCapProgress(null);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.");
      setCapProgress(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Contacto</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="consulta">Consulta</label>
          <textarea
            id="consulta"
            name="consulta"
            value={formData.consulta}
            onChange={handleChange}
            required
            className={styles.textarea}
          />
        </div>

        <button type="submit" disabled={status === "submitting"} className={styles.button}>
          {status === "submitting" 
            ? capProgress !== null 
              ? `Verificando... ${capProgress}%` 
              : "Enviando..." 
            : "Enviar Mensaje"}
        </button>

        {status === "success" && <p className={styles.success}>¡Mensaje enviado con éxito!</p>}
        {status === "error" && <p className={styles.error}>{errorMessage}</p>}
      </form>
    </div>
  );
}
