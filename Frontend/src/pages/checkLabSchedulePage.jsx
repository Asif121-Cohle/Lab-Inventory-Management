import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleAPI } from '../services/api';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import "./CSS/Blob.css";
import './CSS/checkLabSchedule.css';

const CheckLabSchedulePage = () => {
  const { role, user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelScheduleId, setCancelScheduleId] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = role === 'professor' 
        ? await scheduleAPI.getMySchedules()
        : await scheduleAPI.getAllSchedules();
      
      const schedulesData = response.data.schedules || response.data;
      console.log('Loaded schedules:', schedulesData);
      setSchedules(schedulesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (scheduleId) => {
    setCancelScheduleId(scheduleId);
    setShowCancelModal(true);
  };

  const confirmCancelSchedule = async () => {
    if (!cancelScheduleId) return;
    try {
      await scheduleAPI.cancelSchedule(cancelScheduleId);
      setShowCancelModal(false);
      setCancelScheduleId(null);
      loadSchedules();
    } catch (err) {
      setShowCancelModal(false);
      setCancelScheduleId(null);
      console.error('Failed to cancel schedule', err);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      await scheduleAPI.updateSchedule(editingSchedule._id || editingSchedule.id, editingSchedule);
      alert('Schedule updated successfully');
      setShowEditModal(false);
      setEditingSchedule(null);
      loadSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update schedule');
    }
  };

  const isMySchedule = (schedule) => {
    return schedule.professorId === user?.id || schedule.professor === user?.username || schedule.professor?._id === user?._id;
  };

  const isPastSchedule = (schedule) => {
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate < today;
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'upcoming') return !isPastSchedule(schedule);
    if (filter === 'past') return isPastSchedule(schedule);
    return true;
  });

  const groupSchedulesByDate = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.date).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = groupSchedulesByDate(filteredSchedules);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Header />
      <div className="page-wrapper check-schedule-container">
        <div style={{maxWidth: '1100px', margin: '0 auto 10px'}}>
          <BackButton />
        </div>
        <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>

        <div className="check-schedule-content">
          <div className="schedule-header">
            <h1 className="schedule-title">Lab Schedule</h1>
            <p className="schedule-subtitle">
              {role === 'professor' ? 'View and manage your lab bookings' : 'View all lab bookings'}
            </p>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading schedules...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={loadSchedules} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && filteredSchedules.length === 0 && (
            <div className="empty-state">
              <p>📅 No {filter !== 'all' ? filter : ''} lab sessions found</p>
            </div>
          )}

          {!loading && !error && filteredSchedules.length > 0 && (
            <div className="schedules-calendar">
              {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
                <div key={date} className="schedule-day">
                  <h3 className="day-header">{formatDate(daySchedules[0].date)}</h3>
                  <div className="day-schedules">
                    {daySchedules.map((schedule) => (
                      <div 
                        key={schedule._id || schedule.id}
                        className={`schedule-card ${isPastSchedule(schedule) ? 'past-schedule' : ''}`}
                      >
                        <div className="schedule-card-header">
                          <div className="schedule-lab-name">
                            {schedule.lab?.name || schedule.labName}
                          </div>
                          <div className="schedule-time">
                            {schedule.timeSlot || `${schedule.startTime}-${schedule.endTime}`}
                          </div>
                        </div>

                        <div className="schedule-card-body">
                          <div className="schedule-info-row">
                            <strong>Course:</strong>
                            <span>{schedule.courseName}</span>
                          </div>
                          <div className="schedule-info-row">
                            <strong>Class:</strong>
                            <span>{schedule.className}</span>
                          </div>
                          <div className="schedule-info-row">
                            <strong>Professor:</strong>
                            <span>{schedule.professor?.username || schedule.professorName || (isMySchedule(schedule) ? user?.username : 'N/A')}</span>
                          </div>
                          {schedule.expectedStudents && (
                            <div className="schedule-info-row">
                              <strong>Students:</strong>
                              <span>{schedule.expectedStudents}</span>
                            </div>
                          )}
                          {schedule.purpose && (
                            <div className="schedule-purpose">
                              <strong>Notes:</strong>
                              <p>{schedule.purpose}</p>
                            </div>
                          )}
                        </div>

                        {role === 'professor' && isMySchedule(schedule) && !isPastSchedule(schedule) && (
                          <div className="schedule-card-actions">
                            <button
                              className="btn-edit"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => openCancelModal(schedule._id || schedule.id)}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        )}

                        {role === 'lab_assistant' && (
                          <div className="schedule-card-footer">
                            <span className="read-only-badge">Read Only</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="refresh-section">
            <button onClick={loadSchedules} className="refresh-btn" disabled={loading}>
              🔄 Refresh Schedule
            </button>
          </div>
        </div>
      </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon error-icon">⚠️</div>
              <h3 className="modal-message">Cancel this lab session?</h3>
              <p style={{ textAlign: 'center', marginBottom: '10px' }}>
                This will mark the session as cancelled. Students and assistants will no longer see it as upcoming.
              </p>
              <div className="modal-actions">
                <button className="btn-danger" onClick={confirmCancelSchedule}>Yes, Cancel</button>
                <button className="btn-primary" onClick={() => setShowCancelModal(false)}>No, Keep</button>
              </div>
            </div>
          </div>
        )}

      {/* Edit Modal */}
      {showEditModal && editingSchedule && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Lab Schedule</h2>
            <form onSubmit={handleUpdateSchedule}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={editingSchedule.date?.split('T')[0]}
                  onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <input
                  type="text"
                  value={editingSchedule.timeSlot}
                  onChange={(e) => setEditingSchedule({...editingSchedule, timeSlot: e.target.value})}
                  placeholder="e.g., 09:00-11:00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Purpose/Notes</label>
                <textarea
                  value={editingSchedule.purpose || ''}
                  onChange={(e) => setEditingSchedule({...editingSchedule, purpose: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CheckLabSchedulePage;
