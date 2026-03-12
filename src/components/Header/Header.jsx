// src/components/Header/Header.jsx
console.log("HEADER RENDER");
import React, { useState, useEffect } from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import MobileMenu from './MobileMenu';
import AuthModal from '../Auth/AuthModal';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { currentUser, userData } = useAuth();

  // ===== ESCUCHAR EVENTO PARA ABRIR MODAL DESDE MOBILEMENU =====
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setShowAuthModal(true);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Obtener primera palabra del nombre
  const getFirstName = () => {
    if (!userData || !userData.nombres) return '';
    return userData.nombres.split(' ')[0];
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="nav-container">
            {/* LOGO CLICKEABLE */}
            <Link to="/" className="brand-container">
              <img src="/img/YipiAs_logo.png" alt="Icono YipiAs" className="brand-icon" />
              <img src="/img/banner.png" alt="YipiAs" className="brand-logo-wide" />
            </Link>
            
            <div className="nav-right">
              {currentUser ? (
                // USUARIO LOGUEADO - SOLO ÍCONO Y NOMBRE
                <div className="user-profile-wrapper">
                  <div 
                    className="user-profile"
                    onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                  >
                    <UserCircle size={24} className="user-icon" />
                    <span className="user-name">{getFirstName()}</span>
                  </div>
                  
                  {showLogoutConfirm && (
                    <div className="logout-menu">
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // USUARIO NO LOGUEADO - BOTÓN CON TEXTO "INGRESAR"
                <button 
                  className="user-login-btn" 
                  onClick={openAuthModal}
                >
                  <UserCircle size={20} />
                  <span>Ingresar</span>
                </button>
              )}
              
              <button 
                className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`} 
                onClick={toggleMenu}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
        
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </nav>

      {showAuthModal && (
        <AuthModal 
          onClose={closeAuthModal} 
          onSuccess={() => {
            closeAuthModal();
          }}
        />
      )}
    </>
  );
};

export default Header;