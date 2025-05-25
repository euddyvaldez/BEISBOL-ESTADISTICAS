// src/pages/JugadoresPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import '../index.css'; // Asegúrate de tener tus estilos importados
import '@fortawesome/fontawesome-free/css/all.min.css'; // Importa Font Awesome

const JugadoresPage = () => {
  // Estado para la lista de jugadores
  const [jugadores, setJugadores] = useState([]);
  // Estado para el código del nuevo jugador
  const [codigoActual, setCodigoActual] = useState(1);
  // Estado para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [chaqueta, setChaqueta] = useState('');
  const [numero, setNumero] = useState('');
  const [equipo, setEquipo] = useState('');
  // Estado para el jugador que se está editando
  const [jugadorEditando, setJugadorEditando] = useState(null); // null si no se edita, objeto si se edita
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect para cargar jugadores del localStorage al montar el componente
  useEffect(() => {
    const storedJugadores = getFromLocalStorage('jugadoresBaseball');
    if (storedJugadores) {
      setJugadores(storedJugadores);
      // Calcular el código actual máximo + 1
      const maxCodigo = storedJugadores.length > 0 ? Math.max(...storedJugadores.map(j => j.codigo)) : 0;
      setCodigoActual(maxCodigo + 1);
    }
  }, []); // El array vacío asegura que se ejecuta solo una vez al montar

  // useEffect para guardar jugadores en localStorage cada vez que la lista cambia
  useEffect(() => {
    saveToLocalStorage('jugadoresBaseball', jugadores);
  }, [jugadores]);

  const agregarJugador = () => {
    if (!nombre || !chaqueta || !numero || !equipo) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const nuevoJugador = {
      codigo: codigoActual,
      nombre,
      chaqueta,
      numero,
      equipo
    };

    setJugadores([...jugadores, nuevoJugador]);
    setCodigoActual(prevCodigo => prevCodigo + 1); // Incrementa el código para el siguiente jugador
    // Limpiar campos
    setNombre('');
    setChaqueta('');
    setNumero('');
    setEquipo('');
  };

  const editarJugador = (jugador) => {
    setJugadorEditando(jugador);
    setNombre(jugador.nombre);
    setChaqueta(jugador.chaqueta);
    setNumero(jugador.numero);
    setEquipo(jugador.equipo);
  };

  const guardarEdicion = () => {
    if (!nombre || !chaqueta || !numero || !equipo) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    setJugadores(jugadores.map(j =>
      j.codigo === jugadorEditando.codigo
        ? { ...j, nombre, chaqueta, numero, equipo }
        : j
    ));
    cancelarEdicion();
  };

  const cancelarEdicion = () => {
    setJugadorEditando(null);
    setNombre('');
    setChaqueta('');
    setNumero('');
    setEquipo('');
  };

  const eliminarJugador = (codigo) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      setJugadores(jugadores.filter(j => j.codigo !== codigo));
      // No necesitas recalcular codigoActual aquí, ya que solo afecta la adición.
    }
  };

  const filtrarJugadores = jugadores.filter(jugador =>
    jugador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jugador.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jugador.chaqueta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jugador.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const startLine = lines[0].includes('Código') ? 1 : 0; // Si hay encabezado

      const nuevosJugadores = [];
      let maxCodigoImportado = 0;

      for (let i = startLine; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        // Manejar campos entre comillas que puedan contener comas
        const values = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);

        if (values && values.length >= 5) {
          const codigo = parseInt(values[0].replace(/\"/g, '').trim());
          const nombre = values[1].replace(/\"/g, '').trim();
          const chaqueta = values[2].replace(/\"/g, '').trim();
          const numero = values[3].replace(/\"/g, '').trim();
          const equipo = values[4].replace(/\"/g, '').trim();

          if (!isNaN(codigo) && nombre && chaqueta && numero && equipo) { // Validar datos
            nuevosJugadores.push({ codigo, nombre, chaqueta, numero, equipo });
            if (codigo > maxCodigoImportado) {
              maxCodigoImportado = codigo;
            }
          }
        }
      }

      if (nuevosJugadores.length > 0) {
        if (window.confirm(`¿Importar ${nuevosJugadores.length} jugadores? Esto reemplazará los datos actuales.`)) {
          setJugadores(nuevosJugadores);
          setCodigoActual(maxCodigoImportado + 1);
        }
      } else {
        alert('No se encontraron datos válidos en el archivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const header = "Código,Nombre,Chaqueta,Número,Equipo\n";
    const csvContent = jugadores.map(j =>
      `"${j.codigo}","${j.nombre}","${j.chaqueta}","${j.numero}","${j.equipo}"`
    ).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'jugadores.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };


  return (
    <>
      <Header title="ADMINISTRAR JUGADORES" />

      <main>
        <section className="form-section">
          <h2>{jugadorEditando ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}</h2>
          <div className="input-group">
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input type="text" placeholder="Chaqueta" value={chaqueta} onChange={(e) => setChaqueta(e.target.value)} required />
            <input type="text" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} required />
            <input type="text" placeholder="Equipo" value={equipo} onChange={(e) => setEquipo(e.target.value)} required />
            {jugadorEditando ? (
              <>
                <button onClick={guardarEdicion} className="button success">Guardar Edición</button>
                <button onClick={cancelarEdicion} className="button cancel">Cancelar</button>
              </>
            ) : (
              <button onClick={agregarJugador} className="button primary">Agregar Jugador</button>
            )}
          </div>
        </section>

        <section className="data-section">
          <h2>Lista de Jugadores</h2>
          <div className="search-edit">
            <input
              type="text"
              placeholder="Buscar por nombre, equipo, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleExportCSV} className="button info">
              <i className="fas fa-file-export"></i> Exportar CSV
            </button>
            <label htmlFor="importCsv" className="button info custom-file-upload">
              <i className="fas fa-file-import"></i> Importar CSV
              <input type="file" id="importCsv" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Chaqueta</th>
                  <th>Número</th>
                  <th>Equipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrarJugadores.length > 0 ? (
                  filtrarJugadores.map((jugador) => (
                    <tr key={jugador.codigo}>
                      <td>{jugador.codigo}</td>
                      <td>{jugador.nombre}</td>
                      <td>{jugador.chaqueta}</td>
                      <td>{jugador.numero}</td>
                      <td>{jugador.equipo}</td>
                      <td>
                        <button onClick={() => editarJugador(jugador)} className="button small warning">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => eliminarJugador(jugador.codigo)} className="button small danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No hay jugadores registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

export default JugadoresPage;