import React from 'react';
import { CheckCircle, Target, Zap, X } from 'lucide-react';

interface LearningPathReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePath: (currentSkills: string[], newSkills: string[]) => void;
  selectedCurrentSkills: string[];
  selectedRecommendedSkills: string[];
  extractedSkills: Array<{
    name: string;
    level: string;
    confidence: number;
    category: string;
  }>;
  skillsGap: Array<{
    skill: string;
    priority: string;
    marketDemand: number;
    salaryImpact: string;
    relevance: string;
    description: string;
  }>;
  getSkillLevelColor: (level: string) => string;
  getPriorityColor: (priority: string) => string;
}

const LearningPathReviewModal: React.FC<LearningPathReviewModalProps> = ({
  isOpen,
  onClose,
  onCreatePath,
  selectedCurrentSkills,
  selectedRecommendedSkills,
  extractedSkills,
  skillsGap,
  getSkillLevelColor,
  getPriorityColor
}) => {
  if (!isOpen) return null;
  
  const handleCreatePath = () => {
    onCreatePath(selectedCurrentSkills, selectedRecommendedSkills);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Personalized Learning Path</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills to Improve */}
            {selectedCurrentSkills.length > 0 && (
              <div>
                <h4 className="font-medium text-green-800 mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Skills to Improve ({selectedCurrentSkills.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedCurrentSkills.map((skillName, index) => {
                    const skill = extractedSkills.find(s => s.name === skillName);
                    return skill && (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                        <span className="font-medium text-gray-900">{skillName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor(skill.level)}`}>
                          {skill.level} → Advanced
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills to Learn */}
            {selectedRecommendedSkills.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-3 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>New Skills to Learn ({selectedRecommendedSkills.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedRecommendedSkills.map((skillName, index) => {
                    const skill = skillsGap.find(s => s.skill === skillName);
                    return skill && (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-200">
                        <span className="font-medium text-gray-900">{skillName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(skill.priority)}`}>
                          {skill.priority} Priority
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Learning Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Total Skills Selected: </span>
                <span className="font-semibold text-blue-600">
                  {selectedCurrentSkills.length + selectedRecommendedSkills.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Estimated Timeline: </span>
                <span className="font-semibold text-purple-600">
                  {selectedCurrentSkills.length + selectedRecommendedSkills.length <= 3 ? '2-3 months' : 
                  selectedCurrentSkills.length + selectedRecommendedSkills.length <= 6 ? '4-6 months' : '6+ months'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={handleCreatePath}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Generate Learning Path</span>
            </button>
            <button 
              onClick={onClose} 
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathReviewModal;