import { useState } from "react";
import GestionCitas from "../components/GestionCitas";
import GestionDoctores from "../components/GestionDoctores";
import GestionAdmins from "../components/GestionAdmins";
import GestionUsuarios from "../components/GestionUsuarios";

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("citas");

  const tabs = [
    { id: "citas",    label: "Citas" },
    { id: "doctores", label: "Doctores" },
    { id: "admins",   label: "Admins" },
    { id: "usuarios", label: "Usuarios" },
  ];

  return (
    <div className="page-container">
      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "tab-btn--active" : ""}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "citas"    && <GestionCitas user={user} rol="admin" />}
      {tab === "doctores" && <GestionDoctores />}
      {tab === "admins"   && <GestionAdmins />}
      {tab === "usuarios" && <GestionUsuarios />}
    </div>
  );
}
