import { useState } from "react";
import ListaProductos from "./ListarProductos.jsx";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [passwordInput, setPasswordInput] = useState("");
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [error, setError] = useState("");

  const CONTRASENA_CORRECTA = process.env.REACT_APP_PASSWORD_ADMIN;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === CONTRASENA_CORRECTA) {
      setAccesoPermitido(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  if (accesoPermitido) {
    return (
      <div>
        <div className="admin-panel">
          <h1 className="titulo">Panel de Administración de Productos</h1>
        </div>
        <ListaProductos />
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <h2>Login de administrador</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Contraseña:
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="admin-input"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-button">
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
