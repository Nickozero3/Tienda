import React, { useEffect, useRef, useState, useCallback } from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import "./FiltroCategoria.css";

const categorias = {
  Celulares: ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Motorola'],
  Cables: ['USB-C', 'Lightning', 'Micro USB', 'HDMI'],
  Accesorios: ['Protectores', 'Soportes', 'Adaptadores'],
  Fundas: ['iPhone', 'Samsung', 'Universal'],
  Audífonos: ['Inalámbricos', 'Con cable', 'Deportivos'],
  Cargadores: ['Inalámbricos', 'Rápidos', 'Automotriz'],
  Otros: ['Varios']
};

const FiltroCategorias = ({ onFiltroChange }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(10000);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
  const sliderRef = useRef(null);

  const notificarCambio = useCallback((filtros, min, max) => {
    onFiltroChange?.({
      filtrosSeleccionados: filtros,
      precioMin: min,
      precioMax: max,
    });
  }, [onFiltroChange]);

  useEffect(() => {
    if (sliderRef.current && !sliderRef.current.noUiSlider) {
      noUiSlider.create(sliderRef.current, {
        start: [0, 10000],
        connect: true,
        range: {
          min: 0,
          max: 10000,
        },
        step: 10,
        tooltips: [true, true],
        format: {
          to: (value) => Math.round(value),
          from: (value) => parseInt(value),
        },
      });

      sliderRef.current.noUiSlider.on("update", (values) => {
        const [min, max] = values.map(Number);
        setPrecioMin(min);
        setPrecioMax(max);
        notificarCambio(seleccionados, min, max);
      });
    }
  }, [notificarCambio, seleccionados]);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

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

  const resetFilters = () => {
    setSeleccionados([]);
    setPrecioMin(0);
    setPrecioMax(10000);
    setCategoriasAbiertas({});
    if (sliderRef.current?.noUiSlider) {
      sliderRef.current.noUiSlider.set([0, 10000]);
    }
    notificarCambio([], 0, 10000);
  };

  return (
    <>
      <button className="boton-filtros-mobile" onClick={toggleMenu}>Filtros</button>
      <div className={`filtros-overlay ${menuAbierto ? 'visible' : ''}`} onClick={toggleMenu} />
      <div className={`filtros-container ${menuAbierto ? 'abierto' : ''}`}>
        <button className="cerrar-filtros-mobile" onClick={toggleMenu}>×</button>

        <div className="filtro-bloque">
          <h4>Todas las categorías</h4>
        </div>

        <div className="filtro-precio">
          <h4 className="filtro-titulo">Precio</h4>
          <div className="precio-rango">
            <span className="precio-minimo">${precioMin.toLocaleString("es-AR")}</span>
            <span className="separador"> – </span>
            <span className="precio-maximo">${precioMax.toLocaleString("es-AR")}</span>
          </div>
          <div className="price-slider-container">
            <div ref={sliderRef} className="noui-slider-wrapper" />
          </div>
        </div>

        {Object.entries(categorias).map(([categoria, subcategorias]) => (
          <div key={categoria} className="filtro-bloque">
            <h4 onClick={() => toggleCategoria(categoria)} className="categoria-titulo">
              {categoria}
              <span className={`flecha ${categoriasAbiertas[categoria] ? 'abierta' : ''}`}>▼</span>
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


        <button className="reset-filters-btn" onClick={resetFilters}>
          <span className="reset-icon">↻</span> Resetear Filtros
        </button>
      </div>
    </>
  );
};

export default FiltroCategorias;
