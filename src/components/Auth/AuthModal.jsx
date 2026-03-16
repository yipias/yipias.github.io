// src/components/Auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { 
  User, Mail, Lock, CheckCircle, Phone, CreditCard, 
  Eye, EyeOff, HelpCircle, AlertCircle, Check 
} from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ onClose, onSuccess }) => {
  const [modo, setModo] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombres: '',
    telefono: '',
    dni: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // ===== DETECTAR PARÁMETROS DE FIREBASE EN LA URL =====
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'verifyEmail') {
      setSuccess('Correo verificado exitosamente. Ya puedes iniciar sesión.');
      setModo('login');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (mode === 'resetPassword') {
      setSuccess('Contraseña restablecida. Ahora puedes iniciar sesión.');
      setModo('login');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ===== FUNCIÓN PARA RESTABLECER CONTRASEÑA =====
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailQuery = query(collection(db, 'usuarios'), where('email', '==', resetEmail));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (emailSnapshot.empty) {
        setError('Este correo no está asociado a ninguna cuenta');
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      setSuccess('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
      setLoading(false);
      
      setTimeout(() => {
        setResetPasswordMode(false);
        setResetSent(false);
        setResetEmail('');
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al enviar correo de recuperación');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        setLoading(false);
        await auth.signOut();
        return;
      }
      
      const userDoc = await getDocs(query(
        collection(db, 'usuarios'), 
        where('uid', '==', user.uid)
      ));
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setSuccess(`Bienvenido ${userData.nombres}!`);
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        if (onSuccess) onSuccess(userData);
        setTimeout(onClose, 1500);
      }

    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión');
      }
    }
    setLoading(false);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.dni.length < 8 || formData.dni.length > 12) {
      setError('El DNI debe tener entre 8 y 12 dígitos');
      setLoading(false);
      return;
    }

    if (formData.telefono.length < 9) {
      setError('El teléfono debe tener al menos 9 dígitos');
      setLoading(false);
      return;
    }

    const nombreCompleto = formData.nombres.trim();
    if (!nombreCompleto.includes(' ')) {
      setError('Ingresa tu nombre completo (nombres y apellidos)');
      setLoading(false);
      return;
    }

    try {
      const espacioIndex = nombreCompleto.indexOf(' ');
      const nombres = nombreCompleto.substring(0, espacioIndex).trim();
      const apellidos = nombreCompleto.substring(espacioIndex + 1).trim();

      const dniQuery = query(collection(db, 'usuarios'), where('dni', '==', formData.dni));
      const dniSnapshot = await getDocs(dniQuery);
      
      if (!dniSnapshot.empty) {
        setError('Este DNI ya está registrado');
        setLoading(false);
        return;
      }

      const emailQuery = query(collection(db, 'usuarios'), where('email', '==', formData.email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        setError('Este email ya está registrado');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      await new Promise(resolve => setTimeout(resolve, 1000));
      await user.getIdToken(true);
      await sendEmailVerification(user);

      const currentUser = auth.currentUser;
      
      const userData = {
        nombres: nombres,
        apellidos: apellidos,
        nombreCompleto: nombreCompleto,
        email: formData.email,
        telefono: formData.telefono,
        dni: formData.dni,
        rol: 'cliente',
        fechaRegistro: new Date().toISOString(),
        uid: currentUser.uid,
        estado: 'activo',
        emailVerified: false
      };

      await setDoc(doc(db, 'usuarios', currentUser.uid), userData);

      setSuccess('Registro exitoso. Hemos enviado un correo de verificación a tu email. Por favor verifica antes de iniciar sesión.');

      setTimeout(() => {
        setModo('login');
        setFormData({ 
          email: '', 
          password: '', 
          nombres: '', 
          telefono: '', 
          dni: '', 
          confirmPassword: '' 
        });
        setAceptaTerminos(false);
      }, 4000);

    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else {
        setError('Error al registrarse');
      }
    }
    setLoading(false);
  };

  if (resetPasswordMode) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="auth-modal-close" onClick={onClose}>×</button>
          
          <div className="auth-logo">
            <img src="/img/premium.png" alt="YipiAs" />
          </div>

          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text)' }}>
            Recuperar Contraseña
          </h3>

          {!resetSent ? (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} style={{ marginRight: '6px' }} />
                  {error}
                </div>
              )}
              {success && (
                <div className="auth-success">
                  <Check size={16} style={{ marginRight: '6px' }} />
                  {success}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Enviar correo de recuperación'}
              </button>

              <button 
                type="button" 
                className="auth-submit" 
                style={{ background: 'transparent', color: 'var(--primary)', marginTop: '0.5rem' }}
                onClick={() => setResetPasswordMode(false)}
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="auth-success">
                <Check size={16} style={{ marginRight: '6px' }} />
                {success}
              </div>
              <button 
                className="auth-submit" 
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setResetPasswordMode(false);
                  setResetSent(false);
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-logo">
          <img src="/img/premium.png" alt="YipiAs" />
        </div>

        <div className="auth-slider">
          <div className={`slider-bg ${modo === 'login' ? 'login-active' : 'registro-active'}`} />
          <button 
            className={`slider-btn ${modo === 'login' ? 'active' : ''}`}
            onClick={() => setModo('login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`slider-btn ${modo === 'registro' ? 'active' : ''}`}
            onClick={() => setModo('registro')}
          >
            Registrarse
          </button>
        </div>

        <div className="conductor-link">
          <span>¿Eres conductor? </span>
          <a 
            href="https://wa.me/51935893062?text=¡Hola!%20Deseo%20más%20información%20para%20ser%20conductor%20de%20YipiAs%20Premium."
            target="_blank" 
            rel="noopener noreferrer"
          >
            Haz clic aquí
          </a>
        </div>

        {modo === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Correo electrónico"
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Contraseña"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setResetPasswordMode(true)}
                className="forgot-password-btn"
              >
                <HelpCircle size={14} />
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} style={{ marginRight: '6px' }} />
                {error}
              </div>
            )}
            {success && (
              <div className="auth-success">
                <Check size={16} style={{ marginRight: '6px' }} />
                {success}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistro} className="auth-form">
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                placeholder="Nombres y apellidos"
              />
            </div>

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Correo electrónico"
              />
            </div>

            <div className="input-group">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ingresa tu teléfono"
                maxLength="9"
              />
            </div>

            <div className="input-group">
              <CreditCard size={18} className="input-icon" />
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                placeholder="Ingresa tu DNI"
                maxLength="8"
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Contraseña (mín. 6 caracteres)"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirmar contraseña"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <CheckCircle size={16} className={`checkbox-icon ${aceptaTerminos ? 'checked' : ''}`} />
              <span>Acepto los términos y condiciones, junto a las políticas de privacidad</span>
            </label>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} style={{ marginRight: '6px' }} />
                {error}
              </div>
            )}
            {success && (
              <div className="auth-success">
                <Check size={16} style={{ marginRight: '6px' }} />
                {success}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;