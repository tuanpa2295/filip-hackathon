  const completeMission = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      setCurrentXP(prev => prev + mission.xpReward);
      setCompletedMissions(prev => [...prev, missionId]);
      // Simulate mission completion
      mission.completed = true;
    }
  };import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, TrendingUp, CheckCircle, Star, Trophy, Flame, 
  BookOpen, Play, Clock, Award, Zap, BarChart3, Calendar,
  Users, ChevronRight, ExternalLink 
} from 'lucide-react';

const LearningPathDashboard = () => {
  const [learningStreak, setLearningStreak] = useState(23);
  const [selectedSkill, setSelectedSkill] = useState('Kubernetes');
  // Mock user data
  const userData = {
    name: "Alex Chen",
    title: "Full Stack Developer",
    learningStreak: 23,
    coursesCompleted: 12,
    skillsLearning: 4
  };

  // Learning path data
  const learningPath = {
    selectedSkills: [
      {
        name: 'Kubernetes',
        priority: 'High',
        currentLevel: 'Beginner',
        targetLevel: 'Advanced',
        progress: 15,
        courses: [
          {
            id: 1,
            title: 'Kubernetes for Beginners',
            provider: 'Udemy',
            instructor: 'Mumshad Mannambeth',
            rating: 4.6,
            students: '142,589',
            duration: '6h 30m',
            price: '$54.99',
            level: 'Beginner',
            isActive: true,
            progress: 45,
            skills: ['Container Orchestration', 'Pod Management', 'Services & Networking']
          },
          {
            id: 2,
            title: 'Certified Kubernetes Administrator (CKA)',
            provider: 'Coursera',
            instructor: 'Google Cloud',
            rating: 4.8,
            students: '89,234',
            duration: '40 hours',
            price: '$49/month',
            level: 'Intermediate',
            isActive: false,
            progress: 0,
            skills: ['Cluster Administration', 'Security', 'Troubleshooting']
          }
        ]
      },
      {
        name: 'TensorFlow',
        priority: 'Medium',
        currentLevel: 'Beginner',
        targetLevel: 'Intermediate',
        progress: 8,
        courses: [
          {
            id: 3,
            title: 'TensorFlow 2.0 Complete Course',
            provider: 'Udacity',
            instructor: 'TensorFlow Team',
            rating: 4.7,
            students: '67,421',
            duration: '12 weeks',
            price: '$399/month',
            level: 'Beginner',
            isActive: false,
            progress: 0,
            skills: ['Neural Networks', 'Deep Learning', 'Model Training']
          }
        ]
      },
      {
        name: 'GraphQL',
        priority: 'Medium',
        currentLevel: 'Beginner',
        targetLevel: 'Intermediate',
        progress: 32,
        courses: [
          {
            id: 4,
            title: 'The Modern GraphQL Bootcamp',
            provider: 'Udemy',
            instructor: 'Andrew Mead',
            rating: 4.5,
            students: '45,123',
            duration: '13h 45m',
            price: '$64.99',
            level: 'Beginner',
            isActive: false,
            progress: 32,
            skills: ['Query Language', 'Schema Design', 'Resolvers']
          }
        ]
      },
      {
        name: 'Cloud Architecture',
        priority: 'High',
        currentLevel: 'Beginner',
        targetLevel: 'Advanced',
        progress: 0,
        courses: [
          {
            id: 5,
            title: 'AWS Solutions Architect Associate',
            provider: 'Coursera',
            instructor: 'Amazon Web Services',
            rating: 4.6,
            students: '156,789',
            duration: '60 hours',
            price: '$79/month',
            level: 'Intermediate',
            isActive: false,
            progress: 0,
            skills: ['System Design', 'Scalability', 'Security Architecture']
          }
        ]
      }
    ]
  };

  // Timeline tracker data
  const learningTimeline = {
    startDate: new Date('2024-12-01'),
    targetDate: new Date('2025-06-01'),
    currentDate: new Date(),
    milestones: [
      {
        id: 1,
        title: 'Kubernetes Foundations',
        skill: 'Kubernetes',
        targetDate: new Date('2025-01-15'),
        status: 'in-progress', // completed, in-progress, upcoming
        courses: ['Kubernetes for Beginners'],
        progress: 45,
        estimatedHours: 20,
        completedHours: 9
      },
      {
        id: 2,
        title: 'Container Orchestration Mastery',
        skill: 'Kubernetes',
        targetDate: new Date('2025-02-28'),
        status: 'upcoming',
        courses: ['Certified Kubernetes Administrator (CKA)'],
        progress: 0,
        estimatedHours: 40,
        completedHours: 0
      },
      {
        id: 3,
        title: 'GraphQL API Development',
        skill: 'GraphQL',
        targetDate: new Date('2025-03-15'),
        status: 'upcoming',
        courses: ['The Modern GraphQL Bootcamp'],
        progress: 0,
        estimatedHours: 25,
        completedHours: 0
      },
      {
        id: 4,
        title: 'Machine Learning Fundamentals',
        skill: 'TensorFlow',
        targetDate: new Date('2025-04-30'),
        status: 'upcoming',
        courses: ['TensorFlow 2.0 Complete Course'],
        progress: 0,
        estimatedHours: 60,
        completedHours: 0
      },
      {
        id: 5,
        title: 'Cloud Architecture Expert',
        skill: 'Cloud Architecture',
        targetDate: new Date('2025-06-01'),
        status: 'upcoming',
        courses: ['AWS Solutions Architect Associate'],
        progress: 0,
        estimatedHours: 80,
        completedHours: 0
      }
    ]
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'upcoming': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-100 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };



  const getProviderLogo = (provider) => {
    const logos = {
      'Udemy': '🎯',
      'Coursera': '📚',
      'Udacity': '🚀'
    };
    return logos[provider] || '📖';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData.name}!</h1>
              <p className="text-gray-600">{userData.title} • {learningStreak} day streak 🔥</p>
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
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {learningTimeline.milestones.reduce((total, m) => total + m.completedHours, 0)}h
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
              <div className="text-xl md:text-2xl font-bold text-gray-900">{userData.skillsLearning}</div>
              <div className="text-xs md:text-sm text-gray-600">Skills Learning</div>
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
              .find(skill => skill.courses.some(course => course.isActive))
              ?.courses.find(course => course.isActive) && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                {(() => {
                  const currentCourse = learningPath.selectedSkills
                    .find(skill => skill.courses.some(course => course.isActive))
                    ?.courses.find(course => course.isActive);
                  
                  return (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getProviderLogo(currentCourse.provider)}</span>
                            <span className="text-sm font-medium text-green-700">{currentCourse.provider}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{currentCourse.title}</h3>
                          <p className="text-sm text-gray-600">by {currentCourse.instructor}</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Continue</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{currentCourse.rating} ({currentCourse.students} students)</span>
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
                        {currentCourse.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
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
                <h2 className="text-xl font-semibold text-gray-900">Your Learning Path & Timeline</h2>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                6-Month Journey: Dec 2024 - Jun 2025
              </div>
            </div>
            
            {/* Overall Timeline Progress */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">Overall Learning Progress</span>
                <span className="text-xs text-blue-700">
                  {Math.round(((learningTimeline.currentDate - learningTimeline.startDate) / (learningTimeline.targetDate - learningTimeline.startDate)) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((learningTimeline.currentDate - learningTimeline.startDate) / (learningTimeline.targetDate - learningTimeline.startDate)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-6">
              {learningPath.selectedSkills.map((skill, index) => {
                // Find corresponding timeline milestone
                const milestone = learningTimeline.milestones.find(m => m.skill === skill.name);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(skill.priority)}`}>
                          {skill.priority} Priority
                        </span>
                        {milestone && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                            {milestone.status === 'in-progress' ? 'Active' : 
                             milestone.status === 'completed' ? 'Done' : 'Upcoming'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {skill.currentLevel} → {skill.targetLevel}
                      </div>
                    </div>
                    
                    {/* Timeline Info */}
                    {milestone && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Timeline: {milestone.title}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Target: {formatDate(milestone.targetDate)} ({getDaysUntil(milestone.targetDate)})
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{milestone.completedHours}h / {milestone.estimatedHours}h completed</span>
                          <span className={`font-medium ${
                            getDaysUntil(milestone.targetDate) === 'Overdue' ? 'text-red-600' :
                            getDaysUntil(milestone.targetDate).includes('day') && parseInt(getDaysUntil(milestone.targetDate)) <= 7 ? 'text-orange-600' :
                            'text-gray-600'
                          }`}>
                            {getDaysUntil(milestone.targetDate)}
                          </span>
                        </div>
                        
                        {milestone.status !== 'upcoming' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
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
                        <span>{skill.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {skill.courses.map((course, courseIndex) => (
                        <div key={courseIndex} className={`border rounded-lg p-3 ${course.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{getProviderLogo(course.provider)}</span>
                              <span className="font-medium text-gray-900 text-sm">{course.title}</span>
                              {course.isActive && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Current</span>}
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{course.provider} • {course.duration} • {course.level}</span>
                            <span>{course.progress}% complete</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div 
                              className={`h-1 rounded-full transition-all duration-300 ${course.isActive ? 'bg-green-600' : 'bg-gray-400'}`}
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
            <p className="text-purple-100 text-sm mb-3">Keep up the momentum! You're doing great.</p>
            
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
                <span className="text-xs text-orange-700">Container Orchestration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDashboard;