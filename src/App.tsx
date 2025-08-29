import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StravaProvider } from './contexts/StravaContext';
import { GoalsProvider } from './contexts/GoalsContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ImportRoutes from './pages/ImportRoutes';
import ActivityAnalysis from './pages/ActivityAnalysis';
import Statistics from './pages/Statistics';
import ProgressAnalysis from './pages/ProgressAnalysis';
import TrainingPlans from './pages/TrainingPlans';
import TrainingZones from './pages/TrainingZones';
import Settings from './pages/Settings';
import StravaCallback from './components/StravaCallback';
import GoogleFitCallback from './components/GoogleFitCallback';


function App() {
  return (
    <StravaProvider>
      <GoalsProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<ImportRoutes />} />
                  <Route path="/import-routes" element={<ImportRoutes />} />
                  <Route path="/activity-analysis" element={<ActivityAnalysis />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/progress-analysis" element={<ProgressAnalysis />} />
                  <Route path="/training-plans" element={<TrainingPlans />} />
                  <Route path="/training-zones" element={<TrainingZones />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/strava-callback" element={<StravaCallback />} />
                  <Route path="/google-fit-callback" element={<GoogleFitCallback />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </GoalsProvider>
    </StravaProvider>
  );
}

export default App;
