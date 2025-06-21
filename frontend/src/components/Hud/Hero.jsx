import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Hud/Hero.css';
import { Slide, Fade } from "react-awesome-reveal"

const url = process.env.REACT_APP_API_BASE_URL;

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`${url}/api/productos`);
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }

        const products = await response.json();
        const filtered = products
          .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 4);

        setSuggestions(filtered);
      } catch (error) {
        console.error('Error:', error.message);
        setSuggestions([]); // Return empty array instead of mock data
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?busqueda=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.nombre);
    setSuggestions([]);
    navigate(`/productos?busqueda=${encodeURIComponent(product.nombre)}`);
  };

  const handleImageError = (e) => {
    e.target.src = `${process.env.PUBLIC_URL}/Images/placeholder.png`;
  };

  return (
    <section className="hero">
      <h1><Slide duration={1500}>Descubrí los mejores dispositivos</Slide></h1>
      <div><Fade delay={1e3} duration={1500} direction='left'><p>Celulares de última generación, calidad y precio imbatible</p></Fade></div>

      <form className="search-container" onSubmit={handleSearch} autoComplete="off">
        <div className="search-input-wrapper">
          <input
            type="text"
            id="searchInput"
            placeholder="Buscar dispositivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-cta" type="submit">
            Ver productos
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((product) => (
              <div
                key={product.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="suggestion-image-container">
                  <img
                    src={`${url}${product.imagen}`}
                    alt={product.nombre}
                    onError={handleImageError}
                  />
                </div>
                <span className="suggestion-name">{product.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </section>
  );
};

export default Hero;