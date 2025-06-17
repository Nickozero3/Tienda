import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/Hud/Layout";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Ofertas from "./pages/Ofertas";
import Contacto from "./pages/Contacto";
import Adminpanel from "./components/AdminPanel/AdminPanel";
import Seleccionado from "./components/seleccionado";

import { CartProvider } from "./components/Carrito/CartContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="productos" element={<Productos />} />
            <Route path="ofertas" element={<Ofertas />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="admin" element={<Adminpanel />} />
            <Route path="/seleccionado/:id" element={<Seleccionado />} />

            {/* Catch-all route for 404 Not Found */}
            <Route path="404" element={<NotFound />} />
            {/* Redirect any unmatched routes to NotFound */}

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
