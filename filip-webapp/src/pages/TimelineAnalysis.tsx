import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { createLearningPath, type CreateLearningPathRequest } from '@/utils';
import type { AnalysisResults } from '@/types';


export const TimelineAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const analysisResults = location.state?.analysisResults as AnalysisResults;

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleCreateLearningPath = async () => {
    const payload: CreateLearningPathRequest = {
      name: location.state?.learningPreferences?.learningPathName,
      start_date: location.state?.learningPreferences?.startDate,
      end_date: location.state?.learningPreferences?.targetDate,
      estimated_hours: location.state?.analysisResults?.totalHours,
      learningpath_courses: location.state?.selectedCourses?.map((course: any) => ({
        course_title: course.title,
        course_description: course.description,
        course_instructor: course.instructor,
        course_level: course.level,
        course_duration: course.duration,
        course_price: course.price,
        course_rating: course.rating,
        course_skills: JSON.stringify(course.skills),
        course_highlights: JSON.stringify(course.highlights),
      })),
    };
    await createLearningPath(payload)
      .then((res) => {
        navigate(`/learning-path/${res?.id}`, { state: { learning_path: res } });
      })
      .catch(console.error);
  };

  if (!analysisResults) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen text-left">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Data</h2>
          <p className="text-gray-600">Please return to course selection and analyze your timeline first.</p>
          <button
            onClick={() => navigate('/course-selection')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Course Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen text-left">
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
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
              {analysisResults.riskLevel === 'high'
                ? 'High Risk Timeline'
                : analysisResults.riskLevel === 'medium'
                  ? 'Moderate Risk Timeline'
                  : 'Timeline Looks Good'}
            </h3>
          </div>
          <p className="text-sm mb-3">
            Based on {analysisResults.totalHours} total hours at {analysisResults.weeklyHours} hours/week, you'll need{' '}
            {analysisResults.totalWeeks} weeks to complete all courses.
          </p>
          <div className="text-sm">
            <strong>Estimated completion:</strong> {new Date(analysisResults.estimatedEndDate).toLocaleDateString()}
            <span className="ml-2">
              (
              {analysisResults.daysDiff >= 0
                ? `${analysisResults.daysDiff} days early`
                : `${Math.abs(analysisResults.daysDiff)} days late`}
              )
            </span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900">AI Recommendations:</h4>
          {analysisResults.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                rec.type === 'warning'
                  ? 'border-red-200 bg-red-50'
                  : rec.type === 'caution'
                    ? 'border-yellow-200 bg-yellow-50'
                    : rec.type === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div
                className={`font-semibold mb-1 ${
                  rec.type === 'warning'
                    ? 'text-red-800'
                    : rec.type === 'caution'
                      ? 'text-yellow-800'
                      : rec.type === 'success'
                        ? 'text-green-800'
                        : 'text-blue-800'
                }`}
              >
                {rec.title}
              </div>
              <p
                className={`text-sm mb-2 ${
                  rec.type === 'warning'
                    ? 'text-red-700'
                    : rec.type === 'caution'
                      ? 'text-yellow-700'
                      : rec.type === 'success'
                        ? 'text-green-700'
                        : 'text-blue-700'
                }`}
              >
                {rec.message}
              </p>
              <div
                className={`text-xs font-medium ${
                  rec.type === 'warning'
                    ? 'text-red-600'
                    : rec.type === 'caution'
                      ? 'text-yellow-600'
                      : rec.type === 'success'
                        ? 'text-green-600'
                        : 'text-blue-600'
                }`}
              >
                Suggested Action: {rec.action}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCreateLearningPath}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Create My Learning Path</span>
          </button>

          <button
            onClick={() =>
              navigate('/course-selection', {
                state: {
                  selectedCourses: location.state?.selectedCourses,
                  learningPreferences: location.state?.learningPreferences,
                },
              })
            }
            className="border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Return to Course Selection
          </button>
        </div>
      </div>
    </div>
  );
};
