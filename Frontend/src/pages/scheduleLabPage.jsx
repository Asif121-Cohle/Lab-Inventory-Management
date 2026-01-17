import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { scheduleAPI } from '../services/api';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import "./CSS/Blob.css";
import './CSS/scheduleLab.css';

const ScheduleLabPage = () => {
  const navigate = useNavigate();
  const { fetchLabs } = useLab();

  const [labs, setLabs] = useState([]);
  const [formData, setFormData] = useState({
    labId: '',
    date: '',
    startTime: '',
    endTime: '',
    courseName: '',
    className: '',
    expectedStudents: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadLabs();
  }, []);

  useEffect(() => {
    // Check availability when lab, date, and time are selected
    if (formData.labId && formData.date && formData.startTime && formData.endTime) {
      checkAvailability();
    } else {
      setConflicts([]);
    }
  }, [formData.labId, formData.date, formData.startTime, formData.endTime]);

  const loadLabs = async () => {
    const labsData = await fetchLabs();
    if (labsData) {
      setLabs(labsData);
    }
  };

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    setError('');
    try {
      const response = await scheduleAPI.checkAvailability(
        formData.labId,
        formData.date,
        `${formData.startTime}-${formData.endTime}`
      );
      
      if (response.data.conflicts && response.data.conflicts.length > 0) {
        setConflicts(response.data.conflicts);
        setError(`Lab is already booked during this time. See conflicts below.`);
      } else {
        setConflicts([]);
        setError('');
      }
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (conflicts.length > 0) {
      setShowConflictModal(true);
      return;
    }

    if (new Date(formData.date) < new Date().setHours(0, 0, 0, 0)) {
      setError('Cannot schedule lab for a past date');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        ...formData,
        timeSlot: `${formData.startTime}-${formData.endTime}`,
        expectedStudents: parseInt(formData.expectedStudents) || 0
      };

      await scheduleAPI.createSchedule(scheduleData);
      setSuccessMessage('Lab scheduled successfully!');
      setShowSuccessModal(true);
      
      // Reset form and redirect after delay
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/lab-schedule');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule lab');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <>
      <Header />
      <div className="page-wrapper schedule-lab-container">
        <div style={{maxWidth: '800px', margin: '0 auto 10px'}}>
          <BackButton />
        </div>
        {/* Animated Background */}
        <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>

        <div className="schedule-lab-content">
          <div className="schedule-header">
            <h1 className="schedule-title">Schedule Lab Session</h1>
            <p className="schedule-subtitle">Book a lab for your class</p>
          </div>

          <form className="schedule-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="labId">Select Lab *</label>
                <select
                  id="labId"
                  name="labId"
                  value={formData.labId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">-- Choose a Lab --</option>
                  {labs.map((lab) => (
                    <option key={lab._id || lab.id} value={lab._id || lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getTodayDate()}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {checkingAvailability && (
              <div className="checking-availability">
                <span className="spinner-small"></span> Checking availability...
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="conflicts-section">
                <h4>⚠️ Time Slot Conflicts:</h4>
                {conflicts.map((conflict, index) => (
                  <div key={index} className="conflict-item">
                    <p><strong>{conflict.professor?.username || conflict.professor || conflict.professorName || 'Unknown'}</strong> - {conflict.courseName}</p>
                    <p className="conflict-time">{conflict.timeSlot} on {new Date(conflict.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseName">Course Name *</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  placeholder="e.g., Computer Networks Lab"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="className">Class/Section *</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="e.g., CS-3A"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expectedStudents">Expected Number of Students</label>
              <input
                type="number"
                id="expectedStudents"
                name="expectedStudents"
                value={formData.expectedStudents}
                onChange={handleChange}
                placeholder="e.g., 30"
                min="1"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose/Notes (Optional)</label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Any special requirements or notes..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || conflicts.length > 0 || checkingAvailability}
              >
                {loading ? 'Scheduling...' : 'Schedule Lab'}
              </button>
            </div>
          </form>

          <div className="help-section">
            <p>💡 <strong>Tip:</strong> The system will automatically check for scheduling conflicts. View all your scheduled labs in "Check Lab Schedule".</p>
          </div>
        </div>
      </div>

      {/* Conflict Warning Modal */}
      {showConflictModal && (
        <div className="modal-overlay" onClick={() => setShowConflictModal(false)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon error-icon">⚠️</div>
            <h3 className="modal-message">Time Slot Conflict!</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              This lab is already booked for the selected time slot. Please choose a different time or lab.
            </p>
            <div className="modal-details">
              <h4 style={{ marginBottom: '10px' }}>Conflicting Schedules:</h4>
              {conflicts.map((conflict, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '5px' }}>
                  <p><strong>Professor:</strong> {conflict.professor?.username || 'Unknown'}</p>
                  <p><strong>Course:</strong> {conflict.courseName}</p>
                  <p><strong>Time:</strong> {conflict.timeSlot}</p>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowConflictModal(false)} className="btn-primary">
                OK, I'll Choose Another Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <div className="modal-icon success-icon">✓</div>
            <h3 className="modal-message">{successMessage}</h3>
            <p style={{ textAlign: 'center', color: '#9ca3af' }}>Redirecting to lab schedule page...</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ScheduleLabPage;
