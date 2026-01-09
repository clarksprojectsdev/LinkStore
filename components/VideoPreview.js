import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const VideoPreview = ({ 
  videoUri, 
  imageUri, 
  style, 
  onError,
  autoPlay = true,
  loop = true,
  muted = true,
  showControls = false,
  resizeMode = 'cover'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef(null);

  // Handle video loading
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (error) => {
    console.warn('Video playback error:', error);
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.warn('Error toggling video playback:', error);
      }
    }
  };

  // Auto-play when component mounts (if enabled)
  useEffect(() => {
    if (autoPlay && videoRef.current && !hasError) {
      const playVideo = async () => {
        try {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Auto-play failed:', error);
          setHasError(true);
        }
      };
      
      // Small delay to ensure video is ready
      const timer = setTimeout(playVideo, 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, hasError]);

  // If no video URI or error occurred, show image fallback
  if (!videoUri || hasError) {
    return (
      <View style={[styles.container, style]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.media}
            resizeMode={resizeMode}
            onError={() => {
              console.warn('Image fallback also failed');
            }}
          />
        ) : (
          <View style={[styles.media, styles.placeholder]}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.media}
        resizeMode={resizeMode}
        shouldPlay={isPlaying}
        isLooping={loop}
        isMuted={muted}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        useNativeControls={showControls}
        // Performance optimizations
        progressUpdateInterval={1000}
        positionMillis={0}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      
      {/* Play/Pause overlay for manual control */}
      {!showControls && !isLoading && (
        <TouchableOpacity
          style={styles.playOverlay}
          onPress={togglePlayPause}
          activeOpacity={0.7}
        >
          <View style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="rgba(255, 255, 255, 0.8)"
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#f8f9fa',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 2,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoPreview;
