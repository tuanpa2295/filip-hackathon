import React, { useEffect, useState } from 'react';
import {
  Brain,
  PlusCircle,
  Calendar,
  ChevronRight,
  Search,
  User,
  Award,
  BookOpen,
  BookOpenCheck,
  Target,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchLearningPathList, type LearningPathResponse } from '@/utils';

// Standalone Learning Paths List Component
export const LearningPathList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [learningPathList, setLearningPathList] = useState<LearningPathResponse[]>();

  useEffect(() => {
    fetchLearningPathList()
      .then((data) => setLearningPathList(data))
      .catch((err) => console.error('Failed to load learning path:', err));
  }, []);
  // Mock user data
  const mockUser = {
    email: 'john.doe@fsoft.com',
    name: 'John Doe',
    role: 'Senior Software Engineer',
    department: 'Technology Solutions',
  };

  // Mock function handlers
  const handleCreateNewPath = () => navigate('/create-learning-path');

  const filteredPaths = learningPathList?.filter((path) => path.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen text-left">
      {/* Hero Cover Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAwSDJ2MmgzMnYtMnptMCAydjI4aDJ2LTI4aC0yem0yLTJ2LTNoLTJ2M2gyem0tMiAwSDB2MmgzNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Navigation Bar */}
        <nav className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">FALP | Fast-Track Your Skills with AI-Generated Learning Path</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-2 text-left">
                    <p className="text-sm font-medium text-white">{mockUser.name}</p>
                    <p className="text-xs text-white/70">{mockUser.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Your AI-Powered Learning Journey
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-white/80">
            Personalized learning paths designed to accelerate your professional growth and skill development.
          </p>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 inset-x-0">
          <svg className="w-full text-gray-50" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24C480 74 960 74 1440 24V74H0V24Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search learning paths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <button
              onClick={handleCreateNewPath}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Learning Path
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-row gap-4">
          {/* Active Paths */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg flex-1">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <BookOpenCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Paths</p>
                <p className="text-xl font-bold text-gray-900">{learningPathList?.length}</p>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg flex-1">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg. Completion Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {learningPathList
                    ? Math.round(
                        learningPathList.reduce((acc, path) => acc + path.progress, 0) / learningPathList.length,
                      ) + '%'
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Skills */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg flex-1">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unique Skills</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(learningPathList?.flatMap((path) => path.skills)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">


        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPaths?.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
              onClick={() => navigate(`/learning-path/${path.id}`)}
            >
              {/* Progress Bar */}
              <div className="h-2 bg-gray-200">
                <div
                  className={`h-2 ${
                    path.progress >= 75 ? 'bg-green-500' : path.progress >= 40 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${path.progress}%` }}
                ></div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">{path.name}</h2>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        path.target_level === 'Beginner'
                          ? 'bg-green-100 text-green-800'
                          : path.target_level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {path.target_level}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(path.start_date).toLocaleDateString()} - {new Date(path.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-gray-600">
                        {path.completed_hours}/{path.estimated_hours} hours
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-600">{path.progress}% complete</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {path.skills?.map((skill, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center hover:bg-blue-100 transition-colors mt-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking button
                    navigate(`/learning-path/${path.id}`);
                  }}
                >
                  <span>Continue Learning</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (shown when no paths match search) */}
        {filteredPaths?.length === 0 && (
          <div className="py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <BookOpen className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No learning paths found</h3>
            <p className="mt-1 text-sm text-gray-500">No learning paths match your search criteria.</p>
            <div className="mt-6">
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
