import { useState } from "react";
import { auth, provider } from "./firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [citas, setCitas] = useState([]);

  const [idEditar, setIdEditar] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);

      await axios.post(`${API}/usuarios`, {
        nombre: result.user.displayName,
        email: result.user.email,
        uid: result.user.uid,
      });

      obtenerCitas(result.user.email);
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al iniciar sesión.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);

    setCitas([]);
    limpiarFormulario();
  };

  const validarCampos = () => {
    if (!fecha || !hora || !especialidad || !motivo) {
      setErrorMsg("Faltan campos: fecha, hora, especialidad y motivo.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const limpiarFormulario = () => {
    setFecha("");
    setHora("");
    setEspecialidad("");
    setMotivo("");
    setIdEditar(null);
    setErrorMsg("");
  };

  const crearCita = async () => {
    if (!validarCampos()) return;

    try {
      await axios.post(`${API}/citas`, {
        usuarioEmail: user.email,
        fecha,
        hora,
        especialidad,
        motivo,
      });

      obtenerCitas(user.email);
      limpiarFormulario();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response.data.mensaje);
    }
  };

  const editarCita = (cita) => {
    setIdEditar(cita._id);
    setFecha(cita.fecha);
    setHora(cita.hora);
    setEspecialidad(cita.especialidad);
    setMotivo(cita.motivo);
    setErrorMsg("");
  };

  const actualizarCita = async () => {
    if (!validarCampos()) return;

    try {
      await axios.put(`${API}/citas/${idEditar}`, {
        fecha,
        hora,
        especialidad,
        motivo,
      });

      obtenerCitas(user.email);
      limpiarFormulario();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response.data.mensaje);
    }
  };

  const eliminarCita = async (id) => {
    try {
      await axios.delete(`${API}/citas/${id}`);
      obtenerCitas(user.email);
      if (idEditar === id) limpiarFormulario();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al eliminar la cita.");
    }
  };

  const obtenerCitas = async (email) => {
    const res = await axios.get(`${API}/citas/${email}`);
    setCitas(res.data);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-badge">HC</div>
          <div>
            <h1>Sistema de Citas Médicas</h1>
            <span>Paciente</span>
          </div>
        </div>

        {!user ? null : (
          <div className="userbox">
            <span className="usertext"> {user.displayName}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      {!user ? (
        <div className="card">
          <h2>Acceso</h2>
          <button className="btn" onClick={handleLogin}>
            Iniciar sesión con Google
          </button>
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        </div>
      ) : (
        <div className="grid">
          <div className="card">
            <h2>{idEditar ? "Editar cita" : "Agendar cita"}</h2>

            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

            <label className="label">Fecha *</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

            <label className="label">Hora *</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />

            <label className="label">Especialidad *</label>
            <input
              type="text"
              placeholder="Ej. Cardiología"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />

            <label className="label">Motivo *</label>
            <input
              type="text"
              placeholder="Ej. Dolor de cabeza"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            {!idEditar ? (
              <button className="btn" onClick={crearCita}>Guardar Cita</button>
            ) : (
              <div className="row">
                <button className="btn" onClick={actualizarCita}>Actualizar</button>
                <button className="btn btn-secondary" onClick={limpiarFormulario}>Cancelar</button>
              </div>
            )}

            <p className="hint">* Todos los campos son obligatorios</p>
          </div>

          <div className="card">
            <h2>Mis Citas</h2>

            <div className="list">
              {citas.map((cita) => (
                <div className="item" key={cita._id}>
                  <div className="item-main">
                    <div className="item-title">
                      {cita.especialidad}
                      <span className="pill">{cita.fecha} • {cita.hora}</span>
                    </div>
                    <div className="item-sub">Motivo: {cita.motivo}</div>
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-small" onClick={() => editarCita(cita)}>
                      Editar
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => eliminarCita(cita._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;