// src/components/Header/MobileMenu.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PerfilModal from '../Auth/PerfilModal';

// LISTA DE CORREOS AUTORIZADOS
const ADMIN_EMAILS = [
  'enseguin@gmail.com',
  'ensegcor@gmail.com',
];

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [showPerfil, setShowPerfil] = useState(false);

  // Verificar si es admin (ahora con lista)
  const isAdmin = currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email) : false;

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: 'smooth'
      });
    }
    onClose();
  };

  const handleReservasClick = () => {
    onClose();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
    } else {
      handleScroll('reservas');
    }
  };

  const handlePerfilClick = () => {
    onClose();
    setShowPerfil(true);
  };

  return (
    <>
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
        <ul className="mobile-nav-links">

          {/* PANEL ADMINISTRADOR (SOLO PARA EMAILS AUTORIZADOS) */}
          {isAdmin && (
            <li>
              <Link to="/admin" onClick={onClose}>
                Panel Administrador
              </Link>
            </li>
          )}

          {/* MI PERFIL - SOLO SI ESTÁ LOGEADO */}
          {currentUser && (
            <li>
              <button onClick={handlePerfilClick}>
                Mi Perfil
              </button>
            </li>
          )}

          {/* 1. MIS RESERVAS */}
          {currentUser && (
            <li>
              <Link to="/mis-reservas" onClick={onClose}>
                Mis Reservas
              </Link>
            </li>
          )}

          {/* 2. ALGUNOS DESTINOS */}
          <li>
            <button onClick={() => handleScroll('destinos')}>
              Algunos destinos
            </button>
          </li>

          {/* 3. NUESTROS SERVICIOS */}
          <li>
            <button onClick={() => handleScroll('servicios')}>
              Nuestros servicios
            </button>
          </li>

          {/* 4. RESERVAS */}
          <li>
            <button onClick={handleReservasClick}>
              Reservas
            </button>
          </li>

          {/* 5. SOBRE NOSOTROS */}
          <li>
            <button onClick={() => handleScroll('sobre-nosotros')}>
              Sobre nosotros
            </button>
          </li>

          {/* 6. CONTACTO */}
          <li>
            <button onClick={() => handleScroll('contacto')}>
              Contacto
            </button>
          </li>

          {/* 7. TÉRMINOS Y CONDICIONES */}
          <li className="separator-top">
            <Link to="/terminos" onClick={onClose}>
              Términos y Condiciones
            </Link>
          </li>

          {/* 8. POLÍTICAS DE PRIVACIDAD */}
          <li>
            <Link to="/privacidad" onClick={onClose}>
              Políticas de Privacidad
            </Link>
          </li>

        </ul>
      </div>

      {/* Modal de perfil */}
      {showPerfil && userData && (
        <PerfilModal 
          userData={userData}
          onClose={() => setShowPerfil(false)}
        />
      )}
    </>
  );
};

export default MobileMenu;