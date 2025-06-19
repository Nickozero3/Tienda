import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css"; // Asegúrate de crear este archivo CSS

const SearchBar = ({ apiUrl, placeholder = "Buscar..." }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          apiUrl || `${process.env.REACT_APP_API_BASE_URL}/api/productos`
        );
        if (!response.ok) {
          throw new Error("Error al obtener productos");
        }

        const products = await response.json();
        const filtered = products
          .filter((p) =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 4);

        setSuggestions(filtered);
      } catch (error) {
        console.error("Error:", error.message);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, apiUrl]);

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
    <div className="search-bar-container">
      <form className="search-form" onSubmit={handleSearch} autoComplete="off">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" type="submit">
            Buscar
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((product) => (
              <div
                key={product.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="suggestion-image">
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}${product.imagen}`}
                    alt={product.nombre}
                    onError={handleImageError}
                  />
                </div>
                <span className="suggestion-text">{product.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
