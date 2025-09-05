import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import type { SkillAnalysisResponse } from '@/utils/api';
import { capitalizeFirst, getConfidenceBySkillName } from '@/utils';
import type { AnalysisData, Skill } from '@/types';

export const SkillSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData>({ skills: [] } as AnalysisData);
  

  useEffect(() => {
    // Restore
    const savedSelectedSkills = localStorage.getItem("selectedSkills");
    if (savedSelectedSkills) {
      setSelectedSkills(JSON.parse(savedSelectedSkills));
    }
  }, [navigate]);

  useEffect(function () {
    const savedskillAnalysisResults = localStorage.getItem('skillAnalysisResults');
    if (savedskillAnalysisResults) {
      const skillAnalysisResults: SkillAnalysisResponse = JSON.parse(
        savedskillAnalysisResults
      );

      setAnalysisData({
        skills: skillAnalysisResults?.skills_gap.map((skill) => ({
          name: skill.name,
          type: skill.type,
          level: capitalizeFirst(skill.level) as Skill['level'],
          confidence: getConfidenceBySkillName(skillAnalysisResults.extracted_skills, skill.name),
          priority: skill.priority,
          salaryImpact: skill.salary_impact,
          marketDemand: skill.market_demand,
          description: skill.description,
        })),
      });
    }
  }, []);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.name === skill.name);
      if (exists) {
        return prev.filter((s) => s.name !== skill.name);
      } else {
        return [...prev, skill];
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFindCourses = () => {
    // Navigate to loading page with course-matching type
    localStorage.setItem("selectedSkills", JSON.stringify(selectedSkills));
    navigate('/loading?type=course-matching', { state: { selectedSkills } });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen text-left">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Skills for Your Learning Path</h2>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisData.skills.map((skill, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedSkills.some(s => s.name === skill.name)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSkill(skill)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{skill.name}</h4>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.type === 'current' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {skill.type === 'current' ? 'Current Skill' : 'New Skill'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(skill.priority)}`}>
                    {skill.priority + ' priority'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-3">
                {skill.type === 'current' ? `${skill.level} • ${skill.confidence}% confidence` : 'Recommended skill'}
              </div>

              {/* Priority Description */}
              <div className="text-xs text-gray-700 mb-3 leading-relaxed">{skill.description}</div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">{skill.marketDemand}% demand</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">💰</span>
                  <span className="font-medium text-green-600">{skill.salaryImpact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Current skill
            </span>
            <span>Skills to improve</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">New skill</span>
            <span>Skills to learn</span>
          </div>
        </div>
      </div>

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Skills ({selectedSkills.length})</h3>

          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={handleFindCourses}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto ${
            selectedSkills.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={selectedSkills.length === 0}
        >
          <Zap className="w-5 h-5" />
          <span>
            {selectedSkills.length > 0
              ? `Find Courses for ${selectedSkills.length} Skills`
              : 'Select Skills to Continue'}
          </span>
        </button>
      </div>
    </div>
  );
};
