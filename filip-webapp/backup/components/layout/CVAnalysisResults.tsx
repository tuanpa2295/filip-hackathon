import React, { useState } from 'react';
import { Brain, Target, TrendingUp, CheckCircle, Zap, Award, BookOpen, BarChart3 } from 'lucide-react';
import LearningPathReviewModal from './LearningPathReviewModal';

interface CVAnalysisResultsProps {
    fileData?: {
      file: File | null;
      targetRole: string;
      timeline: string;
    };
    onBack: () => void;
    onCreatePath: (currentSkills: string[], newSkills: string[]) => void;
}

const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({ 
    fileData, 
    onBack, 
    onCreatePath 
  }) => {
    const [selectedCurrentSkills, setSelectedCurrentSkills] = useState<string[]>([]);
    const [selectedRecommendedSkills, setSelectedRecommendedSkills] = useState<string[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Mock data - in real app this would come from props or API
  const uploadedFileName = fileData?.file?.name || "John_Doe_CV.pdf";
  const targetRole = fileData?.targetRole || "Senior Full Stack Developer specializing in React and Node.js, with expertise in cloud architecture and team leadership responsibilities";
  const timeline = fileData?.timeline || "6-months";

  // Mock analysis results
  const analysisResults = {
    extractedSkills: [
      { name: 'JavaScript', level: 'Advanced', confidence: 92, category: 'Programming' },
      { name: 'React', level: 'Intermediate', confidence: 87, category: 'Frontend' },
      { name: 'Python', level: 'Intermediate', confidence: 85, category: 'Programming' },
      { name: 'Machine Learning', level: 'Beginner', confidence: 78, category: 'AI/ML' },
      { name: 'SQL', level: 'Advanced', confidence: 91, category: 'Database' },
      { name: 'Docker', level: 'Beginner', confidence: 82, category: 'DevOps' }
    ],
    experience: {
      totalYears: 5,
      currentRole: 'Full Stack Developer',
      industry: 'Technology',
      companies: ['TechCorp', 'StartupXYZ', 'InnovateCo']
    },
    education: [
      { degree: 'Bachelor of Computer Science', institution: 'Tech University', year: 2019 },
      { degree: 'AWS Certified Developer', institution: 'Amazon Web Services', year: 2023 }
    ],
    skillsGap: [
      { 
        skill: 'Kubernetes', 
        priority: 'High', 
        marketDemand: 95, 
        salaryImpact: '+15%',
        relevance: 'Critical for Senior Full Stack Developer roles',
        description: 'Container orchestration is essential for modern cloud deployments and DevOps practices'
      },
      { 
        skill: 'TensorFlow', 
        priority: 'Medium', 
        marketDemand: 88, 
        salaryImpact: '+12%',
        relevance: 'Emerging requirement for AI-enhanced applications',
        description: 'Machine learning integration becoming standard in full-stack development'
      },
      { 
        skill: 'GraphQL', 
        priority: 'Medium', 
        marketDemand: 76, 
        salaryImpact: '+8%',
        relevance: 'Modern API development standard',
        description: 'Replaces REST APIs in many enterprise applications, improves data fetching efficiency'
      },
      { 
        skill: 'Cloud Architecture', 
        priority: 'High', 
        marketDemand: 93, 
        salaryImpact: '+18%',
        relevance: 'Essential for senior-level system design',
        description: 'Required for scalable application design and infrastructure planning'
      }
    ],
    overallScore: 78
  };

  const toggleCurrentSkill = (skillName: string) => {
    setSelectedCurrentSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const toggleRecommendedSkill = (skillName: string) => {
    setSelectedRecommendedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const getSkillLevelColor = (level: string) => {
    switch(level) {
      case 'Advanced': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Beginner': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreateLearningPath = () => {
    // Create learning path with selected skills
    console.log('Creating learning path with:', {
      currentSkills: selectedCurrentSkills,
      newSkills: selectedRecommendedSkills
    });
    
    // Close modal if open
    setIsReviewModalOpen(false);
    
    // Navigate to dashboard with the selected skills
    onCreatePath(selectedCurrentSkills, selectedRecommendedSkills);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CV Analysis Complete</h1>
              <p className="text-gray-600">File: {uploadedFileName}</p>
              <p className="text-sm text-blue-600">Target: {targetRole} | Timeline: {timeline}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analysisResults.overallScore}%</div>
              <div className="text-sm text-gray-600">Skills Match</div>
            </div>
            <button 
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Upload New CV
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Combined Skills Analysis */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Skills Analysis</h2>
            <span className="text-sm text-gray-500">Current skills and growth opportunities</span>
          </div>
          
          {/* Current Skills Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Current Skills</h3>
              <span className="text-sm text-gray-500">({analysisResults.extractedSkills.length} detected)</span>
              <span className="text-xs text-blue-600 ml-2">✓ Select skills to improve</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysisResults.extractedSkills.map((skill, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    selectedCurrentSkills.includes(skill.name)
                      ? 'border-green-500 bg-green-100 shadow-md'
                      : 'border-green-200 bg-green-50/50 hover:border-green-300'
                  }`}
                  onClick={() => toggleCurrentSkill(skill.name)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCurrentSkills.includes(skill.name)}
                        onChange={() => toggleCurrentSkill(skill.name)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <h4 className="font-medium text-gray-900 text-sm">{skill.name}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2 ml-6">
                    <span>{skill.category}</span>
                    <span>{skill.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${skill.confidence}%` }}
                    ></div>
                  </div>
                  {selectedCurrentSkills.includes(skill.name) && (
                    <div className="mt-2 ml-6 text-xs text-green-700 font-medium">
                      ✓ Selected for improvement
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gap Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-4 h-4 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Recommended Skills to Learn</h3>
              <span className="text-sm text-gray-500">High-impact opportunities for your target role</span>
              <span className="text-xs text-blue-600 ml-2">✓ Select skills to learn</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResults.skillsGap.map((gap, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedRecommendedSkills.includes(gap.skill)
                      ? 'border-red-500 bg-red-100 shadow-md'
                      : 'border-red-200 bg-red-50/50 hover:border-red-300'
                  }`}
                  onClick={() => toggleRecommendedSkill(gap.skill)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRecommendedSkills.includes(gap.skill)}
                        onChange={() => toggleRecommendedSkill(gap.skill)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <h4 className="font-semibold text-gray-900 text-lg">{gap.skill}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                      {gap.priority} Priority
                    </span>
                  </div>
                  
                  {selectedRecommendedSkills.includes(gap.skill) && (
                    <div className="mb-3 p-2 bg-red-200 rounded-md">
                      <div className="text-xs text-red-800 font-medium">
                        ✓ Added to your learning path
                      </div>
                    </div>
                  )}

                  {/* Target Relevance */}
                  <div className="mb-3 p-2 bg-blue-50 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Target Role Relevance</span>
                    </div>
                    <p className="text-xs text-blue-700 font-medium">{gap.relevance}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{gap.description}</p>

                  {/* Market Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Market Demand</div>
                        <div className="font-semibold text-blue-600">{gap.marketDemand}%</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">Salary Impact</div>
                        <div className="font-semibold text-green-600">{gap.salaryImpact}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedRecommendedSkills.includes(gap.skill) ? 'bg-red-600' : 'bg-red-500'
                      }`}
                      style={{ width: `${gap.marketDemand}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-4">
          {/* Experience Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-purple-600" />
              <h3 className="text-lg font-medium">Experience</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Experience</span>
                <span className="font-medium">{analysisResults.experience.totalYears} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Role</span>
                <span className="font-medium text-xs">{analysisResults.experience.currentRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry</span>
                <span className="font-medium">{analysisResults.experience.industry}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-4 h-4 text-green-600" />
              <h3 className="text-lg font-medium">Education</h3>
            </div>
            <div className="space-y-2">
              {analysisResults.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-green-200 pl-3">
                  <div className="font-medium text-gray-900 text-sm">{edu.degree}</div>
                  <div className="text-xs text-gray-600">{edu.institution}</div>
                  <div className="text-xs text-gray-500">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path Summary */}
      {(selectedCurrentSkills.length > 0 || selectedRecommendedSkills.length > 0) && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md flex items-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>
              Review Selected Skills ({selectedCurrentSkills.length + selectedRecommendedSkills.length})
            </span>
          </button>
        </div>
      )}

      {/* Learning Path Review Modal */}
      <LearningPathReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onCreatePath={handleCreateLearningPath}
        selectedCurrentSkills={selectedCurrentSkills}
        selectedRecommendedSkills={selectedRecommendedSkills}
        extractedSkills={analysisResults.extractedSkills}
        skillsGap={analysisResults.skillsGap}
        getSkillLevelColor={getSkillLevelColor}
        getPriorityColor={getPriorityColor}
      />

      {/* Action Buttons - Removed Generate Learning Path button */}
      <div className="mt-6 flex justify-center space-x-4">
        <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
};

export default CVAnalysisResults;