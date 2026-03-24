import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function MiHorario({ user }) {
  const [horarios, setHorarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [ok, setOk]     = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/doctores/${user.email}/horario`)
      .then(r => { setHorarios(r.data.horarios || []); setDoctorId(r.data._id); });
  }, [user.email]);

  const agregar = () => {
    setHorarios(prev => [...prev, { diaSemana: 1, horaInicio: "08:00", horaFin: "17:00", intervaloMinutos: 30 }]);
    setEditando(horarios.length);
  };

  const cambiar = (i, campo, val) => {
    setHorarios(prev => {
      const c = [...prev];
      c[i] = { ...c[i], [campo]: isNaN(val) ? val : Number(val) };
      return c;
    });
  };

  const eliminar = (i) => setHorarios(prev => prev.filter((_, idx) => idx !== i));

  const guardar = async () => {
    try {
      await axios.put(`${API}/admin/usuarios-cred/${doctorId}`, { horarios });
      setOk("Horario guardado."); setError(""); setEditando(null);
    } catch { setError("Error al guardar horario."); }
  };

  return (
    <div className="card full-width">
      <h2 className="card-title">Mi Horario</h2>
      {ok    && <div className="alert alert-ok">{ok}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="ui-card-list">
        {horarios.map((h, i) => (
          <div className="ui-card-item" key={i}>
            {editando === i ? (
              <div className="horario-edit-row">
                <select value={h.diaSemana} onChange={e => cambiar(i, "diaSemana", e.target.value)}>
                  {DIAS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                </select>
                <input type="time" value={h.horaInicio} onChange={e => cambiar(i, "horaInicio", e.target.value)} />
                <span className="sep">–</span>
                <input type="time" value={h.horaFin} onChange={e => cambiar(i, "horaFin", e.target.value)} />
                <select value={h.intervaloMinutos} onChange={e => cambiar(i, "intervaloMinutos", e.target.value)}>
                  {[15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => setEditando(null)}>✓</button>
                <button className="btn btn-sm btn-danger" onClick={() => eliminar(i)}>✕</button>
              </div>
            ) : (
              <>
                <div className="cita-main">
                  <div className="cita-especialidad">{DIAS[h.diaSemana]}</div>
                  <div className="cita-meta">{h.horaInicio} – {h.horaFin} · cada {h.intervaloMinutos} min</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => setEditando(i)}>Editar</button>
              </>
            )}
          </div>
        ))}
        {horarios.length === 0 && <p className="empty-msg">Sin días configurados.</p>}
      </div>

      <div className="row-actions" style={{ marginTop: 14 }}>
        <button className="btn btn-ghost" onClick={agregar}>+ Agregar día</button>
        <button className="btn btn-primary" onClick={guardar}>Guardar horario</button>
      </div>
    </div>
  );
}
