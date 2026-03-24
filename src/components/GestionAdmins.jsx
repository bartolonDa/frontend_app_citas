import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function GestionAdmins() {
  const [admins, setAdmins]     = useState([]);
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [ok, setOk]             = useState("");

  // Cargar lista de admins al montar el componente
  const cargar = () =>
    axios.get(`${API}/admin/admins`).then(r => setAdmins(r.data));

  useEffect(() => { cargar(); }, []);

  // Limpiar el formulario
  const limpiar = () => {
    setNombre(""); setEmail(""); setPassword("");
    setError(""); setOk("");
  };

  // Crear nuevo admin
  const crear = async () => {
    setError(""); setOk("");

    // Validar que todos los campos esten llenos
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      return setError("Todos los campos son obligatorios.");
    }

    try {
      await axios.post(`${API}/admin/admins`, { nombre, email, password });
      setOk("Admin creado correctamente.");
      limpiar();
      cargar();
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error al crear admin.");
    }
  };

  // Eliminar admin
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este admin?")) return;
    try {
      await axios.delete(`${API}/admin/admins/${id}`);
      cargar();
    } catch (e) {
      alert("Error al eliminar admin.");
    }
  };

  return (
    <div className="split-layout">

      {/* Formulario para crear admin */}
      <div className="ui-card">
        <h2 className="card-title">Nuevo Administrador</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {ok    && <div className="alert alert-ok">{ok}</div>}

        <label className="label">Nombre completo *</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Juan Admin"
        />

        {/* El correo electronico actua como usuario de login */}
        <label className="label">Correo electrónico *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@correo.com"
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
          Crear Admin
        </button>
      </div>

      {/* Lista de admins registrados */}
      <div className="ui-card">
        <h2 className="card-title">Administradores registrados</h2>
        <div className="ui-card-list">
          {admins.map(a => (
            <div className="ui-card-item" key={a._id}>
              <div className="cita-main">
                <div className="cita-especialidad">{a.nombre}</div>
                <div className="cita-meta">{a.email}</div>
              </div>
              <div className="ui-card-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminar(a._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {admins.length === 0 && (
            <p className="empty-msg">Sin administradores registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}