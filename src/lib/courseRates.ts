export type CourseRates = Record<string, number>;

export interface UpsertCourseRatePayload {
  courseName: string;
  rate: number;
}
import { apiDelete, apiGet, apiPut } from './api';

export const fetchCourseRates = async (): Promise<CourseRates> => {
  return apiGet<CourseRates>('/api/course-rates');
};

export const upsertCourseRate = async (courseName: string, rate: number): Promise<CourseRates> => {
  return apiPut<UpsertCourseRatePayload, CourseRates>('/api/course-rates', { courseName, rate });
};

export const deleteCourseRate = async (courseName: string): Promise<void> => {
  await apiDelete(`/api/course-rates/${encodeURIComponent(courseName)}`);
};
