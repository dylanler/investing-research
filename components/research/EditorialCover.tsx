import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './EditorialCover.module.css';

export interface EditorialSignal {
  label: string;
  value: string;
}

export interface EditorialCoverProps {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  thesis: string;
  signals: [EditorialSignal, EditorialSignal, EditorialSignal];
  caption: ReactNode;
  priority?: boolean;
}

export default function EditorialCover({
  image,
  alt,
  eyebrow,
  title,
  thesis,
  signals,
  caption,
  priority = false,
}: EditorialCoverProps) {
  return (
    <section className={styles.wrap} aria-label={`${title} visual summary`}>
      <figure className={styles.figure}>
        <Image className={styles.image} src={image} alt={alt} fill sizes="(max-width: 760px) 100vw, 1280px" priority={priority} />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.content}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.thesis}>{thesis}</p>
        </div>
        <div className={styles.signals}>
          {signals.map((signal) => (
            <div className={styles.signal} key={signal.label}>
              <span className={styles.signalLabel}>{signal.label}</span>
              <span className={styles.signalValue}>{signal.value}</span>
            </div>
          ))}
        </div>
      </figure>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </section>
  );
}
