import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import './Contacto.css';

const Contacto = () => {
  return (
    <section className="contacto-local">
      <h2>Contacto</h2>
      
      <div className="contacto-info">
        <div className="contacto-item">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="contacto-icon" />
          <p>Av. Eden 144, La Falda, Cordoba, Argentina</p>
        </div>
        
        <div className="contacto-item">
          <FontAwesomeIcon icon={faPhone} className="contacto-icon" />
          <p><a href="tel:+521234567890">+54 9 3548 580977</a></p>
        </div>
        
        <div className="contacto-item">
          <FontAwesomeIcon icon={faEnvelope} className="contacto-icon" />
          <p><a href="mailto:contacto@midominio.com">contacto@midominio.com</a></p>
        </div>
        
        <div className="contacto-item">
          <FontAwesomeIcon icon={faClock} className="contacto-icon" />
          <p>Lunes a Sabados: <br />10:00 AM - 13:00 PM y 17:30 PM - 21:30 PM</p>
        </div>
      </div>
      
      <div className="mapa">
        <iframe 
          title="Ubicación del local"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3416.5889781488813!2d-64.4881062249992!3d-31.09335818070882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d83eb65220c71%3A0x668ee4ebd4bac215!2sCellstore%20-%20ServicioT%C3%A9cnico!5e0!3m2!1ses!2sar!4v1748728680392!5m2!1ses!2sar" 
          width="100%" 
          height="300" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy"
        ></iframe>
      </div>
    </section>
  );
};

export default Contacto;