import React, { useState, useEffect } from 'react';
import '../styles/Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newReportTitle, setNewReportTitle] = useState('');
    const [newReportContent, setNewReportContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportContent, setReportContent] = useState('');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Fetch the reports from the backend
    useEffect(() => {
        fetch('http://localhost:5000/api/reports')
            .then(res => res.json())
            .then(data => setReports(data))
            .catch(err => console.error('Error fetching reports:', err));
    }, []);

    const handleCreateReport = () => {
        const newReport = {
            title: newReportTitle,
            content: newReportContent,
        };

        fetch('http://localhost:5000/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReport),
        })
        .then(res => res.json())
        .then(data => {
            setReports([data, ...reports]);
            setIsCreating(false);
            setNewReportTitle('');
            setNewReportContent('');
        })
        .catch(err => console.error('Error creating report:', err));
    };

    const handleSaveReport = () => {
        const updatedReport = {
            title: selectedReport.title, 
            content: reportContent,
        };

        fetch(`http://localhost:5000/api/reports/${selectedReport.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReport),
        })
        .then(res => res.json())
        .then(data => {
            const updatedReports = reports.map(report =>
                report.id === selectedReport.id ? { ...data } : report
            );
            setReports(updatedReports);
            setSelectedReport(null);
        })
        .catch(err => console.error('Error updating report:', err));
    };

    const handleDeleteReport = (report) => {
        fetch(`http://localhost:5000/api/reports/${report.id}`, {  // Use report.id, not the whole object
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((res) => {
            if (res.ok) {
                // Remove the deleted report from the state
                setReports(reports.filter(r => r.id !== report.id));
                setIsConfirmingDelete(false);  // Close the delete confirmation modal
                setSelectedReport(null);  // Go back to the list view
            } else {
                console.error('Failed to delete report');
            }
        })
        .catch((err) => console.error('Error deleting report:', err));
    };
            
    const handleReportClick = (report) => {
        setSelectedReport(report);
        setReportContent(report.content);
    };


    const handleBack = () => {
        setSelectedReport(null);
    };

    const filteredReports = reports.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="reports-container">
            {selectedReport ? (
                <div className="report-details">
                    <button className="back-button" onClick={handleBack}>← Back</button>
                    <h3>{selectedReport.title}</h3>
                    <p className="report-date">
                        {new Date(selectedReport.date_created).toLocaleString('en-US', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                        })}
                    </p>
                    <textarea
                        className="report-textbox"
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                    />
                    <div className="report-actions">
                        <button className="save-button" onClick={handleSaveReport}>Save</button>
                        <button className="delete-button" onClick={() => setIsConfirmingDelete(true)}>Delete</button>
                    </div>

                    {isConfirmingDelete && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Are you sure you want to delete this report?</h3>
                                <div className="delete-buttons">
                                    <button className="confirm-delete" onClick={() => handleDeleteReport(selectedReport)}>Confirm</button>
                                    <button className="cancel-delete" onClick={() => setIsConfirmingDelete(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <button className="create-report-btn" onClick={() => setIsCreating(true)}>
                            + Create Report
                        </button>
                    </div>

                    {isCreating && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Create New Report</h3>
                                <input 
                                    type="text" 
                                    placeholder="Title" 
                                    value={newReportTitle}
                                    onChange={(e) => setNewReportTitle(e.target.value)} 
                                />
                                <textarea 
                                    placeholder="Content"
                                    value={newReportContent}
                                    onChange={(e) => setNewReportContent(e.target.value)}
                                />
                                <div className="create-buttons">
                                    <button className="create-button" onClick={handleCreateReport}>Submit</button>
                                    <button className="cancel-button" onClick={() => setIsCreating(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="reports-list">
                        {filteredReports.length > 0 ? (
                            filteredReports.map(report => (
                                <div 
                                    key={report.id} 
                                    className="report-card"
                                    onClick={() => handleReportClick(report)}
                                >
                                    <h3>{report.title}</h3>
                                    <p>{report.content}</p>
                                </div>
                            ))
                        ) : (
                            <p>No reports available.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
