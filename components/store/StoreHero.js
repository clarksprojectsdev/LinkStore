import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

const StoreHero = ({ bannerImage, logo, storeName, tagline }) => {
  // Create hero style with gradient for web
  const heroStyle = [
    styles.hero,
    !bannerImage && styles.gradientBackground,
    Platform.OS === 'web' && !bannerImage && {
      // @ts-ignore - React Native Web supports CSS background
      background: 'linear-gradient(135deg, #6f4cff, #ffb13d)',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Hero Banner with Gradient */}
      <View style={heroStyle}>
        {bannerImage && (
          <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
        )}
      </View>

      {/* Store Info Overlay */}
      <View style={styles.storeInfo}>
        {logo && (
          <Image source={{ uri: logo }} style={styles.logo} resizeMode="cover" />
        )}
        <Text style={styles.storeTitle}>{storeName || 'Store Name'}</Text>
        {tagline && <Text style={styles.tagline}>{tagline}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
  },
  hero: {
    height: 240,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  gradientBackground: {
    backgroundColor: '#6f4cff', // Fallback for mobile
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    alignItems: 'center',
    marginTop: -60,
    zIndex: 1,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  storeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    color: '#333',
  },
  tagline: {
    color: '#777',
    marginTop: 5,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default StoreHero;

