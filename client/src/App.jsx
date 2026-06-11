import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Weave from './pages/Weave.jsx';
import StoryView from './pages/StoryView.jsx';
import StoryGuide from './pages/StoryGuide.jsx';
import Login from './pages/Login.jsx';

function RequireAuth({ children }) {
  const user = localStorage.getItem('weave_user');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Weave /></RequireAuth>} />
        <Route path="/story/:id" element={<RequireAuth><StoryView /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><StoryGuide /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
