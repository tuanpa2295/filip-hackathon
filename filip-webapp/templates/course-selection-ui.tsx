import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Clock, AlertTriangle, CheckCircle, Star, 
  Play, ExternalLink, Calendar, TrendingUp, Zap, Award,
  BookOpen, Users, DollarSign, BarChart3, Settings,
  ChevronDown, ChevronUp, Info, Flame, Shield
} from 'lucide-react';

const CourseSelectionUI = () => {
  const [selectedSkills] = useState([
    'Kubernetes', 'TensorFlow', 'GraphQL', 'Cloud Architecture'
  ]);
  
  const [learningPreferences, setLearningPreferences] = useState({
    hoursPerWeek: 10,
    startDate: '2024-12-01',
    targetDate: '2025-06-01',
    budget: 500,
    difficultyPreference: 'balanced', // beginner-friendly, balanced, challenging
    learningStyle: 'mixed' // video, text, hands-on, mixed
  });

  const [selectedCourses, setSelectedCourses] = useState({});
  const [expandedSkills, setExpandedSkills] = useState({ 'Kubernetes': true });
  const [showTimelineAnalysis, setShowTimelineAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Mock course data for each skill
  const skillCourses = {
    'Kubernetes': [
      {
        id: 'k8s-1',
        title: 'Kubernetes for Beginners',
        provider: 'Udemy',
        instructor: 'Mumshad Mannambeth',
        rating: 4.6,
        students: '142,589',
        duration: 25, // hours
        price: 54.99,
        level: 'Beginner',
        format: 'Video',
        skills: ['Container Orchestration', 'Pod Management', 'Services & Networking'],
        description: 'Complete beginner-friendly course covering Kubernetes fundamentals with hands-on labs.',
        highlights: ['12 hands-on labs', 'Certificate included', 'Lifetime access'],
        prerequisites: ['Basic Docker knowledge'],
        outcomes: ['Deploy applications on Kubernetes', 'Understand core concepts', 'Manage pods and services']
      },
      {
        id: 'k8s-2',
        title: 'Certified Kubernetes Administrator (CKA)',
        provider: 'Linux Academy',
        instructor: 'Cloud Experts',
        rating: 4.8,
        students: '89,234',
        duration: 45,
        price: 49,
        level: 'Intermediate',
        format: 'Video + Labs',
        skills: ['Cluster Administration', 'Security', 'Troubleshooting', 'Advanced Networking'],
        description: 'Official CKA certification prep with real cluster environments and exam simulation.',
        highlights: ['Live cluster access', 'Exam voucher included', 'Practice tests'],
        prerequisites: ['Kubernetes basics', 'Linux command line'],
        outcomes: ['Pass CKA exam', 'Manage production clusters', 'Advanced troubleshooting']
      },
      {
        id: 'k8s-3',
        title: 'Kubernetes Security Best Practices',
        provider: 'Pluralsight',
        instructor: 'Security Team',
        rating: 4.5,
        students: '23,456',
        duration: 15,
        price: 29,
        level: 'Advanced',
        format: 'Video + Case Studies',
        skills: ['Security Policies', 'RBAC', 'Network Policies', 'Compliance'],
        description: 'Advanced security practices for Kubernetes in production environments.',
        highlights: ['Real-world scenarios', 'Security checklists', 'Compliance frameworks'],
        prerequisites: ['Kubernetes administration experience'],
        outcomes: ['Implement security policies', 'Design secure clusters', 'Meet compliance requirements']
      }
    ],
    'TensorFlow': [
      {
        id: 'tf-1',
        title: 'TensorFlow 2.0 Complete Course',
        provider: 'DeepLearning.AI',
        instructor: 'Andrew Ng',
        rating: 4.9,
        students: '234,567',
        duration: 60,
        price: 79,
        level: 'Beginner',
        format: 'Video + Jupyter Notebooks',
        skills: ['Neural Networks', 'Deep Learning', 'Model Training', 'Computer Vision'],
        description: 'Comprehensive introduction to TensorFlow 2.0 with practical projects.',
        highlights: ['5 real projects', 'GPU training included', 'Industry datasets'],
        prerequisites: ['Python programming', 'Basic math'],
        outcomes: ['Build ML models', 'Deploy to production', 'Understand deep learning']
      },
      {
        id: 'tf-2',
        title: 'Advanced TensorFlow Specialization',
        provider: 'Coursera',
        instructor: 'TensorFlow Team',
        rating: 4.7,
        students: '156,789',
        duration: 80,
        price: 199,
        level: 'Advanced',
        format: 'Video + Projects',
        skills: ['Custom Models', 'TensorFlow Extended', 'Production ML', 'Model Optimization'],
        description: '4-course specialization covering advanced TensorFlow concepts and production deployment.',
        highlights: ['Capstone project', 'Industry mentorship', 'TensorFlow certification'],
        prerequisites: ['TensorFlow basics', 'Machine learning experience'],
        outcomes: ['Build custom architectures', 'Deploy at scale', 'Optimize performance']
      }
    ],
    'GraphQL': [
      {
        id: 'gql-1',
        title: 'The Modern GraphQL Bootcamp',
        provider: 'Udemy',
        instructor: 'Andrew Mead',
        rating: 4.5,
        students: '45,123',
        duration: 20,
        price: 64.99,
        level: 'Beginner',
        format: 'Video + Code',
        skills: ['Query Language', 'Schema Design', 'Resolvers', 'Apollo'],
        description: 'Build full-stack applications with GraphQL, Node.js, and React.',
        highlights: ['3 full projects', 'Real-time subscriptions', 'Testing included'],
        prerequisites: ['JavaScript knowledge', 'Basic Node.js'],
        outcomes: ['Build GraphQL APIs', 'Integrate with React', 'Handle real-time data']
      }
    ],
    'Cloud Architecture': [
      {
        id: 'ca-1',
        title: 'AWS Solutions Architect Associate',
        provider: 'AWS',
        instructor: 'AWS Training',
        rating: 4.6,
        students: '156,789',
        duration: 50,
        price: 79,
        level: 'Intermediate',
        format: 'Video + Labs',
        skills: ['System Design', 'Scalability', 'Security Architecture', 'Cost Optimization'],
        description: 'Official AWS certification prep covering solution architecture best practices.',
        highlights: ['Hands-on labs', 'Exam voucher', 'Real scenarios'],
        prerequisites: ['Basic cloud knowledge', 'Networking fundamentals'],
        outcomes: ['Design scalable systems', 'Pass AWS exam', 'Optimize costs']
      },
      {
        id: 'ca-2',
        title: 'Multi-Cloud Architecture Mastery',
        provider: 'Cloud Academy',
        instructor: 'Cloud Experts',
        rating: 4.4,
        students: '34,567',
        duration: 35,
        price: 149,
        level: 'Advanced',
        format: 'Video + Projects',
        skills: ['Multi-Cloud Strategy', 'Hybrid Architecture', 'Cloud Migration', 'DevOps Integration'],
        description: 'Master multi-cloud architectures across AWS, Azure, and Google Cloud.',
        highlights: ['Multi-cloud projects', 'Migration strategies', 'Cost comparison'],
        prerequisites: ['Cloud experience', 'One cloud certification'],
        outcomes: ['Design multi-cloud solutions', 'Plan migrations', 'Optimize across platforms']
      }
    ]
  };

  const toggleSkillExpansion = (skill) => {
    setExpandedSkills(prev => ({
      ...prev,
      [skill]: !prev[skill]
    }));
  };

  const toggleCourseSelection = (skillName, courseId) => {
    setSelectedCourses(prev => {
      const skillCourses = prev[skillName] || [];
      const isSelected = skillCourses.includes(courseId);
      
      return {
        ...prev,
        [skillName]: isSelected 
          ? skillCourses.filter(id => id !== courseId)
          : [...skillCourses, courseId]
      };
    });
  };

  const calculateTotalHours = () => {
    let totalHours = 0;
    Object.entries(selectedCourses).forEach(([skill, courseIds]) => {
      courseIds.forEach(courseId => {
        const course = skillCourses[skill]?.find(c => c.id === courseId);
        if (course) totalHours += course.duration;
      });
    });
    return totalHours;
  };

  const calculateTotalCost = () => {
    let totalCost = 0;
    Object.entries(selectedCourses).forEach(([skill, courseIds]) => {
      courseIds.forEach(courseId => {
        const course = skillCourses[skill]?.find(c => c.id === courseId);
        if (course) totalCost += course.price;
      });
    });
    return totalCost;
  };

  const getSelectedCoursesCount = () => {
    return Object.values(selectedCourses).reduce((total, courses) => total + courses.length, 0);
  };

  const analyzeTimeline = () => {
    const totalHours = calculateTotalHours();
    const weeklyHours = learningPreferences.hoursPerWeek;
    const totalWeeks = Math.ceil(totalHours / weeklyHours);
    
    const startDate = new Date(learningPreferences.startDate);
    const estimatedEndDate = new Date(startDate);
    estimatedEndDate.setDate(estimatedEndDate.getDate() + (totalWeeks * 7));
    
    const targetDate = new Date(learningPreferences.targetDate);
    const timeDiff = targetDate - estimatedEndDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    const riskLevel = daysDiff < -30 ? 'high' : daysDiff < 0 ? 'medium' : 'low';
    
    setAnalysisResults({
      totalHours,
      weeklyHours,
      totalWeeks,
      estimatedEndDate,
      targetDate,
      daysDiff,
      riskLevel,
      recommendations: generateRecommendations(riskLevel, daysDiff, totalHours, weeklyHours)
    });
    
    setShowTimelineAnalysis(true);
  };

  const generateRecommendations = (riskLevel, daysDiff, totalHours, weeklyHours) => {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push({
        type: 'warning',
        title: 'Timeline at Risk',
        message: `You need ${Math.abs(daysDiff)} more days than available. Consider reducing course load or extending timeline.`,
        action: 'Reduce courses or extend deadline'
      });
      
      if (weeklyHours < 15) {
        recommendations.push({
          type: 'suggestion',
          title: 'Increase Weekly Hours',
          message: `Consider increasing to ${Math.ceil(totalHours / ((new Date(learningPreferences.targetDate) - new Date(learningPreferences.startDate)) / (7 * 24 * 60 * 60 * 1000)))} hours/week`,
          action: 'Adjust weekly commitment'
        });
      }
      
      recommendations.push({
        type: 'alternative',
        title: 'Focus on High-Priority Skills',
        message: 'Prioritize Kubernetes and Cloud Architecture for immediate career impact.',
        action: 'Reorder skill priorities'
      });
    } else if (riskLevel === 'medium') {
      recommendations.push({
        type: 'caution',
        title: 'Tight Schedule',
        message: 'Timeline is achievable but leaves little buffer for delays or additional practice.',
        action: 'Consider adding 2-4 weeks buffer'
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'Timeline Looks Good',
        message: `You'll finish ${daysDiff} days early! Consider adding advanced courses or extra practice time.`,
        action: 'Add advanced courses or projects'
      });
    }
    
    return recommendations;
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProviderLogo = (provider) => {
    const logos = {
      'Udemy': '🎯',
      'Coursera': '📚',
      'AWS': '☁️',
      'Linux Academy': '🐧',
      'Pluralsight': '🔷',
      'DeepLearning.AI': '🧠',
      'Cloud Academy': '☁️'
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
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review & Select Courses</h1>
              <p className="text-gray-600">Choose your learning path and validate your timeline</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{selectedSkills.length} Skills</div>
            <div className="text-sm text-gray-600">Ready for learning</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Course Selection */}
        <div className="lg:col-span-3 space-y-6">
          {/* Learning Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Learning Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours per week</label>
                <select
                  value={learningPreferences.hoursPerWeek}
                  onChange={(e) => setLearningPreferences(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 hours/week (Casual)</option>
                  <option value={10}>10 hours/week (Balanced)</option>
                  <option value={15}>15 hours/week (Intensive)</option>
                  <option value={20}>20 hours/week (Full-time)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={learningPreferences.startDate}
                  onChange={(e) => setLearningPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion</label>
                <input
                  type="date"
                  value={learningPreferences.targetDate}
                  onChange={(e) => setLearningPreferences(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Course Selection by Skill */}
          {selectedSkills.map((skill, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSkillExpansion(skill)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-900">{skill}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skillCourses[skill]?.length || 0} courses available
                    </span>
                    {selectedCourses[skill]?.length > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {selectedCourses[skill].length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {expandedSkills[skill] ? 'Hide courses' : 'Show courses'}
                    </span>
                    {expandedSkills[skill] ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </div>
              </div>

              {expandedSkills[skill] && (
                <div className="border-t border-gray-200 p-6 pt-4">
                  <div className="grid gap-4">
                    {skillCourses[skill]?.map((course, courseIndex) => (
                      <div 
                        key={courseIndex} 
                        className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                          selectedCourses[skill]?.includes(course.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => toggleCourseSelection(skill, course.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-4 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedCourses[skill]?.includes(course.id) || false}
                              onChange={() => toggleCourseSelection(skill, course.id)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-lg">{getProviderLogo(course.provider)}</span>
                                <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                  course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {course.level}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{course.description}</p>
                              
                              {/* Course Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{course.rating} ({course.students})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{course.duration}h duration</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span>${course.price}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4 text-blue-500" />
                                  <span>{course.format}</span>
                                </div>
                              </div>
                              
                              {/* Skills Tags */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {course.skills.map((skillTag, tagIndex) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {skillTag}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Highlights */}
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 mb-1">Course Highlights:</div>
                                <div className="flex flex-wrap gap-2">
                                  {course.highlights.map((highlight, hIndex) => (
                                    <span key={hIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                      ✓ {highlight}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Learning Outcomes */}
                              <div className="text-sm">
                                <div className="font-medium text-gray-900 mb-1">You'll learn to:</div>
                                <ul className="text-gray-600 text-xs space-y-1">
                                  {course.outcomes.map((outcome, oIndex) => (
                                    <li key={oIndex} className="flex items-center space-x-2">
                                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                      <span>{outcome}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <button className="text-blue-600 hover:text-blue-800 transition-colors p-2">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {selectedCourses[skill]?.includes(course.id) && (
                          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-800 text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Added to your learning path</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selection Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Selection Summary</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Courses</span>
                <span className="font-semibold text-gray-900">{getSelectedCoursesCount()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Duration</span>
                <span className="font-semibold text-gray-900">{calculateTotalHours()}h</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-semibold text-gray-900">${calculateTotalCost()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Hours</span>
                <span className="font-semibold text-gray-900">{learningPreferences.hoursPerWeek}h</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Weeks</span>
                  <span className="font-semibold text-blue-600">
                    {Math.ceil(calculateTotalHours() / learningPreferences.hoursPerWeek)} weeks
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Alert */}
          {calculateTotalCost() > learningPreferences.budget && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Budget Alert</span>
              </div>
              <p className="text-orange-700 text-sm">
                Selected courses cost ${calculateTotalCost()}, which exceeds your ${learningPreferences.budget} budget by ${calculateTotalCost() - learningPreferences.budget}.
              </p>
            </div>
          )}

          {/* Timeline Analysis Button */}
          <button
            onClick={analyzeTimeline}
            disabled={getSelectedCoursesCount() === 0}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
              getSelectedCoursesCount() > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span>Analyze Timeline & Risks</span>
          </button>
        </div>
      </div>

      {/* Timeline Analysis Results */}
      {showTimelineAnalysis && analysisResults && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Timeline Analysis</h2>
              <p className="text-gray-600">Based on your selections and preferences</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`p-4 rounded-xl border-2 mb-6 ${getRiskColor(analysisResults.riskLevel)}`}>
            <div className="flex items-center space-x-3 mb-2">
              {analysisResults.riskLevel === 'high' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : analysisResults.riskLevel === 'medium' ? (
                <Clock className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
              <h3 className="text-lg font-semibold">
                {analysisResults.riskLevel === 'high' ? 'High Risk Timeline' :
                 analysisResults.riskLevel === 'medium' ? 'Moderate Risk Timeline' :
                 'Timeline Looks Good'}
              </h3>
            </div>
            <p className="text-sm mb-3">
              Based on {analysisResults.totalHours} total hours at {analysisResults.weeklyHours} hours/week, 
              you'll need {analysisResults.totalWeeks} weeks to complete all courses.
            </p>
            <div className="text-sm">
              <strong>Estimated completion:</strong> {analysisResults.estimatedEndDate.toLocaleDateString()} 
              <span className="ml-2">
                ({analysisResults.daysDiff >= 0 ? `${analysisResults.daysDiff} days early` : `${Math.abs(analysisResults.daysDiff)} days late`})
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900">AI Recommendations:</h4>
            {analysisResults.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                rec.type === 'warning' ? 'border-red-200 bg-red-50' :
                rec.type === 'caution' ? 'border-yellow-200 bg-yellow-50' :
                rec.type === 'success' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className={`font-semibold mb-1 ${
                  rec.type === 'warning' ? 'text-red-800' :
                  rec.type === 'caution' ? 'text-yellow-800' :
                  rec.type === 'success' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {rec.title}
                </div>
                <p className={`text-sm mb-2 ${
                  rec.type === 'warning' ? 'text-red-700' :
                  rec.type === 'caution' ? 'text-yellow-700' :
                  rec.type === 'success' ? 'text-green-700' :
                  'text-blue-700'
                }`}>
                  {rec.message}
                </p>
                <div className={`text-xs font-medium ${
                  rec.type === 'warning' ? 'text-red-600' :
                  rec.type === 'caution' ? 'text-yellow-600' :
                  rec.type === 'success' ? 'text-green-600' :
                  'text-blue-600'
                }`}>
                  Suggested Action: {rec.action}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              disabled={analysisResults.riskLevel === 'high'}
            >
              <Zap className="w-5 h-5" />
              <span>
                {analysisResults.riskLevel === 'high' 
                  ? 'Fix Timeline Issues First' 
                  : 'Create Personal Learning Path'
                }
              </span>
            </button>
            
            <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors">
              Adjust Selections
            </button>
            
            <button className="border border-blue-300 text-blue-700 py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors">
              Export Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSelectionUI;