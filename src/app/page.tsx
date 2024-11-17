"use client";

import Sample from "./Sample";
import styles from "./page.module.css";
import "./globals.css";
import Image from "next/image";
import uploadIcon from "./assets/upload.svg";
import { useRef, useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = event.target.files?.[0];
    if (targetFile) {
      setFile(targetFile);
    }
  };

  const handleRemoveFile = () => setFile(null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Rotate PDF Pages</h1>
      <p className={styles.description}>
        Simply click on a page to rotate it. You can then download your modified
        PDF.
      </p>
      {file ? (
        <Sample file={file} onRemoveFile={handleRemoveFile} />
      ) : (
        <div className={styles.uploadBox} onClick={handleClick}>
          <div className={styles.uploadContent}>
            <Image src={uploadIcon} alt="Upload Icon" width={20} height={20} />
            <p>Click to upload or drag and drop</p>
          </div>
        </div>
      )}
      {/* <Sample></Sample> */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
