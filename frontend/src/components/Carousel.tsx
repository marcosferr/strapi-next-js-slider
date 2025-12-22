"use client";

import { Slide } from "@/types/slide";
import { RealTimeUpdate } from "@/types/real-time-update";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Carousel.module.css";

const AUTO_INTERVAL_MS = 5000;

type Props = {
  slides: Slide[];
  realTimeUpdates: RealTimeUpdate[];
};

export default function Carousel({ slides, realTimeUpdates }: Props) {
  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id)),
    [slides]
  );
  const [index, setIndex] = useState(0);

  const handlePrev = useCallback(
    () => setIndex((prev) => (prev - 1 + orderedSlides.length) % orderedSlides.length),
    [orderedSlides.length]
  );

  const handleNext = useCallback(
    () => setIndex((prev) => (prev + 1) % orderedSlides.length),
    [orderedSlides.length]
  );

  useEffect(() => {
    if (orderedSlides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % orderedSlides.length);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [orderedSlides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  const currentIndex = orderedSlides.length > 0 ? Math.min(index, orderedSlides.length - 1) : 0;
  const current = orderedSlides[currentIndex];

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.tickerContainer}>
          <div className={styles.ticker}>
            {realTimeUpdates.length > 0 ? (
              <>
                {realTimeUpdates.map((update) => (
                  <span key={update.id} className={styles.tickerItem}>
                    {update.content} //
                  </span>
                ))}
              </>
            ) : (
              <span className={styles.tickerItem}>Actualización en tiempo real // Alertas y obras //</span>
            )}
          </div>
        </div>
        <div className={styles.socialIcons}>
          <div className={styles.icon}>f</div>
          <div className={styles.icon}>t</div>
          <div className={styles.icon}>i</div>
          <div className={styles.icon}>in</div>
          <div className={styles.icon}>y</div>
        </div>
      </div>

      {/* Slider */}
      <section className={styles.wrapper} aria-label="Carrusel principal">
        {orderedSlides.length > 0 ? (
          <>
            <div className={styles.viewport}>
              <article
                key={current.id}
                className={styles.slide}
                style={{ backgroundImage: `url(${current.imageUrl})` }}
              >
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                  <h2 className={styles.mainText}>{current.mainText}</h2>
                  {current.secondaryText && <h2 className={styles.secondaryText}>{current.secondaryText}</h2>}
                  {current.description && <p className={styles.description}>{current.description}</p>}
                  {current.ctaUrl && (
                    <a href={current.ctaUrl} className={styles.cta} target="_blank" rel="noreferrer">
                      {current.ctaLabel || "Ver más"} <span className={styles.arrow}>→</span>
                    </a>
                  )}
                </div>
              </article>
            </div>

            <button type="button" onClick={handlePrev} aria-label="Slide anterior" className={`${styles.controlBtn} ${styles.prevBtn}`}>
              ‹
            </button>
            <button type="button" onClick={handleNext} aria-label="Siguiente slide" className={`${styles.controlBtn} ${styles.nextBtn}`}>
              ›
            </button>

            <div className={styles.dots} role="tablist" aria-label="Selector de slide">
              {orderedSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  aria-label={`Ir al slide ${i + 1}`}
                  className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        ) : (
           <div className={styles.empty}>No hay slides disponibles</div>
        )}
      </section>

      {/* Floating Phone Button */}
      <div className={styles.phoneBtn}>
        📞
      </div>
    </div>
  );
}
