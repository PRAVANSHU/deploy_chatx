import React from 'react';
import styles from './UploadProgress.module.css';

const UploadProgress = ({ progress }) => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInner}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
      </div>
      <span className={styles.progressText}>{`${Math.round(progress)}%`}</span>
    </div>
  );
};

export default UploadProgress; 