// App básico para testing
function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema Prestsy - Test</h1>
      <p>Si ves esto, React está funcionando correctamente.</p>
      <button 
        onClick={() => alert('¡Funcionando!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Probar
      </button>
    </div>
  );
}

export default App;