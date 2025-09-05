import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  provider: string;
  instructor: string;
  rating: number;
  students: string;
  duration: string;
  price: string;
  level: string;
  isActive: boolean;
  progress: number;
  skills: string[];
}

interface Skill {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
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
  status: 'completed' | 'in-progress' | 'upcoming';
  courses: string[];
  progress: number;
  estimatedHours: number;
  completedHours: number;
}

interface LearningPathInfoProps {
  pathId: number | null;
  onBack?: () => void;
}

const LearningPathInfo: React.FC<LearningPathInfoProps> = ({ pathId, onBack }) => {
  const [learningPath, setLearningPath] = useState<{selectedSkills: Skill[]}>({selectedSkills: []})
  const [learningTimeline, setLearningTimeline] = useState<{startDate?: Date; targetDate?: Date; currentDate?: Date; milestones: Milestone[]}>({
    milestones: [],
  })
  const [learningStreak, _setLearningStreak] = useState<number>(23);

  const userData = {
    name: "Alex Chen",
    title: "Full Stack Developer",
    learningStreak: 23,
    coursesCompleted: 12,
    skillsLearning: 4,
  };

  const getStatusColor = (status: Milestone['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'upcoming':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (date: string): string => {
    return (new Date(date)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: string): string => {
    const today = new Date();
    const diffTime = (new Date(date)).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getPriorityColor = (priority: Skill['priority']): string => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      Udemy: '🎯',
      Coursera: '📚',
      Udacity: '🚀',
    };
    return logos[provider] || '📖';
  };

  const completePercentage = (): number => {
    const currentDate = new Date(learningTimeline.currentDate || new Date());
    const startDate = new Date(learningTimeline.startDate || new Date());
    const targetDate = new Date(learningTimeline.targetDate || new Date());

    return (currentDate.getTime() - startDate.getTime()) / (targetDate.getTime() - startDate.getTime()) * 100
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use pathId to fetch specific learning path data
        const learningPath = await fetch(
          `${import.meta.env.VITE_API_URL}/learning-path-info${pathId ? `/${pathId}` : ''}`
        );
        const learningTimeline = await fetch(
          `${import.meta.env.VITE_API_URL}/learning-timeline`
        );
        const skills = await learningPath.json();
        const timeline = await learningTimeline.json();
        setLearningPath({ selectedSkills: [skills]});
        setLearningTimeline(timeline);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [pathId]); 

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back to dashboard"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userData.name}!
              </h1>
              <p className="text-gray-600">
                {userData.title} • {learningStreak} day streak 🔥
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">6 Month Journey</div>
            <div className="text-sm text-gray-600">Dec 2024 - Jun 2025</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {learningStreak}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {learningTimeline.milestones.reduce(
                  (total, m) => total + m.completedHours,
                  0
                )}
                h
              </div>
              <div className="text-xs md:text-sm text-gray-600">Hours Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {userData.coursesCompleted}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Courses Completed
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {userData.skillsLearning}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Skills Learning
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Course Spotlight */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-600" />
              <span>Current Course</span>
            </h2>

            {learningPath.selectedSkills
              .find((skill) => skill.courses.some((c) => c.isActive))
              ?.courses.find((c) => c.isActive) && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                {(() => {
                  const currentCourse = learningPath.selectedSkills
                    .find((skill) => skill.courses.some((c) => c.isActive))
                    ?.courses.find((c) => c.isActive);

                  if (!currentCourse) return null;
                  return (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">
                              {getProviderLogo(currentCourse.provider)}
                            </span>
                            <span className="text-sm font-medium text-green-700">
                              {currentCourse.provider}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {currentCourse.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {currentCourse.instructor}
                          </p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Continue</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>
                            {currentCourse.rating} ({currentCourse.students} students)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{currentCourse.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span>{currentCourse.level}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{currentCourse.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentCourse.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {currentCourse.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
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
                  {completePercentage()}
                  % Complete
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${completePercentage()}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              {learningPath.selectedSkills.map((skillItem, index) => {
                const milestone = learningTimeline.milestones.find(
                  (m) => m.skill === skillItem.name
                );

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {skillItem.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            skillItem.priority
                          )}`}
                        >
                          {skillItem.priority} Priority
                        </span>
                        {milestone && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              milestone.status
                            )}`}
                          >
                            {milestone.status === 'in-progress'
                              ? 'Active'
                              : milestone.status === 'completed'
                              ? 'Done'
                              : 'Upcoming'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {skillItem.currentLevel} → {skillItem.targetLevel}
                      </div>
                    </div>

                    {/* Timeline Info */}
                    {milestone && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              Timeline: {milestone.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Target: {formatDate(milestone.targetDate)} ({getDaysUntil(milestone.targetDate)})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>
                            {milestone.completedHours}h / {milestone.estimatedHours}h completed
                          </span>
                          <span
                            className={`font-medium ${
                              getDaysUntil(milestone.targetDate) === 'Overdue'
                                ? 'text-red-600'
                                : getDaysUntil(milestone.targetDate).includes('day') &&
                                  parseInt(getDaysUntil(milestone.targetDate)) <= 7
                                ? 'text-orange-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {getDaysUntil(milestone.targetDate)}
                          </span>
                        </div>

                        {milestone.status !== 'upcoming' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  milestone.status === 'completed'
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Skill Progress</span>
                        <span>{skillItem.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skillItem.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {skillItem.courses.map((course, courseIndex) => (
                        <div
                          key={courseIndex}
                          className={`border rounded-lg p-3 ${
                            course.isActive
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {getProviderLogo(course.provider)}
                              </span>
                              <span className="font-medium text-gray-900 text-sm">
                                {course.title}
                              </span>
                              {course.isActive && (
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>
                              {course.provider} • {course.duration} • {course.level}
                            </span>
                            <span>{course.progress}% complete</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                course.isActive ? 'bg-green-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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
              <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
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
                  <span className="text-sm font-medium text-gray-900">On Track</span>
                </div>
                <span className="text-xs text-green-700">Kubernetes milestone</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Next Deadline</span>
                </div>
                <span className="text-xs text-blue-700">Jan 15, 2025</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">Focus Area</span>
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

export default LearningPathInfo;
