"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./Contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    consulta: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const token = await recaptchaRef.current?.executeAsync();
      
      if (!token) {
         throw new Error("Recaptcha verification failed on client");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337";
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formData,
          recaptchaToken: token
        }),
      });

      if (!res.ok) {
        throw new Error("Error al enviar el mensaje.");
      }

      recaptchaRef.current?.reset();
      setStatus("success");
      setFormData({ nombre: "", email: "", consulta: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.");
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className={styles.container}>
      <h1>Contacto</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <ReCAPTCHA
            ref={recaptchaRef}
            size="invisible"
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Lex0UssAAAAAEBrD1rgcdoMdE7Ka6xArhNqaWRl"}
        />
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
          {status === "submitting" ? "Enviando..." : "Enviar Mensaje"}
        </button>

        {status === "success" && <p className={styles.success}>¡Mensaje enviado con éxito!</p>}
        {status === "error" && <p className={styles.error}>{errorMessage}</p>}
      </form>
    </div>
  );
}
