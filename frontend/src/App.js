import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import "firebase/compat/firestore";
import "firebase/compat/auth";

import Main from "./pages/main/Main";
import Login from "./pages/auth/Login";

import Navbar from "./components/Navbar";
import Protected from "./util/Protected";
import { AuthProvider } from "./context/AuthContext";
import League from "./pages/main/League";
import Team from "./pages/main/Team";
import Draft from "./pages/main/Draft";

/**
 * TODO
 * add marker to drafting team in draft order tab and cursor set to there
 * add marker to player to draft
 * search in players tab in draft
 * timer that selects for you if not drafted
 */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />

          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Protected />}>
              <Route path="/" element={<Main />} />
            </Route>

            <Route path="/league/:id" element={<Protected />}>
              <Route path="/league/:id" element={<League />} />
            </Route>

            <Route path="league/:id/team/:teamId" element={<Protected />}>
              <Route path="/league/:id/team/:teamId" element={<Team />} />
            </Route>

            <Route path="/league/:id/draft" element={<Protected />}>
              <Route path="/league/:id/draft" element={<Draft />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
