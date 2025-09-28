import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NavigationState {
  stack: string[];
  current: string;
  canGoBack: boolean;
}

interface NavigationContextType {
  state: NavigationState;
  navigate: (screen: string, replace?: boolean) => void;
  goBack: () => boolean;
  reset: (screen: string) => void;
  pushModal: (modalId: string) => void;
  popModal: () => boolean;
  isModalOpen: (modalId: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
  initialScreen?: string;
}

export function NavigationProvider({
  children,
  initialScreen = 'home'
}: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>({
    stack: [initialScreen],
    current: initialScreen,
    canGoBack: false
  });

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();

      // Check if we can handle navigation internally
      const handled = goBack();

      if (!handled) {
        // Let browser handle if we can't go back
        window.history.forward();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize browser history state
    if (!window.history.state?.navigationId) {
      window.history.replaceState(
        { navigationId: Date.now(), screen: initialScreen },
        '',
        window.location.href
      );
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((screen: string, replace = false) => {
    setState(prev => {
      const newStack = replace
        ? [...prev.stack.slice(0, -1), screen]
        : [...prev.stack, screen];

      // Update browser history
      if (replace) {
        window.history.replaceState(
          { navigationId: Date.now(), screen },
          '',
          window.location.href
        );
      } else {
        window.history.pushState(
          { navigationId: Date.now(), screen },
          '',
          window.location.href
        );
      }

      return {
        stack: newStack,
        current: screen,
        canGoBack: newStack.length > 1
      };
    });
  }, []);

  const goBack = useCallback((): boolean => {
    return setState(prev => {
      if (prev.stack.length <= 1) {
        return prev; // Can't go back
      }

      const newStack = prev.stack.slice(0, -1);
      const newCurrent = newStack[newStack.length - 1];

      return {
        stack: newStack,
        current: newCurrent,
        canGoBack: newStack.length > 1
      };
    }) !== state; // Return true if state changed (navigation happened)
  }, [state]);

  const reset = useCallback((screen: string) => {
    setState({
      stack: [screen],
      current: screen,
      canGoBack: false
    });

    // Reset browser history
    window.history.replaceState(
      { navigationId: Date.now(), screen },
      '',
      window.location.href
    );
  }, []);

  const pushModal = useCallback((modalId: string) => {
    navigate(`modal:${modalId}`);
  }, [navigate]);

  const popModal = useCallback((): boolean => {
    if (state.current.startsWith('modal:')) {
      return goBack();
    }
    return false;
  }, [state.current, goBack]);

  const isModalOpen = useCallback((modalId: string): boolean => {
    return state.current === `modal:${modalId}`;
  }, [state.current]);

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigate,
        goBack,
        reset,
        pushModal,
        popModal,
        isModalOpen
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

// Hook for handling modal navigation
export function useModal(modalId: string) {
  const navigation = useNavigation();

  const open = useCallback(() => {
    navigation.pushModal(modalId);
  }, [navigation, modalId]);

  const close = useCallback(() => {
    navigation.popModal();
  }, [navigation]);

  const isOpen = navigation.isModalOpen(modalId);

  return {
    isOpen,
    open,
    close
  };
}

// Hook for screen-level navigation
export function useScreen() {
  const navigation = useNavigation();

  return {
    currentScreen: navigation.state.current,
    canGoBack: navigation.state.canGoBack,
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    reset: navigation.reset
  };
}