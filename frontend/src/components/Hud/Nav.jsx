import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Nav.css';

const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Limpieza al desmontar
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <button 
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      
      <nav 
        className={`main-nav ${isMobileMenuOpen ? 'active' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <ul className="nav-list">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
              end
              onClick={toggleMobileMenu}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/productos" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
              onClick={toggleMobileMenu}
            >
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ofertas"
              className={({ isActive }) => isActive ? 'active-link' : ''}
              onClick={toggleMobileMenu}
            >
              Ofertas
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contacto"
              className={({ isActive }) => isActive ? 'active-link' : ''}
              onClick={toggleMobileMenu}
            >
              Contacto
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Nav;