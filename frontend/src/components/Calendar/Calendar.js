import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import axios from "axios";
import CalendarForm from "./CalendarForm";
import { useSelector } from "react-redux";

const BASE_URL = "http://localhost:5000/api/v1/";
const token = localStorage.getItem('token');

const Calendar = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
    const isAuth = useSelector(state => state.user.isAuth)

    const getTasks = async () => {
        try {
            const response = await axios.get(`${BASE_URL}get-tasks`, { headers: { Authorization: `Bearer ${token}` } });
            console.log('Tasks from server:', response.data);
            setTasks(response.data);
        } catch (err) {
            console.error('Error in getTasks on frontend:', err);
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    const events = tasks?.map(task => ({
        title: task.title,
        start: moment(task.startDate).format(),
        end: moment(task.endDate).format(),
        description: task.description,
        id: task._id,
    }));

    const handleDateClick = (arg) => {
        handleCloseForm();

        // setFormPosition({ x: arg.jsEvent.clientX, y: arg.jsEvent.clientY });
        setSelectedDate(new Date(arg.date));
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedDate(null);
        getTasks();
    };

    return (
        <div className="section">
            <div className={`calendar-modal ${!showForm ? 'hidden' : ''}`}>
                {showForm && selectedDate && (
                    <CalendarForm
                        selectedDate={selectedDate}
                        position={formPosition}
                        onClose={handleCloseForm}
                    />
                )}
            </div>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    start: 'today prev,next',
                    center: 'title',
                    end: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height={'90vh'}
                events={events}
                dateClick={isAuth && handleDateClick}

            />
        </div>
    );
};

export default Calendar;
