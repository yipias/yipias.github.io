// src/components/Footer/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div>Contacto: +51 935 893 062 · Email: soporte@yipias.com</div>
        <div className="muted">© {new Date().getFullYear()} YipiAs</div>
      </div>
    </footer>
  );
};

export default Footer;