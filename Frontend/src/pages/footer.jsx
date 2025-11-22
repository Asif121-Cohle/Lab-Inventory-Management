import React from "react";
import "./CSS/styling.css";
import "./CSS/fa.css";
import "./CSS/header.css";
import "./CSS/card.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="f-info">
        <div className="nav-link f-info-socials">
          <i className="fa-brands fa-square-facebook"></i>
          <i className="fa-brands fa-linkedin"></i>
          <i className="fa-brands fa-square-instagram"></i>
        </div>

        <div className="f-info-brands">&copy; 2025 Lab Inventory Management</div>

        <div className="f-info-links">
          <a href="/about">About Us</a>
          <a href="/contact">Contact Us</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
