// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import DestinosSlider from './components/Destinos/DestinosSlider';
import ServiciosGrid from './components/Servicios/ServiciosGrid';
import ReservasTabs from './components/Reservas/ReservasTabs';
import SobreNosotros from './components/SobreNosotros/SobreNosotros';
import Footer from './components/Footer/Footer';
import WhatsAppFloat from './components/WhatsApp/WhatsAppFloat';

import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import MisReservas from './pages/MisReservas';
import ConductorRegistro from './pages/ConductorRegistro';

// IMPORTACIONES PARA ADMIN
import AdminLayout from './pages/Admin/AdminLayout';
import ConductoresPage from './pages/Admin/conductores/ConductoresPage';
import TarifarioPage from './pages/Admin/tarifario/TarifarioPage';
import ClientesPage from './pages/Admin/clientes/ClientesPage';

import ScrollToTop from './components/ScrollToTop';
import AuthModal from './components/Auth/AuthModal';
import SplashScreen from './components/SplashScreen/SplashScreen';

import './assets/global.css';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const location = useLocation();

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  // Verificar si estamos en ruta de admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {splashVisible && <SplashScreen onFinish={handleSplashFinish} />}
      
      <ScrollToTop />
      
      {/* HEADER: SOLO se muestra si NO estamos en admin */}
      {!isAdminRoute && <Header onOpenAuth={() => setShowAuthModal(true)} />}

      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <Hero />
              <DestinosSlider />
              <hr />
              <ServiciosGrid />
              <ReservasTabs />
              <SobreNosotros />
              <WhatsAppFloat />
            </div>
          }
        />

        {/* RUTAS DE ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/conductores" replace />} />
          <Route path="conductores" element={<ConductoresPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="tarifario" element={<TarifarioPage />} />
        </Route>

        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/conductor-registro" element={<ConductorRegistro />} />
      </Routes>

      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}
    </>
  );
}

export default App;