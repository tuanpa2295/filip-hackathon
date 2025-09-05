import { useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import {
  CourseSelection,
  LearningPathDetails,
  LearningPathList,
  LoadingPage,
  SkillAnalysis,
  SkillSelection,
  TimelineAnalysis,
} from './pages';

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<LearningPathList />} />
      <Route path="/course-selection" element={<CourseSelection/>} />
      <Route path="/create-learning-path" element={<SkillAnalysis />} />
      <Route path="/learning-path/:id" element={<LearningPathDetails />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/skill-selection" element={<SkillSelection />} />
      <Route path="/timeline-analysis" element={<TimelineAnalysis />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
