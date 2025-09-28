import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanGestureHandler, State } from 'react-native';
import { tokens } from '../tokens';

interface TrackCardProps {
  title: string;
  duration: string;
  isPlaying?: boolean;
  rating?: 'none' | 'like' | 'love';
  disabled?: boolean;
  onPlayPause?: () => void;
  onRate?: (rating: 'like' | 'love') => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  title,
  duration,
  isPlaying = false,
  rating = 'none',
  disabled = false,
  onPlayPause,
  onRate
}) => {
  const [swipeX] = useState(new Animated.Value(0));
  const [showRating, setShowRating] = useState(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: swipeX } }],
    { useNativeDriver: false }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < -50) {
        setShowRating(true);
        Animated.spring(swipeX, {
          toValue: -80,
          useNativeDriver: false,
        }).start();
      } else {
        setShowRating(false);
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleRating = (newRating: 'like' | 'love') => {
    onRate?.(newRating);
    setShowRating(false);
    Animated.spring(swipeX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateX: swipeX }] },
            disabled && styles.cardDisabled,
            isPlaying && styles.cardPlaying
          ]}
        >
          <TouchableOpacity 
            style={styles.content}
            onPress={onPlayPause}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </View>
            
            <View style={styles.trackInfo}>
              <Text 
                style={[styles.title, disabled && styles.titleDisabled]}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text style={[styles.duration, disabled && styles.durationDisabled]}>
                {duration}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              {rating === 'like' && (
                <Text style={styles.ratingIcon}>👍</Text>
              )}
              {rating === 'love' && (
                <Text style={styles.ratingIcon}>❤️</Text>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {showRating && (
        <View style={styles.ratingButtons}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.likeButton]}
            onPress={() => handleRating('like')}
          >
            <Text style={styles.ratingButtonIcon}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, styles.loveButton]}
            onPress={() => handleRating('love')}
          >
            <Text style={styles.ratingButtonIcon}>❤️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  },
  card: {
    width: tokens.dimensions.trackCard.width,
    height: tokens.dimensions.trackCard.height,
    backgroundColor: tokens.colors.neutral.white,
    borderRadius: tokens.borderRadius.card,
    ...tokens.shadows.default,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardPlaying: {
    borderWidth: 2,
    borderColor: tokens.colors.primary.blue,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  playButton: {
    width: tokens.dimensions.icon.default,
    height: tokens.dimensions.icon.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  playIcon: {
    color: tokens.colors.primary.blue,
    fontSize: 16,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.neutral.charcoal,
    marginBottom: 2,
  },
  titleDisabled: {
    color: tokens.colors.neutral.gray,
  },
  duration: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.caption.fontSize,
    fontWeight: tokens.typography.caption.fontWeight,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.colors.neutral.gray,
  },
  durationDisabled: {
    color: tokens.colors.neutral.lightGray,
  },
  ratingContainer: {
    width: tokens.dimensions.icon.default,
    height: tokens.dimensions.icon.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
  },
  ratingButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: tokens.dimensions.trackCard.height,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
  },
  likeButton: {
    backgroundColor: tokens.colors.accent.teal,
  },
  loveButton: {
    backgroundColor: tokens.colors.accent.coral,
  },
  ratingButtonIcon: {
    fontSize: 18,
    color: tokens.colors.neutral.white,
  },
});

export default TrackCard;