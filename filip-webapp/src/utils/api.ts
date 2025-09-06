import type { AnalysisResults, Skill } from '@/types';
import type { Course } from '@/types/course';
import axios from 'axios';
import { handleAPIError } from './error';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface SkillAnalysisInput {
  provider: 'cv' | 'akajob';
  cv_file: File;
  user_description: string;
  learning_type: 'individual' | 'project';
  timeline: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Experience {
  total_years: number;
  current_role: string;
  industry: string;
  companies: string[];
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExtractedSkill {
  name: string;
  level: SkillLevel;
  confidence: number;
  category: string;
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface SkillGap {
  name: string;
  level: SkillLevel;
  priority: Priority;
  description: string;
  market_demand: number;
  salary_impact: string;
  type: 'current' | 'new';
  relevant_info: string;
}

export interface SkillAnalysisResponse {
  thread_id: string;
  education: Education[];
  experience: Experience;
  extracted_skills: ExtractedSkill[];
  skills_gap: SkillGap[];
  overall_score: number;
}

export interface RecommendationResponse {
  learning_path_name: string;
  recommendations: string;
  courses: Course[];
}

export interface CreateLearningPathRequest {
  name: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  target_level?: string;
  learningpath_courses: CreateLearningPathCourse[];
}

export interface CreateLearningPathCourse {
  course_level: string;
  course_description: string;
  course_title: string;
  course_duration: string;
  course_instructor: string;
  course_price: string;
  course_rating: number;
  course_skills: string;           // JSON string
  course_status: string;           // "Not Started", etc.
  course_progress?: number;        // optional, can default to 0
  target: string;                  // "YYYY-MM-DD"
  course_highlights?: string;      // JSON string
}

export interface LearningPathCourse {
  course_progress: number;
  course_rating: number;
  course_level: string;
  course_description: string;
  course_title: string;
  course_duration: string;
  course_instructor: string;
  course_price: string;
  course_url: string;
  course_skills: string;
  course_students: number;
  course_provider: string;
  course_highlights: string;
  course_status: string;
}

export interface LearningPathResponse {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  completed_hours: number;
  status: string;
  target_level: string;
  progress: number;
  learningpath_courses: LearningPathCourse[];
  courses?: Course[];
  skills?: string[];
}

export interface AnalyzeLearningPathRequest {
  available_hours_per_week: number;
  start_date: string;
  end_date: string;
  courses: Course[];
}

export async function requestSkillAnalysis(input: SkillAnalysisInput): Promise<SkillAnalysisResponse | undefined> {
  const formData = new FormData();
  formData.append('provider', input.provider);
  formData.append('cv_file', input.cv_file);
  formData.append('user_description', input.user_description);
  formData.append('learning_type', input.learning_type);
  formData.append('timeline', input.timeline);

  try {
    const response = await axios.post<SkillAnalysisResponse>(`${BASE_URL}/api/skill-analysis/?format=json`, formData, {
      headers: {
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

export async function fetchCourseRecommendations(selectedSkills: Skill[]): Promise<RecommendationResponse | undefined>  {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/learning-paths/recommendations`,
      { skills: selectedSkills },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;

    const courses = data.courses.map((course: any): Course => ({
      rating: course.course_rating ?? 0,
      level: course.course_level ?? "All Levels",
      description: course.course_description ?? "",
      title: course.course_title ?? "",
      duration: course.course_duration ?? "",
      instructor: course.course_instructor ?? "N/A",
      price: course.course_price ?? "Free",
      url: course.course_url ?? "",
      skills: course.course_skills ?? [],
      highlights: course.course_highlights ?? [],
      provider: course.course_provider ?? "",
      students: course.course_students ?? 0,
      format: course.course_format ?? course.course_type ?? "Videos"
    }));

    return {
      learning_path_name: data.learning_path_name ?? "Custom Learning Path",
      recommendations: data.answer ?? "",
      courses
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
};

export const createLearningPath = async (request: CreateLearningPathRequest): Promise<LearningPathResponse | undefined> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/learning-paths/`,
      request,
      { headers: { "Content-Type": "application/json" } }
    );
    const data = response.data;

    const courses = data.learningpath_courses.map((course: LearningPathCourse): Course => ({
      rating: course.course_rating ?? 0,
      level: course.course_level ?? "All Levels",
      description: course.course_description ?? "",
      title: course.course_title ?? "",
      duration: course.course_duration ?? "",
      instructor: course.course_instructor ?? "N/A",
      price: course.course_price ?? "Free",
      url: course.course_url ?? "",
      skills: JSON.parse(course.course_skills ?? []),
      highlights: JSON.parse(course.course_highlights ?? []),
      provider: course.course_provider ?? "",
      students: course.course_students ?? 0,
      status: course.course_status,
      progress: course.course_progress,
    }));
    data.courses = courses
    return data;
  } catch (err) {
    console.error("Failed to create learning path", err);
  }
};

export const fetchLearningPath = async (id: string): Promise<LearningPathResponse | undefined> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/learning-paths/${id}/`);
    const data = response.data;

    const courses = data.learningpath_courses.map((course: LearningPathCourse): Course => ({
      rating: course.course_rating ?? 0,
      level: course.course_level ?? "All Levels",
      description: course.course_description ?? "",
      title: course.course_title ?? "",
      duration: course.course_duration ?? "",
      instructor: course.course_instructor ?? "N/A",
      price: course.course_price ?? "Free",
      url: course.course_url ?? "",
      skills: JSON.parse(course.course_skills ?? []),
      highlights: JSON.parse(course.course_highlights ?? []),
      provider: course.course_provider ?? "",
      students: course.course_students ?? 0,
      status: course.course_status,
      progress: course.course_progress,
    }));
    data.courses = courses
    return data;
  } catch (err) {
    console.error("Failed to create learning path", err);
  }
};

export const fetchLearningPathList = async (): Promise<LearningPathResponse[] | undefined> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/learning-paths/`);
    return response.data.map((item: LearningPathResponse) => {
    // Aggregate all course_skills (stringified JSON)
    const skillsSet = new Set<string>();

    item.learningpath_courses?.forEach((course) => {
      try {
        const parsedSkills: { name: string }[] = JSON.parse(course.course_skills ?? "[]");
        parsedSkills.forEach((skill) => {
          if (skill?.name) skillsSet.add(skill.name);
        });
      } catch {
        // skip invalid JSON
      }
    });

    return {
      ...item,
      skills: Array.from(skillsSet),
    };
  });
  } catch (err) {
    console.error("Failed to create learning path", err);
  }
};

export const analyzeLearningPath = async (request: AnalyzeLearningPathRequest): Promise<AnalysisResults | undefined> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/learning-paths/analytics`,
      request,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Failed to create learning path", err);
  }
};
