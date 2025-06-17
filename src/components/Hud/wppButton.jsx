import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './wppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '5493548554840'; // Cambialo por tu número real
  const message = encodeURIComponent('Hola, estoy interesado en un producto de *****.');


  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

export default WhatsAppButton;
