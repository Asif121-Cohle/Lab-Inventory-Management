import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/header.css";

const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const openLogoutPopup = () => {
    setShowPopup(true);
  };

  const confirmLogout = () => {
    setShowPopup(false);
    navigate("/#");
  };

  const cancelLogout = () => {
    setShowPopup(false);
  };

  return (
    <>
      <nav className="custom-navbar sticky-top">
        <div className="nav-row">

          <div className="left-section">
            <i className="fa-brands fa-gitlab brand-icon"></i>
          </div>

          <div className="right-section">

            <a className="nav-link-btn" href="/schedule">
              Schedule Lab
            </a>

            <button className="logout-btn" onClick={openLogoutPopup}>
              <i className="fa-solid fa-right-from-bracket logout-icon"></i>
              Logout
            </button>

          </div>

        </div>
      </nav>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">

            <h3>Confirm Logout</h3>
            <p>Do you really want to logout?</p>

            <div className="popup-actions">
              <button className="confirm-btn" onClick={confirmLogout}>
                Yes
              </button>
              <button className="cancel-btn" onClick={cancelLogout}>
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
  