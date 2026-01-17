import React, { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import "./CSS/Blob.css";
import './CSS/requestStatus.css';

const RequestStatusPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data.requests || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pending', class: 'status-pending' },
      approved: { text: 'Approved', class: 'status-approved' },
      rejected: { text: 'Rejected', class: 'status-rejected' },
      fulfilled: { text: 'Fulfilled', class: 'status-fulfilled' }
    };
    return statusMap[status.toLowerCase()] || { text: status, class: 'status-pending' };
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status.toLowerCase() === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Header />
      <div className="page-wrapper request-status-container">
        <div style={{maxWidth: '1000px', margin: '0 auto 10px'}}>
          <BackButton />
        </div>
        {/* Animated Background */}
        <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>

        <div className="request-status-content">
          <div className="status-header">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back to Labs
            </button>
            <h1 className="status-title">My Request Status</h1>
            <p className="status-subtitle">Track your material requests</p>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({requests.length})
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({requests.filter(r => r.status.toLowerCase() === 'pending').length})
            </button>
            <button
              className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({requests.filter(r => r.status.toLowerCase() === 'approved').length})
            </button>
            <button
              className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({requests.filter(r => r.status.toLowerCase() === 'rejected').length})
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading requests...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={loadRequests} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && filteredRequests.length === 0 && (
            <div className="empty-state">
              <p>📋 No {filter !== 'all' ? filter : ''} requests found</p>
              <p className="empty-subtitle">Submit a new request to get started</p>
            </div>
          )}

          {!loading && !error && filteredRequests.length > 0 && (
            <div className="requests-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Material</th>
                    <th>Lab</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Requested On</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusBadge(request.status);
                    return (
                      <tr key={request._id || request.id}>
                        <td className="request-id">
                          #{(request._id || request.id).slice(-6).toUpperCase()}
                        </td>
                        <td className="material-name">
                          {request.material?.name || request.materialName || 'N/A'}
                        </td>
                        <td>{request.lab?.name || request.labName || 'N/A'}</td>
                        <td className="quantity">{request.quantity}</td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="date">{formatDate(request.createdAt || request.requestedOn)}</td>
                        <td>
                          {request.purpose && (
                            <span className="purpose-tooltip" title={request.purpose}>
                              📝
                            </span>
                          )}
                          {request.rejectionReason && (
                            <span className="rejection-tooltip" title={request.rejectionReason}>
                              ❌
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="refresh-section">
            <button onClick={loadRequests} className="refresh-btn" disabled={loading}>
              🔄 Refresh Status
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestStatusPage;
