import React from 'react';
import styles from './OnlineStatus.module.css';
import { formatDistanceToNow } from 'date-fns';

/**
 * Component to display user online status
 * @param {Object} props Component props
 * @param {boolean} props.isOnline Whether the user is online
 * @param {Date|string|number} props.lastSeen When the user was last active
 * @param {boolean} props.showText Whether to show text status
 * @param {string} props.size Size variant ('sm', 'md', 'lg')
 * @returns {JSX.Element} OnlineStatus component
 */
const OnlineStatus = ({ isOnline, lastSeen, showText = false, size = 'md' }) => {
  // Format last seen time if available
  const formattedLastSeen = lastSeen 
    ? formatDistanceToNow(new Date(lastSeen), { addSuffix: true })
    : '';
  
  const statusSizeClass = styles[`status_${size}`];
  
  return (
    <div className={styles.container}>
      <div className={`${styles.status_indicator} ${isOnline ? styles.online : styles.offline} ${statusSizeClass}`} />
      
      {showText && (
        <div className={styles.status_text}>
          {isOnline ? (
            <span className={styles.online_text}>Online</span>
          ) : (
            <span className={styles.offline_text}>
              {formattedLastSeen ? `Last seen ${formattedLastSeen}` : 'Offline'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineStatus; 