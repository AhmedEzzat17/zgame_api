import React from "react";
import { FaInstagram, FaTiktok, FaFacebook, FaAndroid, FaApple } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Left: Social Media */}
      <div className="footer-section social-icons">
        <a
          href="https://"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a>
        <a
          href="https://"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTiktok />
        </a>
        <a
          href="https://"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook />
        </a>
      </div>

      {/* Center: Copyright */}
      <div className="footer-section copyright">
        <p>Copyright 2025 zgame - All Rights Reserved ©</p>
      </div>

      {/* Right: Developer + Store Icons */}
      <div className="footer-section developer">
        <span>
          Developed by{" "}
          <a
            href="https://fikriti.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            fikriti.com
          </a>
        </span>
        <div className="store-icons">
          <FaAndroid />
          <FaApple />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
