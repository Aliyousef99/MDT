import React, { useEffect } from 'react';

const Sidebar = ({ currentView, setCurrentView }) => {
    const menuItems = [
        { name: 'Announcements', id: 'announcements' },
        { name: 'Profiles', id: 'profiles' },
        { name: 'Reports', id: 'reports' },
        { name: 'Tags', id: 'tags' },  // Updated item
    ];

    // Use useEffect to load the saved view from localStorage when the component mounts
    useEffect(() => {
        const savedView = localStorage.getItem('currentView');
        if (savedView) {
            setCurrentView(savedView);
        }
    }, [setCurrentView]);

    // Function to handle tab click and store in localStorage
    const handleTabClick = (viewId) => {
        setCurrentView(viewId);
        localStorage.setItem('currentView', viewId); // Save the selected tab to localStorage
    };

    return (
        <div className="sidebar">
            <h2>Employee System</h2>
            {menuItems.map((item) => (
                <div
                    key={item.id}
                    className={`menu-item ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}  // Update on click
                >
                    {item.name}
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
