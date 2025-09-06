import React, { useEffect, useState } from 'react';
import { Brain, Target, Star, Flame, BookOpen, Play, Clock, BarChart3, Users, Home } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchLearningPath, type LearningPathResponse } from '@/utils';
import type { Course } from '@/types';

export const LearningPathDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learningStreak] = useState(23);
  const location = useLocation();
  const [learningPath, setLearningPath] = useState<LearningPathResponse>();
  useEffect(() => {
    if (location.state?.learning_path) {
      setLearningPath(location.state.learning_path);
    } else {
      if (!id) return;

      fetchLearningPath(id)
        .then((data) => setLearningPath(data))
        .catch((err) => console.error('Failed to load learning path:', err));
    }
  }, [id, location.state]);
  // Mock user data
  const userData = {
    name: 'Alex Chen',
    title: 'Full Stack Developer',
    learningStreak: 23,
    coursesCompleted: 12,
    coursesInProgress: 0, // Will be calculated below
    totalCourses: 0, // Will be calculated below
  };

  // Update userData with calculated values
  userData.coursesInProgress = 0;
  userData.totalCourses = learningPath?.learningpath_courses.length ?? 0;
  let startDate = new Date();
  if (learningPath?.start_date) {
    startDate = new Date(learningPath?.start_date);
  }
  let targetDate = new Date();
  if (learningPath?.end_date) {
    targetDate = new Date(learningPath?.end_date);
  }

  const getProviderLogo = (provider: string) => {
    const logos: { [key: string]: string } = {
      Udemy: '🎯',
      Coursera: '📚',
      Udacity: '🚀',
    };
    return logos[provider] || '📖';
  };

  const getTimeJourney = (): string => {
    const years = targetDate.getFullYear() - startDate.getFullYear();
    const months = targetDate.getMonth() - startDate.getMonth();

    return `${Math.max(years * 12 + months, 1)} Month(s) Journey`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen text-left">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <Home className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{learningPath?.name}</h2>
              <p className="text-gray-600"></p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{getTimeJourney()}</div>
              <div className="text-sm text-gray-600">
                {learningPath?.start_date} - {learningPath?.end_date}
              </div>
            </div>
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
              <div className="text-xl md:text-2xl font-bold text-gray-900">{learningStreak}</div>
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
              <div className="text-xl md:text-2xl font-bold text-gray-900">{learningPath?.completed_hours}h</div>
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
              <div className="text-xl md:text-2xl font-bold text-gray-900">{userData.coursesCompleted}</div>
              <div className="text-xs md:text-sm text-gray-600">Courses Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{userData.totalCourses}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Courses</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Main Learning Path */}
        <div className="space-y-6">
          {/* Current Course Spotlight */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-600" />
              <span>Current Course</span>
            </h2>

            {(() => {
              const currentCourse = (learningPath?.courses ?? []).find((course: Course) => course.status);

              if (!currentCourse) return <p className="text-gray-600">No active course</p>;

              return (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getProviderLogo(currentCourse.provider)}</span>
                        <span className="text-sm font-medium text-green-700">{currentCourse.provider}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{currentCourse.title}</h3>
                      <p className="text-sm text-gray-600">by {currentCourse.instructor}</p>
                    </div>
                    <a 
                      href={currentCourse.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continue</span>
                    </a>
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

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills you'll learn:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCourse.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            skill.name === 'High'
                              ? 'bg-red-200 text-red-800'
                              : skill.name === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Learning Path with Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Your Learning Path & Timeline</h2>
              </div>
              <button
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                onClick={() => {
                  if (!learningPath) return;
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(learningPath, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", `learning_path_${learningPath.id || 'export'}.json`);
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>

            {/* Overall Timeline Progress */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">Overall Learning Progress</span>
                <span className="text-xs text-blue-700">
                  {Math.min(100, Math.max(0, learningPath?.progress ?? 0))}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, learningPath?.progress ?? 0))}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Course list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(learningPath?.courses ?? []).map((course) => {
                // Find corresponding timeline milestone
                // const milestone = learningPath?.courses.find((m) => m.courseId === course.id);

                return (
                  <div
                    key={course.url}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {course.instructor} • {course.provider}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {course.status === 'Current' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Current
                          </span>
                        )}
                        {/* {milestone && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              milestone.status,
                            )}`}
                          >
                            {milestone.status === 'in-progress'
                              ? 'Active'
                              : milestone.status === 'completed'
                                ? 'Done'
                                : 'Upcoming'}
                          </span>
                        )} */}
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>
                          {course.rating} ({course.students})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>{course.price}</span>
                      </div>
                    </div>

                    {/* Course Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Course Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            course.status === 'Current' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Skills Learning */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Skills you'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              skill.name === 'High'
                                ? 'bg-red-100 text-red-800'
                                : skill.name === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Course Action Button */}
                    <a 
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{course.status === 'Current' ? 'Continue' : 'Start Course'}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">{/* Sidebar content can be added here if needed */}</div>
      </div>
    </div>
  );
};
