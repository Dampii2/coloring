import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Weave from './pages/Weave.jsx';
import StoryView from './pages/StoryView.jsx';
import StoryGuide from './pages/StoryGuide.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Weave />} />
        <Route path="/story/:id" element={<StoryView />} />
        <Route path="/onboarding" element={<StoryGuide />} />
      </Routes>
    </BrowserRouter>
  );
}
