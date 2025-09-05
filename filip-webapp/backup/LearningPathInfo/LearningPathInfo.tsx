import React, { useState, useEffect } from "react";
import {
  Brain,
  Target,
  TrendingUp,
  CheckCircle,
  Star,
  Flame,
  BookOpen,
  Play,
  Clock,
  BarChart3,
  Calendar,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import HeaderCard from "./HeaderCard";
import { StatsOverview } from "./StatsOverview";
import { CurrentCourse, CurrentCourseList } from "./CurrentCourse";
import { SkillList } from "./SkillCourses";

interface Course {
  id: number;
  title: string;
  provider: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: string;
  level: string;
  isActive: boolean;
  progress: number;
  skills: string[];
}

interface Skill {
  name: string;
  priority: "High" | "Medium" | "Low";
  currentLevel: string;
  targetLevel: string;
  progress: number;
  courses: Course[];
}

interface Milestone {
  id: number;
  title: string;
  skill: string;
  targetDate: string;
  status: "completed" | "in-progress" | "upcoming";
  courses: string[];
  progress: number;
  estimatedHours: number;
  completedHours: number;
}

interface LearningPathInfoProps {
  pathId: number | null;
  onBack?: () => void;
}

const PathInfo: React.FC<LearningPathInfoProps> = ({ pathId, onBack }) => {
  const [learningPath, setLearningPath] = useState<{ selectedSkills: Skill[] }>(
    { selectedSkills: [] }
  );
  const [learningTimeline, setLearningTimeline] = useState<{
    startDate?: Date;
    targetDate?: Date;
    currentDate?: Date;
    milestones: Milestone[];
  }>({
    milestones: [],
  });
  const [learningStreak, _setLearningStreak] = useState<number>(23);

  const mockPathData = {
    user: {
      name: "Alice",
      title: "Full-Stack Developer",
      streak: 12,
      journeyLabel: "6 Month Journey",
      journeyDates: "Dec 2024 - Jun 2025",
    },
    learningStreak: 23,
    coursesCompleted: 12,
    skillsLearning: 4,
    weeklyProgress: 65,
    insights: [
      { label: "Lessons Completed", value: "8" },
      { label: "Practice Hours", value: "4h" },
      { label: "Challenges Solved", value: "3" },
    ],

    // This is what your code actually expects:
    learningPath: {
      selectedSkills: [
        {
          name: "React Development",
          priority: "High",
          currentLevel: "Beginner",
          targetLevel: "Advanced",
          progress: 45,
          courses: [
            {
              title: "React Basics",
              platform: "Udemy",
              instructor: "John Doe",
              progress: 45,
              duration: "10h 30m",
              level: "Intermediate",
              rating: 4.5,
              students: 12300,
              skills: ["React", "JavaScript", "Frontend"],
              isActive: true,
              coverUrl: "https://via.placeholder.com/150",
            },
            {
              title: "Advanced React Patterns",
              platform: "Pluralsight",
              instructor: "Jane Smith",
              progress: 0,
              duration: "8h 15m",
              level: "Advanced",
              rating: 4.7,
              students: 8500,
              skills: ["React", "State Management", "Performance"],
              isActive: false,
              coverUrl: "https://via.placeholder.com/150",
            },
          ],
        },
        {
          name: "JavaScript Fundamentals",
          priority: "High",
          currentLevel: "Intermediate",
          targetLevel: "Advanced",
          progress: 85,
          courses: [
            {
              title: "JavaScript: The Complete Guide",
              platform: "Udemy",
              instructor: "Maximilian Schwarzmüller",
              progress: 85,
              duration: "52h 30m",
              level: "Beginner to Advanced",
              rating: 4.8,
              students: 156000,
              skills: ["JavaScript", "ES6+", "Async Programming"],
              isActive: false,
              coverUrl: "https://via.placeholder.com/150",
            },
          ],
        },
        {
          name: "Node.js Backend",
          priority: "Medium",
          currentLevel: "Beginner",
          targetLevel: "Intermediate",
          progress: 20,
          courses: [
            {
              title: "Node.js Complete Course",
              platform: "Coursera",
              instructor: "Andrew Mead",
              progress: 20,
              duration: "35h",
              level: "Intermediate",
              rating: 4.6,
              students: 45000,
              skills: ["Node.js", "Express", "MongoDB"],
              isActive: true,
              coverUrl: "https://via.placeholder.com/150",
            },
          ],
        },
        {
          name: "Database Design",
          priority: "Low",
          currentLevel: "Beginner",
          targetLevel: "Intermediate",
          progress: 0,
          courses: [
            {
              title: "SQL and Database Design",
              platform: "edX",
              instructor: "Dr. Sarah Johnson",
              progress: 0,
              duration: "20h",
              level: "Beginner",
              rating: 4.4,
              students: 23000,
              skills: ["SQL", "Database Design", "MySQL"],
              isActive: false,
              coverUrl: "https://via.placeholder.com/150",
            },
          ],
        },
      ],
    },

    learningTimeline: {
      milestones: [
        {
          skill: "JavaScript Fundamentals",
          title: "Master JavaScript Basics",
          targetDate: "2025-01-15",
          status: "completed",
          progress: 100,
          estimatedHours: 52,
          completedHours: 52,
        },
        {
          skill: "React Development",
          title: "Learn React & Build Projects",
          targetDate: "2025-03-10",
          status: "in-progress",
          progress: 45,
          estimatedHours: 18,
          completedHours: 8,
        },
        {
          skill: "Node.js Backend",
          title: "Backend Development Skills",
          targetDate: "2025-05-01",
          status: "in-progress",
          progress: 20,
          estimatedHours: 35,
          completedHours: 7,
        },
        {
          skill: "Database Design",
          title: "Database Fundamentals",
          targetDate: "2025-06-15",
          status: "upcoming",
          progress: 0,
          estimatedHours: 20,
          completedHours: 0,
        },
      ],
    },
  };

  const getStatusColor = (status: Milestone["status"]): string => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-200";
      case "in-progress":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "upcoming":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (date: string): string => {
    const today = new Date();
    const diffTime = new Date(date).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  const getPriorityColor = (priority: Skill["priority"]): string => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const completePercentage = (data: any): number => {
    const milestones = data.learningTimeline?.milestones || [];
    if (milestones.length === 0) return 0;

    // Extract milestone dates
    const targetDates = milestones.map((m: any) => new Date(m.targetDate));

    // Sort to find the earliest and latest target dates
    const startDate = new Date(
      Math.min(...targetDates.map((d: Date) => d.getTime()))
    );
    const endDate = new Date(Math.max(...targetDates.map((d: Date) => d.getTime())));
    const currentDate = new Date(); // today

    if (currentDate <= startDate) return 0;
    if (currentDate >= endDate) return 100;

    const elapsed = currentDate.getTime() - startDate.getTime();
    const total = endDate.getTime() - startDate.getTime();

    return Number(Math.min(100, Math.max(0, (elapsed / total) * 100)).toPrecision(4));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use pathId to fetch specific learning path data
        const learningPath = await fetch(
          `${import.meta.env.VITE_API_URL}/learning-path-info${
            pathId ? `/${pathId}` : ""
          }`
        );
        const learningTimeline = await fetch(
          `${import.meta.env.VITE_API_URL}/learning-timeline`
        );
        const skills = await learningPath.json();
        const timeline = await learningTimeline.json();
        setLearningPath({ selectedSkills: [skills] });
        setLearningTimeline(timeline);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [pathId]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <HeaderCard
        name={mockPathData.user.name}
        title={mockPathData.user.title}
        streak={learningStreak}
        journeyLabel="6 Month Journey"
        journeyDates="Dec 2024 - Jun 2025"
      />

      {/* Stats Overview */}
      <StatsOverview
        streak={learningStreak}
        hours={learningTimeline.milestones.reduce(
          (total, m) => total + m.completedHours,
          0
        )}
        coursesCompleted={mockPathData.coursesCompleted}
        skillsLearning={mockPathData.skillsLearning}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Current Course Spotlight */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-600" />
              <span>Current Course</span>
            </h2>
            <CurrentCourseList
              selectedSkills={mockPathData.learningPath.selectedSkills}
            />
          </div>

          {/* Learning Path with Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Learning Path & Timeline
                </h2>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                6-Month Journey: Dec 2024 - Jun 2025
              </div>
            </div>

            {/* Overall Timeline Progress */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Overall Learning Progress
                </span>
                <span className="text-xs text-blue-700">
                  {completePercentage(mockPathData)}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${completePercentage(mockPathData)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Skill Learning Path List */}
            <SkillList
              selectedSkills={mockPathData.learningPath.selectedSkills}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly Progress */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>This Week's Progress</span>
            </h3>
            <p className="text-purple-100 text-sm mb-3">
              Keep up the momentum! You're doing great.
            </p>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">12.5h</div>
                <div className="text-xs text-purple-200">Hours This Week</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">+2.5h</div>
                <div className="text-xs text-purple-200">vs Last Week</div>
              </div>
            </div>

            <div className="w-full bg-purple-400 rounded-full h-2 mt-3">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>

          {/* Learning Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Learning Insights</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    On Track
                  </span>
                </div>
                <span className="text-xs text-green-700">
                  Kubernetes milestone
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Next Deadline
                  </span>
                </div>
                <span className="text-xs text-blue-700">Jan 15, 2025</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Focus Area
                  </span>
                </div>
                <span className="text-xs text-orange-700">
                  Container Orchestration
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathInfo;
