import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CourseRates, deleteCourseRate, fetchCourseRates, upsertCourseRate } from '../lib/courseRates';

interface CourseRatesContextValue {
  rates: CourseRates;
  setRate: (courseName: string, rate: number) => Promise<void>;
  deleteRate: (courseName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CourseRatesContext = createContext<CourseRatesContextValue | undefined>(undefined);

interface CourseRatesProviderProps {
  children: ReactNode;
}

export const CourseRatesProvider = ({ children }: CourseRatesProviderProps): JSX.Element => {
  const [rates, setRates] = useState<CourseRates>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const initial = await fetchCourseRates();
        setRates(initial);
      } catch (err) {
        console.error('[CourseRatesProvider] Failed to load course rates', err);
        setError('Failed to load course rates.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const value = useMemo(
    () => ({
      rates,
      isLoading,
      error,
      setRate: async (courseName: string, rate: number) => {
        const next = await upsertCourseRate(courseName, rate);
        setRates(next);
      },
      deleteRate: async (courseName: string) => {
        await deleteCourseRate(courseName);
        setRates((prev) => {
          const { [courseName]: _removed, ...rest } = prev;
          return rest;
        });
      },
    }),
    [rates, isLoading, error],
  );

  return <CourseRatesContext.Provider value={value}>{children}</CourseRatesContext.Provider>;
};

export const useCourseRates = (): CourseRatesContextValue => {
  const context = useContext(CourseRatesContext);
  if (!context) {
    throw new Error('useCourseRates must be used within CourseRatesProvider');
  }
  return context;
};
