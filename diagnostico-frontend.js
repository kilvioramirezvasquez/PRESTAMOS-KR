// Script de diagnóstico para probar conexiones del frontend
const axios = require('axios');

const API_BASE_URL = 'http://159.203.69.59:5000/api';

async function diagnosticar() {
    console.log('🔍 Iniciando diagnóstico del sistema...\n');

    try {
        // 1. Probar login
        console.log('1. Probando login...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin',
            password: '741741'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login exitoso');
            const token = loginResponse.data.token;
            
            // 2. Probar estadísticas del dashboard
            console.log('\n2. Probando estadísticas del dashboard...');
            const statsResponse = await axios.get(`${API_BASE_URL}/estadisticas-migradas/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (statsResponse.data.success) {
                console.log('✅ Estadísticas obtenidas:', {
                    clientes: statsResponse.data.data.clientes.total,
                    prestamos: statsResponse.data.data.prestamos.cantidad,
                    montoTotal: statsResponse.data.data.prestamos.totalPrestado
                });
            }
            
            // 3. Probar lista de clientes
            console.log('\n3. Probando lista de clientes...');
            const clientesResponse = await axios.get(`${API_BASE_URL}/clientes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (clientesResponse.data.success) {
                console.log(`✅ Clientes obtenidos: ${clientesResponse.data.data.length} clientes`);
                if (clientesResponse.data.data.length > 0) {
                    console.log('   Primer cliente:', clientesResponse.data.data[0].nombre);
                }
            }
            
            // 4. Probar lista de préstamos
            console.log('\n4. Probando lista de préstamos...');
            const prestamosResponse = await axios.get(`${API_BASE_URL}/prestamos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (prestamosResponse.data.success) {
                console.log(`✅ Préstamos obtenidos: ${prestamosResponse.data.data.length} préstamos`);
                if (prestamosResponse.data.data.length > 0) {
                    console.log('   Primer préstamo:', {
                        cliente: prestamosResponse.data.data[0].cliente?.nombre || 'Sin nombre',
                        monto: prestamosResponse.data.data[0].monto
                    });
                }
            }
            
        } else {
            console.log('❌ Error en login:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error general:', error.response?.data || error.message);
    }
    
    console.log('\n🏁 Diagnóstico completado');
}

diagnosticar();