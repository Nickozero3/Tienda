import ListaProductos from "./ListarProductos.jsx";

const adminPanel = () => {
    return (
       <div>
        <div className="admin-panel">
            <h1 className="titulo">Panel de Administración de Productos</h1>

        </div>
            <ListaProductos />
        
       </div>
    );
    }

export default adminPanel;
