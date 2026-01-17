import React, { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import "./CSS/Blob.css";
import './CSS/approveRequests.css';

const ApproveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestAPI.getPendingRequests();
      setRequests(response.data.requests || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    const requestId = selectedRequest._id || selectedRequest.id;
    setProcessingId(requestId);
    setShowApproveModal(false);
    
    try {
      await requestAPI.approveRequest(requestId);
      setSuccessMessage('Request approved successfully!');
      setShowSuccessModal(true);
      loadPendingRequests(); // Reload the list
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to approve request');
      setShowErrorModal(true);
    } finally {
      setProcessingId(null);
      setSelectedRequest(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a reason for rejection');
      setShowErrorModal(true);
      return;
    }

    setProcessingId(selectedRequest._id || selectedRequest.id);
    try {
      await requestAPI.rejectRequest(
        selectedRequest._id || selectedRequest.id, 
        rejectionReason
      );
      setSuccessMessage('Request rejected successfully');
      setShowSuccessModal(true);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      loadPendingRequests();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to reject request');
      setShowErrorModal(true);
    } finally {
      setProcessingId(null);
    }
  };

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
      <div className="page-wrapper approve-requests-container">
        <div style={{maxWidth: '1400px', margin: '0 auto 10px'}}>
          <BackButton />
        </div>
        {/* Animated Background */}
        <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>

        <div className="approve-requests-content">
          <div className="approve-header">
            <h1 className="approve-title">Approve Material Requests</h1>
            <p className="approve-subtitle">Review and process student requests</p>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading pending requests...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={loadPendingRequests} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && requests.length === 0 && (
            <div className="empty-state">
              <p>✅ No pending requests</p>
              <p className="empty-subtitle">All requests have been processed</p>
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div className="requests-grid">
              {requests.map((request) => (
                <div key={request._id || request.id} className="request-card">
                  <div className="request-card-header">
                    <div className="request-id">
                      Request #{(request._id || request.id).slice(-6).toUpperCase()}
                    </div>
                    <div className="request-date">
                      {formatDate(request.createdAt || request.requestedOn)}
                    </div>
                  </div>

                  <div className="request-card-body">
                    <div className="request-student">
                      <strong>Student:</strong>
                      <span>{request.student?.username || request.studentName || 'N/A'}</span>
                    </div>

                    <div className="request-material">
                      <strong>Material:</strong>
                      <span className="material-name-highlight">
                        {request.material?.name || request.materialName}
                      </span>
                    </div>

                    <div className="request-details">
                      <div className="detail-item">
                        <strong>Lab:</strong>
                        <span>{request.lab?.name || request.labName}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Quantity:</strong>
                        <span className="quantity-badge">{request.quantity}</span>
                      </div>
                    </div>

                    {request.material?.quantity !== undefined && (
                      <div className="availability-check">
                        {request.quantity <= request.material.quantity ? (
                          <span className="available">
                            ✓ Available ({request.material.quantity} in stock)
                          </span>
                        ) : (
                          <span className="not-available">
                            ⚠️ Insufficient stock ({request.material.quantity} available)
                          </span>
                        )}
                      </div>
                    )}

                    {request.purpose && (
                      <div className="request-purpose">
                        <strong>Purpose:</strong>
                        <p>{request.purpose}</p>
                      </div>
                    )}
                  </div>

                  <div className="request-card-actions">
                    <button
                      className="btn-approve"
                      onClick={() => openApproveModal(request)}
                      disabled={processingId === (request._id || request.id)}
                    >
                      {processingId === (request._id || request.id) ? '⏳' : '✓'} Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => openRejectModal(request)}
                      disabled={processingId === (request._id || request.id)}
                    >
                      {processingId === (request._id || request.id) ? '⏳' : '✗'} Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="refresh-section">
            <button onClick={loadPendingRequests} className="refresh-btn" disabled={loading}>
              🔄 Refresh Requests
            </button>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon approve-icon">✓</div>
            <h2>Approve Request</h2>
            <p className="modal-message">
              Are you sure you want to approve this request?
            </p>
            <div className="modal-details">
              <p><strong>Student:</strong> {selectedRequest.student?.username || selectedRequest.studentName}</p>
              <p><strong>Material:</strong> {selectedRequest.material?.name || selectedRequest.materialName}</p>
              <p><strong>Quantity:</strong> {selectedRequest.quantity}</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-approve"
                onClick={confirmApprove}
              >
                ✓ Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon reject-icon">✗</div>
            <h2>Reject Request</h2>
            <p>
              Request from <strong>{selectedRequest.student?.username || selectedRequest.studentName}</strong> for{' '}
              <strong>{selectedRequest.material?.name || selectedRequest.materialName}</strong>
            </p>
            
            <form onSubmit={handleReject}>
              <div className="form-group">
                <label htmlFor="rejectionReason">Reason for Rejection *</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this request..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={processingId}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={processingId}
                >
                  {processingId ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon success-icon">✓</div>
            <h2>Success!</h2>
            <p className="modal-message">{successMessage}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-approve"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-content error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon error-icon">✗</div>
            <h2>Error</h2>
            <p className="modal-message">{errorMessage}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={() => setShowErrorModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ApproveRequestsPage;
