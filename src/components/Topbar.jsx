export default function Topbar({ user, rol, onLogout }) {
  const rolLabel = { admin: "Administrador", doctor: "Doctor", paciente: "Paciente" };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-badge">HC</div>
        <div>
          <span className="brand-name">HealthCitas</span>
          <span className="brand-rol">{rolLabel[rol] || ""}</span>
        </div>
      </div>
      <div className="userbox">
        <span className="user-name">{user?.displayName}</span>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
