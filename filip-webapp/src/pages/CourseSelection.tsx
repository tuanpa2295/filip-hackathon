import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, Target, Clock, AlertTriangle, CheckCircle, Star, 
  ExternalLink, BookOpen, DollarSign, BarChart3, Settings,
  Shield, Lightbulb
} from 'lucide-react';
import type { Course } from '@/types/course';
import type { Skill } from '@/types';
import { ValidationDisplay } from '@/components/ValidationDisplay';


export const CourseSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [recomendedCourses, setRecomendedCourses] = useState<Course[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Use either provided selectedSkills or mock data
  const formatDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  }
  
  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const getFutureDate = (offset: string) => {
    const today = new Date();
    switch (offset) {
      case '3m':
        return addMonths(today, 3).toISOString().split('T')[0];
      case '6m':
        return addMonths(today, 6).toISOString().split('T')[0];
      case '1y':
        return addMonths(today, 12).toISOString().split('T')[0];
      default:
        return addMonths(today, 3).toISOString().split('T')[0];
    }
  };

  const [learningPreferences, setLearningPreferences] = useState({
    hoursPerWeek: 10,
    startDate: formatDate(),
    targetDate: getFutureDate('3m'),
    budget: 5000000,
    difficultyPreference: 'balanced',
    learningStyle: 'mixed',
    learningPathName: location.state?.recommendations?.learning_path_name
  });

  // Handle state when returning from timeline analysis
  useEffect(() => {
    if (location.state?.recommendations) {
      setRecomendedCourses(location.state.recommendations.courses);
      
      // Check for validation results in recommendations
      if (location.state.recommendations.validation) {
        setValidationResults(location.state.recommendations.validation);
        setShowValidation(true);
      }
    }
    if (location.state?.learningPreferences) {
      setLearningPreferences(location.state.learningPreferences);
    }
    const savedRecommendedCourses = localStorage.getItem("recommendedCourses");
    if (savedRecommendedCourses) {
      const parsed = JSON.parse(savedRecommendedCourses);
      setRecomendedCourses(parsed.courses || parsed);
      
      // Check for validation results in saved data
      if (parsed.validation) {
        setValidationResults(parsed.validation);
        setShowValidation(true);
      }
    }
    const savedSelectedCourses = localStorage.getItem("selectedCourses");
    if (savedSelectedCourses) {
      setSelectedCourses(JSON.parse(savedSelectedCourses));
    }
    const savedSelectedSkills = localStorage.getItem("selectedSkills");
    if (savedSelectedSkills) {
      setSelectedSkills(JSON.parse(savedSelectedSkills));
    }
  }, [location.state]);

  // Check if a skill matches user's requirements
  const isRequiredSkill = (skill: string) => {
    return selectedSkills.some(selectedSkill => 
      skill.toLowerCase().includes(selectedSkill.name.toLowerCase()) || 
      selectedSkill.name.toLowerCase().includes(skill.toLowerCase())
    );
  };

  const toggleCourseSelection = (course: Course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.some(c => c.url === course.url);
      return isSelected
        ? prev.filter(c => c.url !== course.url)
        : [...prev, course];
    });
  };


  const estimateCourseHours = (duration: string): number => {
    const cleaned = duration.toLowerCase().trim();
    const match = RegExp(/([\d.]+)/).exec(cleaned);
    if (cleaned.includes("hour") || cleaned.includes("hr")) {
      return match ? parseFloat(match[1]) : 2;
    }

    if (cleaned.includes("min")) {
      return match ? parseFloat(match[1]) / 60 : 0.5;
    }

    if (cleaned.includes("week")) {
      return match ? parseFloat(match[1]) * 5 : 4;
    }

    if (cleaned.includes("month")) {
      const rangeMatch = RegExp(/(\d+)\s*-\s*(\d+)/).exec(cleaned);
      if (rangeMatch) {
        const low = parseInt(rangeMatch[1]);
        const high = parseInt(rangeMatch[2]);
        return ((low + high) / 2) * 20;
      }

      return match ? parseInt(match[1]) * 20 : 20;
    }

    return 20;
  };

  const calculateTotalHours = () => {
    return selectedCourses.reduce((total, course: Course) => {
      const selected_course = recomendedCourses.find(c => c.url === course.url);
      return total + (selected_course ? estimateCourseHours(selected_course.duration) : 0);
    }, 0);
  };

  const parseCoursePrice = (price: string): number => {
    const cleaned = price.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned);
  };
  const calculateTotalCost = () => {
    return selectedCourses.reduce((total, course: Course) => {
      const selected_course = recomendedCourses.find(c => c.url === course.url);
      return total + (selected_course ? parseCoursePrice(selected_course.price) : 0);
    }, 0);
  };

  const getSelectedCoursesCount = () => {
    return selectedCourses.length;
  };

  const analyzeTimeline = () => {
    localStorage.setItem("selectedCourses", JSON.stringify(selectedCourses));
    navigate('/loading?type=learning-path-analysis', { state: { selectedCourses, learningPreferences } });
  };

  const getProviderLogo = (provider: string) => {
    const logos: { [key: string]: string } = {
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen text-left">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Select Courses</h2>
              <p className="text-gray-600">Choose your learning path and validate your timeline</p>
            </div>
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

          {/* Validation Results */}
          {validationResults && showValidation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">AI Validation Results</h2>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {showValidation ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              <ValidationDisplay 
                validation={validationResults} 
                showDetails={true}
                className="mb-4"
              />
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm mb-1">
                      Enhanced AI Validation
                    </h4>
                    <p className="text-blue-700 text-sm">
                      These recommendations have been validated using our multi-layer AI system 
                      that checks semantic relevance, contextual accuracy, domain expertise, 
                      and overall quality to ensure the best learning outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {recomendedCourses.length} courses available
              </span>
              {getSelectedCoursesCount() > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {getSelectedCoursesCount()} selected
                </span>
              )}
            </div>
            
            <div className="grid gap-4">
              {recomendedCourses.map((course) => (
                <div 
                  key={course.url} 
                  className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                    selectedCourses.some(c => c.url === course.url)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => toggleCourseSelection(course)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-4 flex-1">
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
                            <span>{course.rating > 0 ? course.rating : 4.0} ({course.students ?? 1000})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{course.duration} duration</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>{course.price} VND</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span>Videos</span>
                          </div>
                        </div>
                        
                        {/* Skills Tags with Requirements Mapping */}
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                            <span>Skills you'll learn:</span>
                            <span className="text-xs text-blue-600">✓ = Matches your requirements</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {course.skills.map((skill, skillIndex) => {
                              const isRequired = isRequiredSkill(skill.name);
                              return (
                                <span 
                                  key={skillIndex} 
                                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                                    isRequired 
                                      ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm' 
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {isRequired && <span className="mr-1">✓</span>}
                                  {skill.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Learning Outcomes */}
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">You'll learn to:</div>
                          <ul className="text-gray-600 text-xs space-y-1">
                            {course.highlights.map((outcome, oIndex) => (
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
                  
                  {selectedCourses.some(c => c.url === course.url) && (
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
                <span className="font-semibold text-gray-900">{calculateTotalCost()} VND</span>
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
                Selected courses cost {calculateTotalCost()} VND, which exceeds your {learningPreferences.budget} VND budget by {calculateTotalCost() - learningPreferences.budget} VND.
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
    </div>
  );
};
