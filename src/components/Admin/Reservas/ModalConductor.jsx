// src/components/Admin/Reservas/ModalConductor.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Car, Palette, Hash, CalendarDays, Move } from 'lucide-react';
import './ModalConductor.css';

/* ══════════════════════════════════════════
   Foto vehículo: drag + zoom con ruedita
   Usa background-image para control total
══════════════════════════════════════════ */
const DraggableZoomImage = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos]     = useState({ x: 50, y: 50 }); // porcentaje para background-position
  const dragging          = useRef(false);
  const lastMouse         = useRef({ x: 0, y: 0 });
  const wrapRef           = useRef(null);

  /* ── Zoom con ruedita ── */
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setScale(prev => Math.min(4, Math.max(1, prev + (e.deltaY < 0 ? 0.2 : -0.2))));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  /* Resetear al volver a escala 1 */
  useEffect(() => {
    if (scale === 1) setPos({ x: 50, y: 50 });
  }, [scale]);

  /* ── Drag mouse ── */
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const { width, height } = wrap.getBoundingClientRect();

      // Cuánto se movió el mouse como % del contenedor
      const dx = ((ev.clientX - lastMouse.current.x) / width)  * 100;
      const dy = ((ev.clientY - lastMouse.current.y) / height) * 100;
      lastMouse.current = { x: ev.clientX, y: ev.clientY };

      // Restar porque arrastrar a la derecha → mueve imagen a la derecha → background-position baja
      setPos(prev => ({
        x: Math.min(100, Math.max(0, prev.x - dx)),
        y: Math.min(100, Math.max(0, prev.y - dy)),
      }));
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  /* ── Drag touch ── */
  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    dragging.current = true;
    lastMouse.current = { x: touch.clientX, y: touch.clientY };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const { width, height } = wrap.getBoundingClientRect();
      const t = ev.touches[0];
      const dx = ((t.clientX - lastMouse.current.x) / width)  * 100;
      const dy = ((t.clientY - lastMouse.current.y) / height) * 100;
      lastMouse.current = { x: t.clientX, y: t.clientY };
      setPos(prev => ({
        x: Math.min(100, Math.max(0, prev.x - dx)),
        y: Math.min(100, Math.max(0, prev.y - dy)),
      }));
    };

    const onEnd = () => {
      dragging.current = false;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, []);

  // background-size: al 100% muestra imagen completa, al 400% = zoom x4
  const bgSize = `${scale * 100}%`;

  return (
    <div
      ref={wrapRef}
      className="conductor-foto-vehiculo-wrap"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: bgSize,
        backgroundPosition: `${pos.x}% ${pos.y}%`,
        backgroundRepeat: 'no-repeat',
        cursor: scale > 1 ? 'grab' : 'default',
      }}
      role="img"
      aria-label={alt}
    >
      {/* Hint */}
      <div className="vehiculo-drag-hint">
        <Move size={11} />
        <span>Ruedita para zoom · Arrastra para encuadrar</span>
      </div>

      {/* Badge zoom */}
      {scale > 1 && (
        <div className="vehiculo-zoom-badge">{Math.round(scale * 100)}%</div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   Modal principal
══════════════════════════════════════════ */
const ModalConductor = ({ reserva, onClose }) => {
  const conductor = reserva.conductorAsignado;
  if (!conductor) return null;

  const tieneFotoPerfil   = !!conductor.fotos?.perfil;
  const tieneFotoVehiculo = !!conductor.fotos?.vehiculoFrontal;

  return ReactDOM.createPortal(
    <div className="conductor-modal-overlay" onClick={onClose}>
      <div className="conductor-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="conductor-modal-header">
          <div className="conductor-modal-header-icon">
            <Car size={16} />
          </div>
          <h2>Datos del Conductor</h2>
          <button className="conductor-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="conductor-modal-body">

          {/* ── Foto perfil: estática en su círculo ── */}
          {tieneFotoPerfil && (
            <div className="conductor-foto-perfil-wrap">
              <img src={conductor.fotos.perfil} alt="Perfil" />
            </div>
          )}

          {/* ── Nombre ── */}
          <div className="conductor-identidad">
            <h3>{conductor.nombre}</h3>
          </div>

          {/* ── Divider ── */}
          <div className="conductor-divider">
            <span>Vehículo</span>
          </div>

          {/* ── Foto vehículo: drag + zoom ── */}
          {tieneFotoVehiculo && (
            <DraggableZoomImage
              src={conductor.fotos.vehiculoFrontal}
              alt="Vehículo"
            />
          )}

          {/* ── Datos vehículo ── */}
          <div className="conductor-vehiculo-grid">
            <div className="conductor-vehiculo-campo">
              <Car size={14} />
              <div>
                <label>Marca / Modelo</label>
                <span>{conductor.vehiculo?.marca} {conductor.vehiculo?.modelo}</span>
              </div>
            </div>

            <div className="conductor-vehiculo-campo">
              <Palette size={14} />
              <div>
                <label>Color</label>
                <span>{conductor.vehiculo?.color || '—'}</span>
              </div>
            </div>

            <div className="conductor-vehiculo-campo">
              <Hash size={14} />
              <div>
                <label>Placa</label>
                <span className="conductor-placa">{conductor.vehiculo?.placa || '—'}</span>
              </div>
            </div>

            <div className="conductor-vehiculo-campo">
              <CalendarDays size={14} />
              <div>
                <label>Año</label>
                <span>{conductor.vehiculo?.año || '—'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalConductor;