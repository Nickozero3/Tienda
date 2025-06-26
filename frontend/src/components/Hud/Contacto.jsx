import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "./Contacto.css";

const Contacto = () => {
  return (
    <section className="contacto-local">
      <h2>Contacto</h2>

      <div className="contacto-info">
        <div className="contacto-item">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="contacto-icon" />
          <p>Local, La Falda, Cordoba, Argentina</p>
        </div>

        <div className="contacto-item">
          <FontAwesomeIcon icon={faPhone} className="contacto-icon" />
          <p>
            <a href="tel:+521234567890">+54 9 3548 554840</a>
          </p>
        </div>

        <div className="contacto-item">
          <FontAwesomeIcon icon={faEnvelope} className="contacto-icon" />
          <p>
            <a href="mailto:contacto@midominio.com">contacto@midominio.com</a>
          </p>
        </div>

        <div className="contacto-item">
          <FontAwesomeIcon icon={faClock} className="contacto-icon" />
          <p>
            Lunes a Sabados: <br />
            10:00 AM - 13:00 PM y 17:30 PM - 21:30 PM
          </p>
        </div>
      </div>

      <div className="mapa">
        <iframe
          title="Mapa del Local"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54664.566485551586!2d-64.53817468315489!3d-31.09484784919342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d82540a7563cd%3A0x63c72e7d55a0ee1e!2sLa%20Falda%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1750719526822!5m2!1ses!2sar"
          width="600"
          height="450"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
};

export default Contacto;
