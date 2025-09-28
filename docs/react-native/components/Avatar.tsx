import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { tokens } from '../tokens';

interface AvatarProps {
  source?: string;
  initials?: string;
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'medium',
  backgroundColor = tokens.colors.primary.blue,
  textColor = tokens.colors.neutral.white,
  borderColor,
  borderWidth = 0,
  style,
  imageStyle,
  textStyle
}) => {
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      default:
        return tokens.dimensions.avatar;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const avatarSize = getAvatarSize();
  const fontSize = getFontSize();

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor,
      borderColor: borderColor || 'transparent',
      borderWidth,
    },
    style
  ];

  const displayInitials = initials || '??';

  return (
    <View style={containerStyle}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: avatarSize - borderWidth * 2,
              height: avatarSize - borderWidth * 2,
              borderRadius: (avatarSize - borderWidth * 2) / 2,
            },
            imageStyle
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              color: textColor,
            },
            textStyle
          ]}
        >
          {displayInitials.toUpperCase()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  initials: {
    fontFamily: tokens.typography.fontFamily,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Avatar;