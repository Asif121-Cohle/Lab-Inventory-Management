import { FaFlask, FaSignOutAlt } from "react-icons/fa";
import "./CSS/header.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const authContext = useAuth();
  const { role, logout, isAuthenticated } = authContext;
  const navigate = useNavigate();

  // Debug: Log all auth context values
  useEffect(() => {
    console.log('=== Header Debug ===');
    console.log('Auth Context:', authContext);
    console.log('Role:', role);
    console.log('IsAuthenticated:', isAuthenticated);
    console.log('Logout function:', typeof logout);
  }, [role, isAuthenticated, authContext]);

  const handleLogout = () => {
    console.log('Logout button clicked');
    setShowPopup(true);
  };

  const confirmLogout = () => {
    console.log('Confirming logout...');
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="custom-navbar">
        <div className="nav-row">

          {/* LEFT SIDE */}
          <div className="left-section" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
            <FaFlask className="brand-icon" />
            <h2 className="brand-name">Lab Inventory Management</h2>
          </div>

          {/* RIGHT SIDE OPTIONS — BASED ON ROLE */}
          <div className="right-section">

            {/* Student Options */}
            {role === "student" && (
              <>
                <Link to="/request-material" className="nav-link">Request Material</Link>
                <Link to="/request-status" className="nav-link">Request Status</Link>
              </>
            )}

            {/* Professor Options */}
            {role === "professor" && (
              <>
                <Link to="/schedule-lab" className="nav-link">Schedule Lab </Link>
                <Link to="/lab-schedule" className="nav-link"> Check Lab Schedule</Link>
              </>
            )}

            {/* Lab Assistant Options */}
            {role === "lab_assistant" && (
              <>
                <Link to="/approve-request" className="nav-link">Approve Requests </Link>
                <Link to="/lab-schedule" className="nav-link"> Check Lab Schedule</Link>
              </>
            )}

            {/* LOGOUT BUTTON */}
            <button className="btns logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" />
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="popup-actions">
              <button className="confirm-btn" onClick={confirmLogout}>
                Yes
              </button>
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
