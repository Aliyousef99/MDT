// src/components/Calendar.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CustomCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div style={{ margin: '20px' }}>
            <Calendar
                onChange={handleDateChange}
                value={selectedDate}
            />
        </div>
    );
};

export default CustomCalendar;
