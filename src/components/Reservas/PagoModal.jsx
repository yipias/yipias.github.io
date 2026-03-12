// src/components/Reservas/PagoModal.jsx
import React, { useState } from 'react';
import { Copy, Check, X, CreditCard, Smartphone, Phone } from 'lucide-react';
import './PagoModal.css';

const PagoModal = ({ onClose, monto }) => {
  const [copied, setCopied] = useState(null);
  const [metodo, setMetodo] = useState('yape');

  const datosPago = {
    yape: {
      numero: '923 927 635',
      nombre: 'Plataformas y Soluciones S.A.C'
    },
    bcp: {
      numero: '47579328171022',
      nombre: 'Plataformas y Soluciones S.A.C',
      tipo: 'Cuenta BCP Soles'
    },
    interbancario: {
      numero: '00247517932817102227',
      nombre: 'Plataformas y Soluciones S.A.C',
      tipo: 'Cuenta Interbancaria'
    }
  };

  const handleCopy = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopied(tipo);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/51904635462?text=Hola,%20adjunto%20el%20comprobante%20de%20mi%20pago', '_blank');
  };

  const formatMonto = (monto) => {
    if (!monto) return 'S/ 0.00';
    return monto;
  };

  return (
    <div className="pago-modal-overlay" onClick={onClose}>
      <div className="pago-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="pago-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="pago-modal-header">
          <h2>Realizar Pago</h2>
          <div className="pago-monto">
            <span>Monto:</span>
            <strong>{formatMonto(monto)}</strong>
          </div>
        </div>

        <div className="pago-metodos">
          <button
            className={`metodo-btn ${metodo === 'yape' ? 'active' : ''}`}
            onClick={() => setMetodo('yape')}
          >
            <Smartphone size={16} />
            Yape
          </button>
          <button
            className={`metodo-btn ${metodo === 'bcp' ? 'active' : ''}`}
            onClick={() => setMetodo('bcp')}
          >
            <CreditCard size={16} />
            BCP
          </button>
          <button
            className={`metodo-btn ${metodo === 'interbancario' ? 'active' : ''}`}
            onClick={() => setMetodo('interbancario')}
          >
            <CreditCard size={16} />
            Interb.
          </button>
        </div>

        <div className="pago-contenido">
          {metodo === 'yape' && (
            <div className="pago-item">
              <div className="copy-field">
                <span className="label">Número Yape:</span>
                <div className="field-with-copy">
                  <span className="valor">{datosPago.yape.numero}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(datosPago.yape.numero, 'yape')}
                  >
                    {copied === 'yape' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'yape' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="titular">
                <span className="label">Titular:</span>
                <span className="valor-titular">{datosPago.yape.nombre}</span>
              </div>
            </div>
          )}

          {metodo === 'bcp' && (
            <div className="pago-item">
              <div className="copy-field">
                <span className="label">Cuenta BCP Soles:</span>
                <div className="field-with-copy">
                  <span className="valor">{datosPago.bcp.numero}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(datosPago.bcp.numero, 'bcp')}
                  >
                    {copied === 'bcp' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'bcp' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="titular">
                <span className="label">Titular:</span>
                <span className="valor-titular">{datosPago.bcp.nombre}</span>
              </div>
            </div>
          )}

          {metodo === 'interbancario' && (
            <div className="pago-item">
              <div className="copy-field">
                <span className="label">CCI:</span>
                <div className="field-with-copy">
                  <span className="valor">{datosPago.interbancario.numero}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(datosPago.interbancario.numero, 'interbancario')}
                  >
                    {copied === 'interbancario' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'interbancario' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="titular">
                <span className="label">Titular:</span>
                <span className="valor-titular">{datosPago.interbancario.nombre}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pago-footer">
          <div className="whatsapp-section">
            <p>Enviar comprobante al siguiente número</p>
            <button className="btn-whatsapp" onClick={handleWhatsApp}>
              <Phone size={16} />
              +51 904 635 462
            </button>
          </div>
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoModal;