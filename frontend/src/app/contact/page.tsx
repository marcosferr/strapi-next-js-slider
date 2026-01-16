"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Contact.module.css";

// Interface for ALTCHA widget element
interface AltchaWidgetElement extends HTMLElement {
  value: string;
  reset: () => void;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    consulta: "",
    website: "", // Honeypot field
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [altchaVerified, setAltchaVerified] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const altchaContainerRef = useRef<HTMLDivElement | null>(null);
  const altchaWidgetRef = useRef<AltchaWidgetElement | null>(null);

  const challengeUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337"}/api/altcha/challenge`;

  // Handle ALTCHA state changes
  const handleStateChange = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<{ state: string; payload?: string }>;
    console.log('ALTCHA state change:', customEvent.detail);
    
    const state = customEvent.detail?.state;
    
    if (state === 'verifying') {
      // Widget is computing proof-of-work
    } else if (state === 'verified') {
      setAltchaVerified(true);
      // Get payload from event detail
      const payload = customEvent.detail?.payload || (e.target as AltchaWidgetElement)?.value;
      console.log('ALTCHA verified, payload:', payload);
      setAltchaPayload(payload || null);
    } else if (state === 'unverified' || state === 'error') {
      setAltchaVerified(false);
      setAltchaPayload(null);
    }
  }, []);

  // Load ALTCHA widget script and create widget element
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/altcha/dist/altcha.min.js";
    script.async = true;
    script.type = "module";
    
    script.onload = () => {
      if (altchaContainerRef.current && !altchaWidgetRef.current) {
        const widget = document.createElement('altcha-widget') as AltchaWidgetElement;
        widget.setAttribute('challengeurl', challengeUrl);
        // auto="onload" makes it verify automatically when the page loads
        widget.setAttribute('auto', 'onload');
        widget.setAttribute('hidefooter', '');
        widget.setAttribute('hidelogo', '');
        widget.addEventListener('statechange', handleStateChange);
        
        altchaContainerRef.current.appendChild(widget);
        altchaWidgetRef.current = widget;
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (altchaWidgetRef.current) {
        altchaWidgetRef.current.removeEventListener('statechange', handleStateChange);
      }
    };
  }, [challengeUrl, handleStateChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check honeypot
    if (formData.website) {
      console.log('Honeypot filled - blocking submission');
      return;
    }
    
    // Check if ALTCHA is verified
    if (!altchaVerified || !altchaPayload) {
      setStatus("error");
      setErrorMessage("Por favor espera a que se complete la verificación ALTCHA.");
      return;
    }
    
    setStatus("submitting");
    setErrorMessage("");
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337";
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            nombre: formData.nombre,
            email: formData.email,
            consulta: formData.consulta,
          },
          website: formData.website,
          altcha: altchaPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || "Error al enviar el mensaje.");
      }

      setStatus("success");
      setFormData({ nombre: "", email: "", consulta: "", website: "" });
      setAltchaVerified(false);
      setAltchaPayload(null);
      
      // Reset the ALTCHA widget for a new submission
      if (altchaWidgetRef.current) {
        altchaWidgetRef.current.reset();
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo."
      );
    }
  };

  return (
    <div className={styles.container}>
      <h1>Contacto</h1>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.hiddenField} aria-hidden="true">
          <label htmlFor="website">Website (leave empty)</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ALTCHA Widget - Visible with auto-verification */}
        <div className={styles.field}>
          <div ref={altchaContainerRef} className={styles.altchaContainer} />
        </div>

        <button 
          type="submit" 
          disabled={status === "submitting" || !altchaVerified} 
          className={styles.button}
        >
          {status === "submitting" ? "Enviando..." : "Enviar Mensaje"}
        </button>

        {status === "success" && (
          <p className={styles.success}>¡Mensaje enviado con éxito! Gracias por contactarnos.</p>
        )}
        {status === "error" && (
          <p className={styles.error}>{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
