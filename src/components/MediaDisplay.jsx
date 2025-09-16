import React, { useState, useEffect } from 'react';

const MediaDisplay = ({ media, type }) => {
  const [error, setError] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    if (!media) return;
    
    // تحويل المسار النسبي إلى مسار كامل
    if (media.startsWith('/')) {
      setMediaUrl(`https://appgames.fikriti.com${media}`);
    } else if (media.startsWith('http')) {
      setMediaUrl(media);
    } else {
      setMediaUrl(`https://appgames.fikriti.com/${media}`);
    }
  }, [media]);

  if (!media || error) return null;

  const handleError = () => {
    console.error('Media loading failed:', mediaUrl);
    setError(true);
  };

  const determineType = () => {
    if (type) return type;
    
    if (typeof media === 'string') {
      if (media.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
      if (media.match(/\.(mp4|webm|mov)$/i)) return 'video';
      if (media.match(/\.(mp3|wav|ogg)$/i)) return 'audio';
    }
    return 'image'; // default to image if we can't determine type
  };

  const mediaType = determineType();

  const styles = {
    mediaContainer: {
      width: '100%',
      maxWidth: '800px',
      margin: '1rem auto',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6'
    },
    imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    },
    videoContainer: {
      width: '100%',
      padding: '1rem'
    },
    audioContainer: {
      width: '100%',
      padding: '1rem',
      backgroundColor: '#fff'
    },
    media: {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '400px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    audio: {
      width: '100%'
    }
  };

  const renderMedia = () => {
    console.log('Rendering media:', { mediaUrl, mediaType });

    switch (mediaType) {
      case 'image':
        return (
          <div style={{...styles.mediaContainer, ...styles.imageContainer}}>
            <img 
              src={mediaUrl} 
              alt="Question media" 
              style={styles.media}
              onError={handleError} 
            />
          </div>
        );
      case 'video':
        return (
          <div style={{...styles.mediaContainer, ...styles.videoContainer}}>
            <video controls style={styles.media} onError={handleError}>
              <source src={mediaUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div style={{...styles.mediaContainer, ...styles.audioContainer}}>
            <audio controls style={styles.audio} onError={handleError}>
              <source src={mediaUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  return renderMedia();
};

export default MediaDisplay;