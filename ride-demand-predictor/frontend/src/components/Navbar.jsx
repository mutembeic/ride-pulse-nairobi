// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  return (
    <nav className="app-nav">
      <NavLink to="/" className="nav-link">Home</NavLink>
      <NavLink to="/analytics" className="nav-link">Analytics</NavLink>
      <NavLink to="/about" className="nav-link">About</NavLink>
    </nav>
  );
};

export default Navbar;
