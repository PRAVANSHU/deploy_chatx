import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './FileMessage.module.css';
import { formatFileSize, getFileIcon } from '@/Utils/pinataService';

const FileMessage = ({ fileData }) => {
  const { name, size, fileType, url, ipfsHash } = fileData;
  const icon = getFileIcon(fileType);
  const isImage = fileType && fileType.startsWith('image/');
  const isVideo = fileType && fileType.startsWith('video/');
  const isAudio = fileType && fileType.startsWith('audio/');
  const formattedSize = formatFileSize(parseInt(size));

  return (
    <div className={styles.fileMessage}>
      {/* File preview for media types */}
      {isImage && (
        <div className={styles.filePreview}>
          <Image
            src={url}
            alt={name}
            width={200}
            height={150}
            objectFit="contain"
          />
        </div>
      )}
      
      {isVideo && (
        <div className={styles.filePreview}>
          <video 
            controls 
            className={styles.videoPreview}
            preload="metadata"
          >
            <source src={url} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {isAudio && (
        <div className={styles.audioContainer}>
          <audio controls className={styles.audioPlayer}>
            <source src={url} type={fileType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {/* File info for all types */}
      <div className={styles.fileInfo}>
        <div className={styles.fileIcon}>{icon}</div>
        <div className={styles.fileDetails}>
          <div className={styles.fileName} title={name}>
            {name.length > 20 ? name.substring(0, 20) + '...' : name}
          </div>
          <div className={styles.fileSize}>{formattedSize}</div>
        </div>
        <Link href={url} target="_blank" rel="noopener noreferrer" className={styles.downloadButton}>
          <span className={styles.downloadIcon}>⬇️</span>
        </Link>
      </div>
    </div>
  );
};

export default FileMessage; 