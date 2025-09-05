import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Brain, CheckCircle, Clock, Target, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { analyzeLearningPath, fetchCourseRecommendations, type AnalyzeLearningPathRequest } from '@/utils';

export const LoadingPage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const analysisType = searchParams.get('type') ?? 'skills-analysis';
  const location = useLocation();
  const selectedSkills = location.state?.selectedSkills ?? [];
  const selectedCourses = location.state?.selectedCourses ?? [];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const finishProgress = () => {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + 5, 100);
        });
      }, 100);
    };

    const runAnalysis = async () => {

      try {
        if (analysisType === 'skills-analysis') {
          finishProgress();
          setTimeout(() => navigate('/skill-selection'), 1000);
          return;
        }

        if (analysisType === 'course-matching') {
          const res = await fetchCourseRecommendations(selectedSkills);
          localStorage.removeItem("selectedCourses");
          localStorage.setItem("recommendedCourses", JSON.stringify(res?.courses));
          finishProgress();
          setTimeout(() => {
            navigate("/course-selection", { state: { recommendations: res } });
          }, 1000);
        }

        if (analysisType === 'learning-path-analysis') {
          const payload: AnalyzeLearningPathRequest = {
            available_hours_per_week: location.state?.learningPreferences.hoursPerWeek,
            start_date: location.state?.learningPreferences.startDate,
            end_date: location.state?.learningPreferences.targetDate,
            courses: selectedCourses,
          };

          const res = await analyzeLearningPath(payload);
          finishProgress();
          setTimeout(() => {
            navigate('/timeline-analysis', {
              state: {
                analysisResults: res,
                selectedCourses,
                learningPreferences: location.state?.learningPreferences,
              },
            });
          }, 1000);
        }
      } catch (err) {
        console.error("❌ Analysis failed:", err);
        clearInterval(interval);
      }
    };

    // Begin slow progress while API runs
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 10;
        return prev;
      });
    }, 200);

    runAnalysis();

    return () => clearInterval(interval);
  }, [analysisType, location.state?.selectedSkills, navigate]);

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'skills-analysis':
        return 'Skills Analysis';
      case 'course-matching':
        return 'Course Matching';
      case 'learning-path-analysis':
        return 'Learning Path Analysis'
      default:
        return 'Analysis';
    }
  };

  const getProcessingSteps = () => {
    if (analysisType === 'course-matching') {
      return [
        {
          icon: <Brain className="w-4 h-4" />,
          title: 'Skills Analysis',
          description: 'Analyzing your current skills profile',
          threshold: 30,
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          title: 'Course Search',
          description: 'Finding relevant courses and learning materials',
          threshold: 60,
        },
        {
          icon: <GraduationCap className="w-4 h-4" />,
          title: 'Path Generation',
          description: 'Creating personalized learning path',
          threshold: 90,
        },
      ];
    } else if (analysisType === 'learning-path-analysis') {
      return [
        {
          icon: <Brain className="w-4 h-4" />,
          title: 'Timeline Analysis',
          description: 'Analyzing your selected timeline',
          threshold: 10,
        },
        {
          icon: <Brain className="w-4 h-4" />,
          title: 'Evaluate Risk',
          description: 'Finding risks and evaluate level of risks',
          threshold: 30,
        },
        {
          icon: <Brain className="w-4 h-4" />,
          title: 'Personalized Learning Path',
          description: 'Suggest personalized, actionable recommendations',
          threshold: 60,
        },
      ];
    }

    return [
      {
        icon: <Clock className="w-4 h-4" />,
        title: 'Document Analysis',
        description: 'Extracting skills and experience',
        threshold: 20,
      },
      {
        icon: <Target className="w-4 h-4" />,
        title: 'Skills Assessment',
        description: 'Evaluating proficiency levels',
        threshold: 50,
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Market Analysis',
        description: 'Identifying growth opportunities',
        threshold: 80,
      },
    ];
  };

  const getDescription = () => {
    switch (analysisType) {
      case 'skills-analysis':
        return 'Our AI is analyzing your profile and identifying opportunities...';
      case 'course-matching':
        return 'Finding the best courses to match your skills and goals...';
      case 'learning-path-analysis':
        return 'Our AI is analyzing and evaluating risks...'
      default:
        return 'Processing your request...';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {/* Animated Brain Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{getAnalysisTitle()} in Progress</h3>
          <p className="text-gray-600 mb-6">{getDescription()}</p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4 text-left max-w-md mx-auto">
            {getProcessingSteps().map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 ${progress > step.threshold ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${progress > step.threshold ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  {progress > step.threshold ? <CheckCircle className="w-4 h-4" /> : step.icon}
                </div>
                <div>
                  <span className="text-sm font-medium">{step.title}</span>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Animation */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
