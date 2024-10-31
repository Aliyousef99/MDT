// Dashboard.js
import React, { useEffect, useState } from 'react';
import Announcements from './Announcements';

const Dashboard = () => {
    const [overview, setOverview] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingTasks: 0,
    });

    useEffect(() => {
        fetch('/api/dashboard')
            .then((res) => res.json())
            .then((data) => setOverview(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="overview">
                <div className="card">
                    <h2>Total Employees</h2>
                    <p>{overview.totalEmployees}</p>
                </div>
                <div className="card">
                    <h2>Active Employees</h2>
                    <p>{overview.activeEmployees}</p>
                </div>
                <div className="card">
                    <h2>Pending Tasks</h2>
                    <p>{overview.pendingTasks}</p>
                </div>
            </div>

            {/* Now Announcements is completely independent */}
            <Announcements />
        </div>
    );
};

export default Dashboard;
