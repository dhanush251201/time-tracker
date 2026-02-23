import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface EarningsVisibilityContextValue {
  showEarnings: boolean;
  toggleEarnings: () => void;
}

const EarningsVisibilityContext = createContext<EarningsVisibilityContextValue | undefined>(undefined);

interface EarningsVisibilityProviderProps {
  children: ReactNode;
}

export const EarningsVisibilityProvider = ({ children }: EarningsVisibilityProviderProps): JSX.Element => {
  const [showEarnings, setShowEarnings] = useState(false);

  const value = useMemo(
    () => ({
      showEarnings,
      toggleEarnings: () => setShowEarnings((prev) => !prev),
    }),
    [showEarnings],
  );

  return <EarningsVisibilityContext.Provider value={value}>{children}</EarningsVisibilityContext.Provider>;
};

export const useEarningsVisibility = (): EarningsVisibilityContextValue => {
  const context = useContext(EarningsVisibilityContext);
  if (!context) {
    throw new Error('useEarningsVisibility must be used within EarningsVisibilityProvider');
  }
  return context;
};
