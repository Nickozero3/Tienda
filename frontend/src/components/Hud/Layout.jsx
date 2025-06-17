import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Nav from "./Nav";
import "./Layout.css";
import WhatsappButton from "./wppButton";
import CartIcon from "../Carrito/CartIcon"; // Asegúrate de que la ruta sea correcta
import CartPopup from "../Carrito/CartPopup"; // Asegúrate de que la ruta sea correcta

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Control del scroll del body
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isMenuOpen]);

  return (
    <div className={`app-container ${isMenuOpen ? "menu-open" : ""}`}>
      <header className="app-header">
        <div className="logo-container">
          <Link to={"/"}>
            <div className="logodiv">
              <img src="./apple.svg" alt="Logo" className="logo" />
              <p className="parrafo">****</p>
            </div>
          </Link>
        </div>
        <div className="nav-container">
          <Nav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <CartIcon />
        </div>
      </header>
      <div className="main-content">
        <Outlet />
      </div>
      <CartPopup /> {/* Popup global del carrito */}
      <WhatsappButton />
      <footer className="app-footer">
        © {new Date().getFullYear()} Cellstore - Todos los derechos reservados
        <p>
          <b>AV EDEN 144, LA FALDA, CORDOBA</b>
        </p>
        <p>
          <b>
            Developed by:{" "}
            <a
              href="https://instagram.com/Nickozero3"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#E1306C", textDecoration: "none" }}
            >
              Zero3Tech
            </a>
          </b>
        </p>
      </footer>
    </div>
  );
};

export default Layout;
