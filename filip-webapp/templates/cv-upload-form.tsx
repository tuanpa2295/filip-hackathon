import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Target, CheckCircle, Zap } from 'lucide-react';

const CVUploadForm = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
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
    // This would navigate to the analysis results page
    console.log('Starting analysis with:', {
      file: uploadedFile?.name,
      targetRole,
      timeline
    });
    alert('Analysis would start here - in real app, this would navigate to results page');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Intelligent Learning Pathways
          <span className="block text-2xl text-blue-600 font-medium mt-1">(FILIP)</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Your AI-powered personal learning agent that intelligently generates highly customized upskilling pathways to bridge skills gaps, boost engagement, and future-proof your career.
        </p>
      </div>

      {/* Get Started Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with Your Learning Journey</h2>
          <p className="text-gray-600">Upload your CV and tell us about your career goals for personalized analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Career Goals Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your target role or career goal?
              </label>
              <textarea
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Describe your target role and career aspirations. For example: 'I want to become a Senior Full Stack Developer specializing in React and Node.js, with expertise in cloud architecture and team leadership responsibilities.'"
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

            {/* What happens next */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>AI analyzes your CV and identifies current skills</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Compare skills against your target role requirements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Generate personalized learning missions and pathways</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Track progress with gamified learning experiences</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                dragActive 
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
              
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {dragActive ? 'Drop your CV here!' : 'Upload Your CV'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your CV or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOCX, and TXT files up to 10MB
                  </p>
                </div>
                
                <button
                  onClick={onButtonClick}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Choose File</span>
                </button>
              </div>
            </div>

            {/* Upload button - only show if file selected and goals filled */}
            {uploadedFile && targetRole && timeline && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Ready to analyze!</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  File: {uploadedFile.name} | Target: {targetRole} | Timeline: {timeline}
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
      </div>
    </div>
  );
};

export default CVUploadForm;