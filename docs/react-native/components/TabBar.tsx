import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { tokens } from '../tokens';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabled = false
}) => {
  const animatedValues = useRef(
    tabs.reduce((acc, tab) => {
      acc[tab.id] = new Animated.Value(tab.id === activeTab ? 1 : 0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    tabs.forEach(tab => {
      Animated.timing(animatedValues[tab.id], {
        toValue: tab.id === activeTab ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [activeTab, animatedValues, tabs]);

  const handleTabPress = (tabId: string) => {
    if (!disabled && tabId !== activeTab) {
      onTabChange(tabId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, disabled && styles.containerDisabled]}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const animatedValue = animatedValues[tab.id];

          const tabBackgroundColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', tokens.colors.primary.blueUltraLight],
          });

          const iconColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [tokens.colors.neutral.gray, tokens.colors.primary.blue],
          });

          const labelColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [tokens.colors.neutral.gray, tokens.colors.primary.blue],
          });

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => handleTabPress(tab.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  { backgroundColor: tabBackgroundColor }
                ]}
              >
                <View style={styles.iconContainer}>
                  {tab.icon && (
                    <Animated.Text 
                      style={[styles.tabIcon, { color: iconColor }]}
                    >
                      {tab.icon}
                    </Animated.Text>
                  )}
                  {tab.badge && tab.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {tab.badge > 99 ? '99+' : tab.badge.toString()}
                      </Text>
                    </View>
                  )}
                </View>
                <Animated.Text
                  style={[
                    styles.tabLabel,
                    { color: labelColor },
                    disabled && styles.tabLabelDisabled
                  ]}
                >
                  {tab.label.toUpperCase()}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: tokens.colors.neutral.white,
  },
  container: {
    flexDirection: 'row',
    height: 83,
    backgroundColor: tokens.colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.functional.divider,
    paddingBottom: 34, // Safe area bottom
  },
  containerDisabled: {
    opacity: 0.5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.card,
    minWidth: 60,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  tabIcon: {
    fontSize: tokens.dimensions.icon.default,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: tokens.colors.accent.coral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: 9,
    fontWeight: '600',
    color: tokens.colors.neutral.white,
    lineHeight: 12,
  },
  tabLabel: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    textAlign: 'center',
  },
  tabLabelDisabled: {
    color: tokens.colors.neutral.lightGray,
  },
});

export default TabBar;