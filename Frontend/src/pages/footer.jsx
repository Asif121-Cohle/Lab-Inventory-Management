import React from "react";
import "./CSS/fa.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-grid">

        {/* Column 1: Social Icons */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-socials">
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-linkedin"></i>
            <i className="fa-brands fa-instagram"></i>
          </div>
        </div>

        {/* Column 2: Brand */}
        <div className="footer-col">
          <h4>Lab Management</h4>
          <p>© 2025 Lab Inventory Management</p>
        </div>

        {/* Column 3: Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <div className="footer-links">
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
