import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Target, TrendingUp, CheckCircle, X, Zap, Award, BookOpen, BarChart3, Clock } from 'lucide-react';
interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeCV?: (fileData: { file: File | null, targetRole: string, timeline: string }) => void;
}

const CVUploadModal: React.FC<CVUploadModalProps> = ({ isOpen, onClose, onAnalyzeCV }) => {
  const [analysisState, setAnalysisState] = useState('idle');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [learningType, setLearningType] = useState('individual');
  const [inputMethod, setInputMethod] = useState('upload');

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
      { skill: 'Kubernetes', priority: 'High', marketDemand: 95, salaryImpact: '+15%' },
      { skill: 'TensorFlow', priority: 'Medium', marketDemand: 88, salaryImpact: '+12%' },
      { skill: 'GraphQL', priority: 'Medium', marketDemand: 76, salaryImpact: '+8%' },
      { skill: 'Cloud Architecture', priority: 'High', marketDemand: 93, salaryImpact: '+18%' }
    ],
    overallScore: 78
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF, DOCX, or TXT file.');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const startAnalysis = () => {
    setAnalysisState('processing');
    setProgress(0);
    
    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalysisState('complete');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  // const startAnalysis = () => {
  //   console.log(onAnalyzeCV)
  //   console.log(uploadedFile)
  //   console.log(targetRole)
  //   console.log(timeline)
  //   if (onAnalyzeCV && uploadedFile && targetRole && timeline) {
  //     onAnalyzeCV({
  //       file: uploadedFile,
  //       targetRole,
  //       timeline
  //     });
  //   }
  //   // onClose(); // Close the modal after starting analysis
  // };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setUploadedFile(null);
    setProgress(0);
    setTargetRole('');
    setTimeline('');
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Beginner': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderCompleteForm = () => {
    return <>complete</>
  }

  const renderInitialForm = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career Goals Section */}
        <div className="space-y-6">
          {/* Learning Type Selection - Moved to top */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning approach
            </label>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  id="individual"
                  name="learningType"
                  type="radio"
                  value="individual"
                  checked={learningType === 'individual'}
                  onChange={(e) => setLearningType(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="individual" className="ml-2 text-sm text-gray-700">
                  Individual
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="project"
                  name="learningType"
                  type="radio"
                  value="project"
                  checked={learningType === 'project'}
                  onChange={(e) => setLearningType(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="project" className="ml-2 text-sm text-gray-700">
                  Project-based
                </label>
              </div>
            </div>
          </div>

          {/* Dynamic input based on learning type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {learningType === 'individual'
                ? "What's your target role or career goal?"
                : "What are the project requirements?"
              }
            </label>
            <textarea
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={learningType === 'individual'
                ? "e.g., Senior Full Stack Developer, Data Scientist, AI Engineer"
                : "e.g., Build a full-stack e-commerce platform with React and Node.js, implement AI-powered recommendations"
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your learning timeline?
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select your timeline</option>
              <option value="3-months">3 months - Rapid upskilling</option>
              <option value="6-months">6 months - Balanced growth</option>
              <option value="1-year">1 year - Comprehensive development</option>
              <option value="flexible">Flexible - Self-paced learning</option>
            </select>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          {/* Input Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to provide your information?
            </label>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  id="upload"
                  name="inputMethod"
                  type="radio"
                  value="upload"
                  checked={inputMethod === 'upload'}
                  onChange={(e) => setInputMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="upload" className="ml-2 text-sm text-gray-700">
                  Upload CV
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="akajob"
                  name="inputMethod"
                  type="radio"
                  value="akajob"
                  checked={inputMethod === 'akajob'}
                  onChange={(e) => setInputMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="akajob" className="ml-2 text-sm text-gray-700">
                  Sync with Akajob
                </label>
              </div>
            </div>
          </div>

          {inputMethod === 'upload' ? (
            <div
              className={`border-2 border-dashed rounded-lg p-3 text-center transition-all duration-200 ${dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
              />

              <div className="flex flex-col items-center space-y-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dragActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                  <Upload className={`w-3 h-3 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Upload Your CV
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    PDF, DOCX, TXT up to 10MB
                  </p>
                </div>

                <button
                  onClick={onButtonClick}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Choose File</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-green-300 rounded-lg p-3 text-center bg-green-50">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Connected to Akajob
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Your profile and skills have been synced successfully
                  </p>
                </div>

                <div className="flex items-center space-x-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Successfully Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* Success message - show if ready to analyze */}
          {((uploadedFile && inputMethod === 'upload') || inputMethod === 'akajob') && targetRole && timeline && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ready to analyze!</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                File: {uploadedFile?.name} | Target: {targetRole} | Timeline: {timeline}
              </p>
              <button
                onClick={startAnalysis}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Start AI Analysis</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  };

  const renderProcessingView = () => {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your CV</h3>
            <p className="text-gray-600 mb-6">Our AI is extracting skills, experience, and identifying opportunities...</p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className={`flex items-center space-x-3 ${progress > 20 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 20 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {progress > 20 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
                <span className="text-sm">Document parsing and text extraction</span>
              </div>
              <div className={`flex items-center space-x-3 ${progress > 50 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 50 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {progress > 50 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
                <span className="text-sm">Skills and experience identification</span>
              </div>
              <div className={`flex items-center space-x-3 ${progress > 80 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 80 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {progress > 80 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
                <span className="text-sm">Market analysis and gap identification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompleteView = () => {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 hide-scrollbar">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CV Analysis Complete</h1>
                <p className="text-gray-600">File: {uploadedFile?.name}</p>
                <p className="text-sm text-blue-600">Target: {targetRole} | Timeline: {timeline}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analysisResults.overallScore}%</div>
                <div className="text-sm text-gray-600">Skills Match</div>
              </div>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload New CV
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Skills Analysis */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Skills Analysis</h2>
              <span className="text-sm text-gray-500">Current skills and growth opportunities</span>
            </div>

            {/* Current Skills */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Current Skills</h3>
                <span className="text-sm text-gray-500">({analysisResults.extractedSkills.length} detected)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {analysisResults.extractedSkills.map((skill, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{skill.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>{skill.category}</span>
                      <span>{skill.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${skill.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Gap */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Recommended Skills to Learn</h3>
                <span className="text-sm text-gray-500">High-impact opportunities</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {analysisResults.skillsGap.map((gap, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{gap.skill}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                        {gap.priority}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span className="text-gray-600">Demand: {gap.marketDemand}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3 text-green-600" />
                        <span className="text-gray-600">Impact: {gap.salaryImpact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-4">
            {/* Experience */}
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
                  <div key={index} className="border-l-3 border-green-200 pl-3">
                    <div className="font-medium text-gray-900 text-sm">{edu.degree}</div>
                    <div className="text-xs text-gray-600">{edu.institution}</div>
                    <div className="text-xs text-gray-500">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Generate Learning Path</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    );
  };


  const renderForm = () => {
    if (analysisState === 'processing') {
      return renderProcessingView();
    }

    if (analysisState === 'complete') {
      return renderCompleteView();
    }

    return renderInitialForm();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create New Learning Path</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started with Your Learning Journey</h3>
            <p className="text-gray-600">Upload your CV and tell us about your career goals for personalized analysis</p>
          </div>
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default CVUploadModal;
