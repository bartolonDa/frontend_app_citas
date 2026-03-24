import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function GestionDoctores() {
  const [doctores, setDoctores]         = useState([]);
  const [nombre, setNombre]             = useState("");
  const [email, setEmail]               = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [ok, setOk]                     = useState("");

  // Cargar lista de doctores al montar el componente
  const cargar = () =>
    axios.get(`${API}/doctores`).then(r => setDoctores(r.data));

  useEffect(() => { cargar(); }, []);

  // Limpiar formulario
  const limpiar = () => {
    setNombre(""); setEmail(""); setEspecialidad(""); setPassword("");
    setError(""); setOk("");
  };

  // Crear nuevo doctor
  const crear = async () => {
    setError(""); setOk("");

    // Validar todos los campos obligatorios
    if (!nombre.trim() || !email.trim() || !especialidad.trim() || !password.trim()) {
      return setError("Todos los campos son obligatorios.");
    }

    try {
      await axios.post(`${API}/admin/crear-doctor`, {
        nombre, email, especialidad, password
      });
      setOk("Doctor creado correctamente.");
      limpiar();
      cargar();
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error al crear doctor.");
    }
  };

  // Eliminar doctor
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este doctor?")) return;
    try {
      await axios.delete(`${API}/admin/doctores/${id}`);
      cargar();
    } catch (e) {
      alert("Error al eliminar doctor.");
    }
  };

  return (
    <div className="split-layout">

      {/* Formulario para crear doctor */}
      <div className="ui-card">
        <h2 className="card-title">Nuevo Doctor</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {ok    && <div className="alert alert-ok">{ok}</div>}

        <label className="label">Nombre completo *</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Dr. García"
        />

        {/* El correo es el identificador y usuario de login */}
        <label className="label">Correo electrónico *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="doctor@correo.com"
        />

        <label className="label">Especialidad *</label>
        <input
          value={especialidad}
          onChange={e => setEspecialidad(e.target.value)}
          placeholder="Cardiología"
        />

        <label className="label">Contraseña *</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button
          className="btn btn-primary"
          style={{ marginTop: 12 }}
          onClick={crear}
        >
          Crear Doctor
        </button>
      </div>

      {/* Lista de doctores registrados */}
      <div className="ui-card">
        <h2 className="card-title">Doctores registrados</h2>
        <div className="ui-card-list">
          {doctores.map(d => (
            <div className="ui-card-item" key={d._id}>
              <div className="cita-main">
                <div className="cita-especialidad">{d.nombre}</div>
                <div className="cita-meta">{d.especialidad} · {d.email}</div>
              </div>
              <div className="ui-card-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminar(d._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {doctores.length === 0 && (
            <p className="empty-msg">Sin doctores registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}