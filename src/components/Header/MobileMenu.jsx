// src/components/Header/MobileMenu.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Verificar si es admin
  const isAdmin = currentUser?.email === 'ensegcor@gmail.com';

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

  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
      <ul className="mobile-nav-links">

        {/* 0. PANEL ADMINISTRADOR (SOLO PARA ADMIN) - AGREGADO */}
        {isAdmin && (
          <li>
            <Link to="/admin" onClick={onClose}>
              Panel Administrador
            </Link>
          </li>
        )}

        {/* 1. MIS RESERVAS (PRIMERO SIEMPRE QUE ESTÉ LOGEADO) */}
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
  );
};

export default MobileMenu;