import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

import LoginPage    from "./pages/LoginPage";
import AdminPage    from "./pages/AdminPage";
import DoctorPage   from "./pages/DoctorPage";
import PacientePage from "./pages/PacientePage";
import Topbar       from "./components/Topbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [rol, setRol]   = useState(null);

  const handleLogin = (userData, userRol) => { setUser(userData); setRol(userRol); };

  const handleLogout = async () => {
    if (user?.uid) await signOut(auth);
    setUser(null); setRol(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="app">
      <Topbar user={user} rol={rol} onLogout={handleLogout} />
      <main className="main-content">
        {rol === "admin"    && <AdminPage    user={user} />}
        {rol === "doctor"   && <DoctorPage   user={user} />}
        {rol === "paciente" && <PacientePage user={user} />}
      </main>
    </div>
  );
}
