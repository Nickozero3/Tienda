import React, { useState } from "react";
import "./FiltroCategoria.css";

  const categorias = {
    Celulares: ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Motorola'],
    Cables: ['USB-C', 'Lightning', 'Micro USB', 'HDMI'],
    Accesorios: ['Protectores', 'Soportes', 'Adaptadores'],
    Fundas: ['iPhone', 'Samsung', 'Universal'],
    'Audífonos': ['Inalámbricos', 'Con cable', 'Deportivos'],
    Cargadores: ['Inalámbricos', 'Rápidos', 'Automotriz'],
    Otros: ['Varios']
  };
  
const FiltroCategorias = ({ onFiltroChange }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(10000);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({});

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const toggleCategoria = (categoria) => {
    setCategoriasAbiertas({
      ...categoriasAbiertas,
      [categoria]: !categoriasAbiertas[categoria],
    });
  };

  const toggleFiltro = (categoria, subcategoria) => {
    const clave = `${categoria}-${subcategoria}`;
    const actualizados = seleccionados.includes(clave)
      ? seleccionados.filter((f) => f !== clave)
      : [...seleccionados, clave];

    setSeleccionados(actualizados);
    notificarCambio(actualizados, precioMin, precioMax);
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === "min") {
      if (value <= precioMax) {
        setPrecioMin(value);
        notificarCambio(seleccionados, value, precioMax);
      }
    } else {
      if (value >= precioMin) {
        setPrecioMax(value);
        notificarCambio(seleccionados, precioMin, value);
      }
    }
  };

  const resetFilters = () => {
    setSeleccionados([]);
    setPrecioMin(0);
    setPrecioMax(10000);
    setCategoriasAbiertas({});
    notificarCambio([], 0, 10000);
  };

  const formatearPrecio = (valor) => {
    return `$${valor.toLocaleString("es-MX")}.00`;
  };

  const notificarCambio = (filtros, min, max) => {
    onFiltroChange?.({
      filtrosSeleccionados: filtros,
      precioMin: min,
      precioMax: max,
    });
  };

  // Calcular porcentajes para el estilo de la barra de precio
  const minPercent = (precioMin / 10000) * 100;
  const maxPercent = (precioMax / 10000) * 100;

  return (
    <>
      {/* Botón para móvil */}
      <button 
        className="boton-filtros-mobile"
        onClick={toggleMenu}
      >
        ☰
      </button>

      {/* Overlay para móvil */}
      <div 
        className={`filtros-overlay ${menuAbierto ? 'visible' : ''}`}
        onClick={toggleMenu}
      />

      {/* Contenedor de filtros */}
      <div className={`filtros-container ${menuAbierto ? 'abierto' : ''}`}>
        {/* Botón de cerrar para móvil */}
        <button 
          className="cerrar-filtros-mobile"
          onClick={toggleMenu}
        >
          ×
        </button>

        <div className="buscar-container">
          <input type="text" placeholder="Buscar" className="buscar-input" />
        </div>

        <div className="filtro-bloque">
          <h4>Todas las categorías</h4>
        </div>

        {Object.entries(categorias).map(([categoria, subcategorias]) => (
          <div key={categoria} className="filtro-bloque">
            <h4 onClick={() => toggleCategoria(categoria)} className="categoria-titulo">
              {categoria}
              <span className={`flecha ${categoriasAbiertas[categoria] ? 'abierta' : ''}`}>
                ▼
              </span>
            </h4>
            <ul className={`subcategorias ${categoriasAbiertas[categoria] ? 'visible' : ''}`}>
              {subcategorias.map((sub) => {
                const clave = `${categoria}-${sub}`;
                const activo = seleccionados.includes(clave);

                return (
                  <li key={clave}>
                    <label>
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => toggleFiltro(categoria, sub)}
                      />
                      {sub}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="filtro-precio">
          <h4>Precio</h4>
          <div className="precio-rango">
            {formatearPrecio(precioMin)} – {formatearPrecio(precioMax)}
          </div>
          <div className="price-slider-container">
            <div 
              className="price-slider"
              style={{
                "--min": minPercent,
                "--max": maxPercent
              }}
            >
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={precioMin}
                onChange={(e) => handlePriceChange(e, "min")}
                className="slider min-slider"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={precioMax}
                onChange={(e) => handlePriceChange(e, "max")}
                className="slider max-slider"
              />
            </div>
          </div>
        </div>

        <button 
          className="reset-filters-btn"
          onClick={resetFilters}
        >
          <span className="reset-icon">↻</span> Resetear Filtros
        </button>
      </div>
    </>
  );
};

export default FiltroCategorias;