import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const hoy = () => new Date().toISOString().split("T")[0];

function Badge({ estado }) {
  const map = { pendiente: "badge-warning", confirmada: "badge-success", cancelada: "badge-danger" };
  return <span className={`badge ${map[estado] || "badge-default"}`}>{estado}</span>;
}

export default function PacientePage({ user }) {
  const [citas, setCitas]         = useState([]);
  const [doctores, setDoctores]   = useState([]);
  const [doctorSel, setDoctorSel] = useState("");
  const [fecha, setFecha]         = useState("");
  const [hora, setHora]           = useState("");
  const [slotsDisp, setSlotsDisp] = useState([]);
  const [motivo, setMotivo]       = useState("");
  const [idEditar, setIdEditar]   = useState(null);
  const [error, setError]         = useState("");
  const [ok, setOk]               = useState("");

  const cargarCitas = useCallback(async () => {
    const { data } = await axios.get(`${API}/citas/paciente/${user.email}`);
    setCitas(data);
  }, [user.email]);

  useEffect(() => {
    cargarCitas();
    axios.get(`${API}/doctores`).then(r => setDoctores(r.data));
  }, [cargarCitas]);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API}/doctores`).then(r => setDoctores(r.data));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (doctorSel && fecha) {
      axios.get(`${API}/doctores/${doctorSel}/disponibilidad?fecha=${fecha}`)
        .then(r => { setSlotsDisp(r.data.slotsDisponibles); setHora(""); })
        .catch(() => setSlotsDisp([]));
    } else {
      setSlotsDisp([]); setHora("");
    }
  }, [doctorSel, fecha]);

  const limpiar = () => {
    setDoctorSel(""); setFecha(""); setHora("");
    setMotivo(""); setIdEditar(null); setError(""); setOk(""); setSlotsDisp([]);
  };

  const guardar = async () => {
    setError(""); setOk("");
    if (!doctorSel || !fecha || !hora || !motivo) return setError("Todos los campos son obligatorios.");
    try {
      const doctor = doctores.find(d => d.email === doctorSel);
      if (idEditar) {
        await axios.put(`${API}/citas/${idEditar}`, {
          doctorEmail: doctorSel, fecha, hora, especialidad: doctor?.especialidad || "", motivo
        });
        setOk("Cita actualizada.");
      } else {
        await axios.post(`${API}/citas`, {
          usuarioEmail: user.email, doctorEmail: doctorSel, fecha, hora,
          especialidad: doctor?.especialidad || "", motivo
        });
        setOk("Cita agendada correctamente.");
      }
      cargarCitas(); limpiar();
    } catch (e) { setError(e.response?.data?.mensaje || "Error al guardar."); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    await axios.delete(`${API}/citas/${id}`);
    cargarCitas();
  };

  const editar = (c) => {
    setIdEditar(c._id); setDoctorSel(c.doctorEmail);
    setFecha(c.fecha); setHora(c.hora); setMotivo(c.motivo);
  };

  const recargarTodo = async () => {
  try {
    const [citasRes, doctoresRes] = await Promise.all([
      axios.get(`${API}/citas/paciente/${user.email}`),
      axios.get(`${API}/doctores`)
    ]);
    setCitas(citasRes.data);
    setDoctores(doctoresRes.data);
  } catch {
    setError("Error al recargar datos.");
  }
};

  return (
    <div className="page-grid">
      {/* ─── Formulario ─── */}
      <div className="card">
        <h2 className="card-title">{idEditar ? "Editar cita" : "Agendar cita"}</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {ok    && <div className="alert alert-ok">{ok}</div>}

        <label className="label">Doctor *</label>
        <select value={doctorSel} onChange={e => setDoctorSel(e.target.value)}>
          <option value="">— Selecciona un doctor —</option>
          {doctores.map(d => (
            <option key={d._id} value={d.email}>{d.nombre} · {d.especialidad}</option>
          ))}
        </select>

        <label className="label">Fecha *</label>
        <input type="date" value={fecha} min={hoy()} onChange={e => setFecha(e.target.value)} />

        <label className="label">Hora disponible *</label>
        {slotsDisp.length === 0
          ? <p className="hint">{doctorSel && fecha ? "Sin slots disponibles." : "Selecciona doctor y fecha."}</p>
          : (
            <div className="slots-grid">
              {slotsDisp.map(s => (
                <button key={s} onClick={() => setHora(s)}
                  className={`slot-btn ${hora === s ? "slot-btn--active" : ""}`}>{s}</button>
              ))}
            </div>
          )
        }

        <label className="label">Motivo *</label>
        <input type="text" placeholder="Ej. Dolor de cabeza" value={motivo} onChange={e => setMotivo(e.target.value)} />

        <div className="row-actions">
          <button className="btn btn-primary" onClick={guardar}>{idEditar ? "Actualizar" : "Guardar cita"}</button>
          {idEditar && <button className="btn btn-ghost" onClick={limpiar}>Cancelar</button>}
          {/* Recarga citas y doctores sin cerrar sesion */}
          <button className="btn btn-secondary" onClick={recargarTodo}> Recargar </button>
        </div>
        <p className="hint">* Todos los campos son obligatorios</p>
      </div>

      {/* ─── Lista ─── */}
      <div className="card">
        <h2 className="card-title">Mis Citas</h2>
        <div className="cita-list">
          {citas.length === 0 && <p className="empty-msg">Sin citas registradas.</p>}
          {citas.map(c => (
            <div className="cita-item" key={c._id}>
              <div className="cita-main">
                <div className="cita-header">
                  <span className="cita-especialidad">{c.especialidad}</span>
                  <Badge estado={c.estado} />
                </div>
                <div className="cita-meta">{c.fecha} · {c.hora}</div>
                <div className="cita-motivo">Motivo: {c.motivo}</div>
                {c.razonModificacion && (
                  <div className="cita-razon">
                    ⚠ {c.modificadoRol === "doctor" ? "Doctor" : "Admin"}: {c.razonModificacion}
                  </div>
                )}
              </div>
              {c.estado !== "cancelada" && (
                <div className="cita-actions">
                  <button className="btn btn-sm" onClick={() => editar(c)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(c._id)}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
