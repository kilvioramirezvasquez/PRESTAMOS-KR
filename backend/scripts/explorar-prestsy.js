const axios = require('axios');
const fs = require('fs');

async function explorarSistemaPrestsy() {
    console.log('🔍 Explorando sistema Prestsy...');
    
    const baseURL = 'http://invmarcos.ddns.net';
    const session = axios.create({ 
        baseURL,
        timeout: 5000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    // Lista de páginas comunes en sistemas de préstamos
    const paginasPosibles = [
        '',           // página principal
        'index.php',
        'login.php', 
        'dashboard.php',
        'main.php',
        'home.php',
        'admin.php',
        'clientes.php',
        'prestamos.php', 
        'cobros.php',
        'cobradores.php',
        'usuarios.php',
        'reportes.php',
        'configuracion.php',
        'cliente.php',
        'prestamo.php',
        'cobro.php',
        'cobrador.php',
        'user.php',
        'reporte.php',
        'config.php',
        'lista_clientes.php',
        'lista_prestamos.php',
        'lista_cobros.php',
        'nueva_cliente.php',
        'nuevo_prestamo.php',
        'nuevo_cobro.php',
        'editar_cliente.php',
        'editar_prestamo.php',
        'ver_cliente.php',
        'ver_prestamo.php',
        'buscar.php',
        'search.php'
    ];

    const paginasEncontradas = [];
    const estructura = {
        paginasExistentes: [],
        paginasNoEncontradas: [],
        analisis: {}
    };

    console.log(`📋 Probando ${paginasPosibles.length} páginas posibles...`);

    for (const pagina of paginasPosibles) {
        try {
            const url = pagina ? `/${pagina}` : '/';
            console.log(`🔍 Probando: ${url}`);
            
            const response = await session.get(url);
            
            if (response.status === 200) {
                console.log(`✅ Encontrada: ${url} (${response.status})`);
                
                estructura.paginasExistentes.push({
                    url: url,
                    status: response.status,
                    size: response.data.length,
                    contentType: response.headers['content-type'],
                    titulo: extraerTitulo(response.data)
                });

                // Guardar contenido HTML para análisis
                fs.writeFileSync(
                    `/home/sistema-prestamos/pagina_${pagina.replace('.php', '') || 'index'}.html`,
                    response.data
                );
                
            } else {
                estructura.paginasNoEncontradas.push({
                    url: url,
                    status: response.status
                });
            }

        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`❌ No existe: ${pagina} (404)`);
                estructura.paginasNoEncontradas.push({
                    url: `/${pagina}`,
                    status: 404,
                    error: 'Not Found'
                });
            } else if (error.response?.status === 302 || error.response?.status === 301) {
                console.log(`🔄 Redirección: ${pagina} -> ${error.response.headers.location}`);
                estructura.paginasExistentes.push({
                    url: `/${pagina}`,
                    status: error.response.status,
                    redirect: error.response.headers.location
                });
            } else {
                console.log(`⚠️ Error en ${pagina}:`, error.message);
                estructura.paginasNoEncontradas.push({
                    url: `/${pagina}`,
                    error: error.message
                });
            }
        }
        
        // Pausa pequeña para no saturar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Guardar estructura encontrada
    fs.writeFileSync(
        '/home/sistema-prestamos/estructura-prestsy.json',
        JSON.stringify(estructura, null, 2)
    );

    console.log('📊 Resumen del análisis:');
    console.log(`✅ Páginas encontradas: ${estructura.paginasExistentes.length}`);
    console.log(`❌ Páginas no encontradas: ${estructura.paginasNoEncontradas.length}`);
    
    console.log('\n📄 Páginas existentes:');
    estructura.paginasExistentes.forEach(p => {
        console.log(`  - ${p.url} (${p.status}) - ${p.titulo || 'Sin título'}`);
    });

    return estructura;
}

function extraerTitulo(html) {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : '';
}

// Ejecutar
if (require.main === module) {
    explorarSistemaPrestsy().then(() => {
        console.log('🎉 Exploración completa');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });
}

module.exports = { explorarSistemaPrestsy };