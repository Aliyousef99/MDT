import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EmployeeProfiles from './components/EmployeeProfiles';
import Announcements from './components/Announcements';
import Tags from './components/Tags';
import './App.css';
import Reports from './components/Reports';

function App() {
    // Load initial view from localStorage or default to 'dashboard'
    const initialView = localStorage.getItem('currentView') || 'dashboard';

    const [currentView, setCurrentView] = useState(initialView);  // Set the initial state from localStorage
    const [selectedProfile, setSelectedProfile] = useState(null);

    // Save current view to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('currentView', currentView);
    }, [currentView]);

    return (
        <div className="App">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            {currentView === 'profiles' && (
                <EmployeeProfiles
                    selectedProfile={selectedProfile}
                    setSelectedProfile={setSelectedProfile}
                />
            )}
            {currentView === 'tags' && (
                <Tags
                    setCurrentView={setCurrentView}
                    setSelectedProfile={setSelectedProfile}
                />
            )}

            {currentView === 'reports' && (
                <Reports />
            )}
            {currentView === 'announcements' && <Announcements />}
        </div>
    );
}

export default App;
