// types/course.ts

export interface CourseSkill {
  name: string;
  matched: boolean;
}

export interface Course {
  rating: number;
  level: string;
  description: string;
  title: string;
  duration: string;
  instructor: string;
  price: string;
  url: string;
  skills: CourseSkill[];
  highlights: string[];
  provider: string;
  students: number;
  format?: string;
  status?: string;
  progress?: number;
  completedHours?: number;
}
