import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


const Layout = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">RidePulse</h1>
        <nav className="app-nav">
          <Navbar />
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        © 2025 RidePulse Nairobi
      </footer>
    </div>
  );
};

export default Layout;
