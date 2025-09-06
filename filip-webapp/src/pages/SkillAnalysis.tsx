import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Brain, CheckCircle, Zap, Clock } from 'lucide-react';
import { requestSkillAnalysis } from '@/utils/api';

interface ProgressStepProps {
  active: boolean;
  label: string;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ active, label }: ProgressStepProps) => {
  return (
    <div className={`flex items-center space-x-3 ${active ? 'text-green-600' : 'text-gray-400'}`}>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-green-100' : 'bg-gray-100'}`}
      >
        {active ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

export const SkillAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('');
  const [inputMethod, setInputMethod] = useState<'cv' | 'akajob'>('cv');
  const [learningType, setLearningType] = useState<'individual' | 'project'>('individual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

    if (fileExtension && allowedTypes.includes(fileExtension)) {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF, DOCX, or TXT file.');
    }
  };

  const startAnalysis = async () => {
    setAnalysisState('processing');
    setProgress(0);

    let currentProgress = 0;
    const maxProgress = 98;
    const totalDuration = inputMethod === 'cv' ? 35000 : 20000;
    const interval = totalDuration / maxProgress;

    const progressInterval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress >= maxProgress) {
        clearInterval(progressInterval);
      }

      setProgress(Math.floor(currentProgress));
    }, interval);

    const skillAnalysisInput = {
      provider: inputMethod,
      cv_file: uploadedFile as File,
      user_description: targetRole,
      learning_type: learningType,
      timeline,
    };

    const skillAnalysisResults = await requestSkillAnalysis(skillAnalysisInput);
    localStorage.removeItem("selectedSkills");
    localStorage.setItem('skillAnalysisResults', JSON.stringify(skillAnalysisResults));

    clearInterval(progressInterval);
    navigate('/skill-selection');
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (analysisState === 'processing') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your CV</h3>
            <p className="text-gray-600 mb-6">
              Our AI is extracting skills, experience, and identifying opportunities...
            </p>

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
              <ProgressStep label="Document parsing and text extraction" active={progress >= 15} />
              <ProgressStep label="Skills and experience identification" active={progress >= 35} />
              <ProgressStep label="Market analysis and gap identification" active={progress >= 55} />
              <ProgressStep label="Finalizing AI-generated response" active={progress >= 90} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen text-left">
      {/* Get Started Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with Your Learning Journey</h2>
          <p className="text-gray-600">
            Share your data and project requirements to get a personalized learning path and skill gap analysis
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Career Goals Section */}
          <div className="space-y-6">
            {/* Learning Type Selection - Moved to top */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning approach</label>
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="individual"
                    name="learningType"
                    type="radio"
                    value="individual"
                    checked={learningType === 'individual'}
                    onChange={(e) => setLearningType(e.target.value as 'individual')}
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
                    onChange={(e) => setLearningType(e.target.value as 'project')}
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
                  : 'What are the project requirements?'}
              </label>
              <textarea
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={
                  learningType === 'individual'
                    ? 'e.g., Senior Full Stack Developer, Data Scientist, AI Engineer'
                    : 'e.g., Build a full-stack e-commerce platform with React and Node.js, implement AI-powered recommendations'
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What's your learning timeline?</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your timeline</option>
                <option value="3m">3 months - Rapid upskilling</option>
                <option value="6m">6 months - Balanced growth</option>
                <option value="1y">1 year - Comprehensive development</option>
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
                    value="cv"
                    checked={inputMethod === 'cv'}
                    onChange={(e) => setInputMethod(e.target.value as 'cv')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="upload" className="ml-2 text-sm text-gray-700">
                    Upload CV
                  </label>
                </div>
                {/* <div className="flex items-center">
                  <input
                    id="akajob"
                    name="inputMethod"
                    type="radio"
                    value="akajob"
                    checked={inputMethod === 'akajob'}
                    onChange={(e) => setInputMethod(e.target.value as 'akajob')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="akajob" className="ml-2 text-sm text-gray-700">
                    Sync with Akajob
                  </label>
                </div> */}
              </div>
            </div>

            {inputMethod === 'cv' ? (
              <div
                className={`border-2 border-dashed rounded-lg p-3 text-center transition-all duration-200 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      dragActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <Upload className={`w-3 h-3 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadedFile ? `Selected: ${uploadedFile.name}` : 'Upload Your CV'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">DOCX up to 10MB</p>
                  </div>

                  <button
                    onClick={onButtonClick}
                    className={`${uploadedFile 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center space-x-1`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>{uploadedFile ? 'Change File' : 'Choose File'}</span>
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
                    <p className="text-sm font-medium text-gray-900">Connected to Akajob</p>
                    <p className="text-xs text-gray-600 mb-2">Your profile and skills have been synced successfully</p>
                  </div>

                  <div className="flex items-center space-x-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                    <CheckCircle className="w-3 h-3" />
                    <span>Successfully Connected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - Always visible */}
            <div className="mt-6">
              <button
                onClick={startAnalysis}
                disabled={!targetRole || !timeline || (!uploadedFile && inputMethod === 'cv')}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  targetRole && timeline && ((uploadedFile && inputMethod === 'cv') || inputMethod === 'akajob')
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Start AI Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
