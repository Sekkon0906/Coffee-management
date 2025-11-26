import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* Landing pública */}
      <Route path="/" element={<Landing />} />

      {/* Área de la app */}
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="team" element={<Team />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="documents" element={<Documents />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
