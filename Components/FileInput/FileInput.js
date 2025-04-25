import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './FileInput.module.css';
import images from '../../assets';
import { formatFileSize } from '@/Utils/pinataService';

const FileInput = ({ onFileSelect, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.fileInputContainer}>
      <div 
        className={`${styles.fileButton} ${disabled ? styles.disabled : ''}`} 
        onClick={handleClick}
        title="Attach file"
      >
        {selectedFile ? (
          <div className={styles.selectedFileInfo}>
            <span className={styles.fileName}>
              {selectedFile.name.length > 20 
                ? selectedFile.name.substring(0, 20) + '...' 
                : selectedFile.name
              }
            </span>
            <span className={styles.fileSize}>
              {formatFileSize(selectedFile.size)}
            </span>
            <button 
              className={styles.clearButton} 
              onClick={clearFile}
              title="Clear selected file"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className={styles.attachIconWrapper}>
            <Image src={images.file} alt="Attach file" width={30} height={30} className={styles.attachIcon} />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
};

export default FileInput; 