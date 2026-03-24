import { useState } from "react";
import GestionCitas from "../components/GestionCitas";
import MiHorario from "../components/MiHorario";

export default function DoctorPage({ user }) {
  const [tab, setTab] = useState("citas");

  return (
    <div className="page-container">
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "citas" ? "tab-btn--active" : ""}`} onClick={() => setTab("citas")}>
          Citas
        </button>
        <button className={`tab-btn ${tab === "horario" ? "tab-btn--active" : ""}`} onClick={() => setTab("horario")}>
          Mi Horario
        </button>
      </div>

      {tab === "citas"   && <GestionCitas user={user} rol="doctor" />}
      {tab === "horario" && <MiHorario user={user} />}
    </div>
  );
}
