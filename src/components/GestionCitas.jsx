import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Muestra el estado de la cita con un color segun su valor
function Badge({ estado }) {
  const map = {
    pendiente: "badge-warning",
    confirmada: "badge-success",
    cancelada: "badge-danger"
  };
  return <span className={`badge ${map[estado] || "badge-default"}`}>{estado}</span>;
}

export default function GestionCitas({ user, rol }) {
  const [citas, setCitas]           = useState([]);
  const [filtroFecha, setFiltroFecha]   = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal]           = useState(null);
  const [razon, setRazon]           = useState("");
  const [nFecha, setNFecha]         = useState("");
  const [nHora, setNHora]           = useState("");
  const [slots, setSlots]           = useState([]);
  const [error, setError]           = useState("");
  const [ok, setOk]                 = useState("");

  // Cargar citas segun rol y filtros activos
  const cargar = useCallback(async () => {
    const params = {};
    if (filtroFecha)  params.fecha  = filtroFecha;
    if (filtroEstado) params.estado = filtroEstado;
    // Si es doctor, solo muestra sus citas
    if (rol === "doctor") params.doctorEmail = user.email;
    const { data } = await axios.get(`${API}/citas/todas`, { params });
    setCitas(data);
  }, [filtroFecha, filtroEstado, rol, user.email]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cuando cambia la fecha en el modal de modificar, cargar slots disponibles
  useEffect(() => {
    if (modal?.accion === "modificar" && modal.cita.doctorEmail && nFecha) {
      axios
        .get(`${API}/doctores/${modal.cita.doctorEmail}/disponibilidad?fecha=${nFecha}`)
        .then(r => setSlots(r.data.slotsDisponibles))
        .catch(() => setSlots([]));
    }
  }, [modal, nFecha]);

  // Abrir modal de cancelar o modificar con los datos de la cita
  const abrirModal = (cita, accion) => {
    setModal({ cita, accion });
    setRazon(""); setNFecha(cita.fecha); setNHora(cita.hora);
    setError(""); setOk("");
  };

  // Ejecutar la accion del modal (cancelar o modificar)
  const ejecutar = async () => {
    if (!razon.trim()) return setError("La razón es obligatoria.");
    try {
      const body = {
        accion: modal.accion,
        razon,
        modificadoPor: user.email,
        modificadoRol: rol
      };
      if (modal.accion === "modificar") {
        body.fecha = nFecha;
        body.hora  = nHora;
      }
      await axios.patch(`${API}/citas/${modal.cita._id}/gestion`, body);
      setOk("Operación realizada correctamente.");
      setModal(null);
      cargar();
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error al ejecutar la acción.");
    }
  };

  // Confirmar una cita pendiente (disponible para doctor y admin)
  const confirmar = async (id) => {
    if (!confirm("¿Confirmar esta cita?")) return;
    try {
      await axios.put(`${API}/citas/${id}/confirmar`);
      cargar();
    } catch {
      alert("Error al confirmar la cita.");
    }
  };

  return (
    <div className="card full-width">
      <h2 className="card-title">Gestión de Citas</h2>

      {/* Barra de filtros */}
      <div className="filter-bar">
        <input
          type="date"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
        />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button
          className="btn btn-ghost"
          onClick={() => { setFiltroFecha(""); setFiltroEstado(""); }}
        >
          Limpiar filtros
        </button>
      </div>

      {ok && <div className="alert alert-ok">{ok}</div>}

      {/* Lista de citas */}
      <div className="ui-card-list">
        {citas.length === 0 && (
          <p className="empty-msg">Sin citas para mostrar.</p>
        )}
        {citas.map(c => (
          <div className="ui-card-item" key={c._id}>
            <div className="cita-main">
              <div className="cita-header">
                <span className="cita-especialidad">{c.especialidad}</span>
                <Badge estado={c.estado} />
              </div>
              <div className="cita-meta">{c.fecha} · {c.hora}</div>
              <div className="cita-motivo">
                Paciente: <strong>{c.usuarioEmail}</strong> · Doctor: <strong>{c.doctorEmail}</strong>
              </div>
              <div className="cita-motivo">Motivo: {c.motivo}</div>
              {c.razonModificacion && (
                <div className="cita-razon">
                  Razon: {c.razonModificacion} ({c.modificadoPor})
                </div>
              )}
            </div>
            {c.estado !== "cancelada" && (
              <div className="ui-card-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => abrirModal(c, "modificar")}
                >
                  Modificar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => abrirModal(c, "cancelar")}
                >
                  Cancelar
                </button>
                {/* Confirmar disponible para doctor y admin */}
                {c.estado === "pendiente" && (rol === "doctor" || rol === "admin") && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => confirmar(c._id)}
                  >
                    Confirmar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal para cancelar o modificar una cita */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{modal.accion === "cancelar" ? "Cancelar cita" : "Modificar cita"}</h3>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Si es modificar, mostrar selector de fecha y slots */}
            {modal.accion === "modificar" && (
              <>
                <label className="label">Nueva fecha</label>
                <input
                  type="date"
                  value={nFecha}
                  onChange={e => setNFecha(e.target.value)}
                />
                <label className="label">Nueva hora</label>
                <div className="slots-grid">
                  {slots.map(s => (
                    <button
                      key={s}
                      onClick={() => setNHora(s)}
                      className={`slot-btn ${nHora === s ? "slot-btn--active" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                  {slots.length === 0 && (
                    <span className="hint">Selecciona una fecha para ver los horarios disponibles.</span>
                  )}
                </div>
              </>
            )}

            <label className="label">
              Razón del {modal.accion === "cancelar" ? "cancelación" : "cambio"} *
            </label>
            <input
              type="text"
              placeholder="Indica el motivo..."
              value={razon}
              onChange={e => setRazon(e.target.value)}
            />

            <div className="row-actions" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" onClick={ejecutar}>Confirmar</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}