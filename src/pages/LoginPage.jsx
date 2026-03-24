import { useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function LoginPage({ onLogin }) {
  const [correo, setCorreo]   = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  /* Login con correo electronico y contrasena */
  const handleCredentials = async (e) => {
    e.preventDefault();
    if (!correo || !password) return setError("Ingresa correo y contraseña.");
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login-credentials`, {
        usuario: correo,   // el correo ES el campo "usuario" en UsuarioCred
        password
      });
      onLogin(
        {
          displayName: data.nombre,
          email: data.email || data.usuario,
          usuario: data.usuario,
          _id: data.id,
          uid: null
        },
        data.rol
      );
    } catch (err) {
      setError(err.response?.data?.mensaje || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  /* Login con Google */
  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, uid } = result.user;
      const { data } = await axios.post(`${API}/auth/login`, { nombre: displayName, email, uid });
      onLogin({ displayName, email, uid }, data.rol);
    } catch {
      setError("Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">

        {/* Logo y titulo */}
        <div className="login-logo">
          <span className="login-logo-badge">BC</span>
          <div>
            <h1 className="login-title">BartoCitas</h1>
            <p className="login-subtitle">Sistema de citas médicas</p>
          </div>
        </div>

        {/* Formulario correo y contrasena */}
        <form className="login-form" onSubmit={handleCredentials}>
          <div className="field-group">
            <label className="field-label">Correo electrónico</label>
            <input
              className="field-input"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Contraseña</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="divider"><span>o continúa con</span></div>

        {/* Boton de Google */}
        <button className="btn-google" onClick={handleGoogle} disabled={loading} type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Iniciar sesión con Google
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}