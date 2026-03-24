import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [ok, setOk]             = useState("");

  // Cargar usuarios registrados con Google
  const cargar = () =>
    axios.get(`${API}/admin/usuarios-google`).then(r => setUsuarios(r.data));

  useEffect(() => { cargar(); }, []);

  // Limpiar formulario
  const limpiar = () => {
    setNombre(""); setEmail(""); setError(""); setOk("");
  };

  // Agregar usuario Google manualmente
  const agregar = async () => {
    setError(""); setOk("");

    if (!nombre.trim() || !email.trim()) {
      return setError("Nombre y correo son obligatorios.");
    }

    try {
      await axios.post(`${API}/admin/usuarios-google`, { nombre, email });
      setOk("Usuario agregado correctamente.");
      limpiar();
      cargar();
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error al agregar usuario.");
    }
  };

  // Eliminar usuario Google
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await axios.delete(`${API}/admin/usuarios-google/${id}`);
      cargar();
    } catch (e) {
      alert("Error al eliminar usuario.");
    }
  };

  return (
    <div className="split-layout">

      {/* Formulario para agregar usuario Google manualmente */}
      <div className="ui-card">
        <h2 className="card-title">Agregar Usuario</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Usuarios registrados con Google. Puedes agregar o eliminar entradas manualmente.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {ok    && <div className="alert alert-ok">{ok}</div>}

        <label className="label">Nombre completo *</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="María López"
        />

        <label className="label">Correo electrónico *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="maria@gmail.com"
        />

        <button
          className="btn btn-primary"
          style={{ marginTop: 12 }}
          onClick={agregar}
        >
          Agregar Usuario
        </button>
      </div>

      {/* Lista de usuarios Google registrados */}
      <div className="ui-card">
        <h2 className="card-title">Usuarios registrados con Google</h2>
        <div className="ui-card-list">
          {usuarios.map(u => (
            <div className="ui-card-item" key={u._id}>
              <div className="cita-main">
                <div className="cita-especialidad">{u.nombre}</div>
                <div className="cita-meta">{u.email}</div>
              </div>
              <div className="ui-card-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminar(u._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {usuarios.length === 0 && (
            <p className="empty-msg">Sin usuarios registrados con Google.</p>
          )}
        </div>
      </div>
    </div>
  );
}