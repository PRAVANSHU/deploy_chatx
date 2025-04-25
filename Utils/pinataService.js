import axios from 'axios';

// Pinata API configuration
const pinataConfig = {
  pinataApiKey: '23080e77ca8451391947',
  pinataSecretKey: '40a124342e8070b3f5d195e4aaa57c5841e9b1ce2e59488175002cd12e022478',
  pinataJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZWUwMWUwZS02OGRmLTQxNTUtODY3Mi0zYWM5MWQxOTk5NmIiLCJlbWFpbCI6InByYXZhbnNodW1hamk3NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjMwODBlNzdjYTg0NTEzOTE5NDciLCJzY29wZWRLZXlTZWNyZXQiOiI0MGExMjQzNDJlODA3MGIzZjVkMTk1ZTRhYWE1N2M1ODQxZTliMWNlMmU1OTQ4ODE3NTAwMmNkMTJlMDIyNDc4IiwiZXhwIjoxNzc2NTIyNjM5fQ.QtxTsY1huEAQwdxApBw4Nzh68c6oegKY6L2nE5iBIXQ'
};

/**
 * Upload a file to IPFS using Pinata
 * @param {File} file - The file to upload
 * @returns {Promise<{success: boolean, ipfsHash: string, fileUrl: string, error: string}>}
 */
export const uploadFileToIPFS = async (file) => {
  try {
    // Create form data with the file
    const formData = new FormData();
    formData.append('file', file);

    // Set pinata options for the file metadata
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          },
          {
            id: 'NYC1',
            desiredReplicationCount: 1
          }
        ]
      }
    });
    formData.append('pinataOptions', pinataOptions);

    // Set metadata for the file
    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        fileType: file.type,
        fileSize: file.size.toString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Make the API request to upload the file
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${pinataConfig.pinataJWT}`
        }
      }
    );

    // Return the successful response data
    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      fileUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      error: null
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      ipfsHash: null,
      fileUrl: null,
      error: error.message || 'Failed to upload file to IPFS'
    };
  }
};

/**
 * Get file metadata from Pinata
 * @param {string} ipfsHash - The IPFS hash of the file
 * @returns {Promise<{success: boolean, metadata: object, error: string}>}
 */
export const getFileMetadata = async (ipfsHash) => {
  try {
    const response = await axios.get(
      `https://api.pinata.cloud/pinning/pinList?hashContains=${ipfsHash}`,
      {
        headers: {
          'Authorization': `Bearer ${pinataConfig.pinataJWT}`
        }
      }
    );

    if (response.data.rows && response.data.rows.length > 0) {
      return {
        success: true,
        metadata: response.data.rows[0].metadata,
        error: null
      };
    } else {
      return {
        success: false,
        metadata: null,
        error: 'File metadata not found'
      };
    }
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return {
      success: false,
      metadata: null,
      error: error.message || 'Failed to get file metadata'
    };
  }
};

/**
 * Format file size for display
 * @param {number} bytes - The file size in bytes
 * @returns {string} - The formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

/**
 * Get file icon based on file type
 * @param {string} fileType - The MIME type of the file
 * @returns {string} - The icon emoji for the file type
 */
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎬';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊';
  if (fileType.includes('text/')) return '📝';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
  return '📁';
};

export default {
  uploadFileToIPFS,
  getFileMetadata,
  formatFileSize,
  getFileIcon
}; 