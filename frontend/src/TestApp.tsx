import React from 'react'

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#3b82f6' }}>🚀 Sistema de Préstamos - Prueba</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginTop: '20px' 
      }}>
        {/* Tarjeta de prueba 1 */}
        <div style={{
          background: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3>Total Clientes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>150</p>
        </div>

        {/* Tarjeta de prueba 2 */}
        <div style={{
          background: 'linear-gradient(45deg, #10b981, #34d399)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3>Préstamos Activos</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>85</p>
        </div>

        {/* Tarjeta de prueba 3 */}
        <div style={{
          background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3>Cobros Pendientes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>32</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2>✅ Pruebas del Sistema</h2>
        <ul>
          <li>✅ React cargando correctamente</li>
          <li>✅ Estilos en línea funcionando</li>
          <li>✅ Gradientes de colores visibles</li>
          <li>✅ Responsive design</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Ir al Dashboard Completo
        </button>
      </div>
    </div>
  )
}

export default TestApp