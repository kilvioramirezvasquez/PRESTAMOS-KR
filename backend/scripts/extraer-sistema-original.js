const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function extraerSistemaOriginal() {
    console.log('🔍 Extrayendo estructura del sistema original Prestsy...');
    
    try {
        // Crear sesión con cookies
        const session = axios.create({
            baseURL: 'http://invmarcos.ddns.net',
            timeout: 10000,
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // 1. Obtener página de login
        console.log('📋 Obteniendo página de login...');
        const loginPage = await session.get('/');
        const $login = cheerio.load(loginPage.data);
        
        console.log('Título de login:', $login('title').text());
        
        // 2. Hacer login (simulando form POST)
        console.log('🔐 Intentando login...');
        const loginData = new URLSearchParams({
            'user': 'admin',
            'pass': '741741'
        });

        const loginResponse = await session.post('/login.php', loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Login response status:', loginResponse.status);
        
        // 3. Obtener dashboard principal
        const dashboardResponse = await session.get('/dashboard.php');
        const $ = cheerio.load(dashboardResponse.data);
        
        console.log('✅ Dashboard obtenido, título:', $('title').text());
        
        // 4. Extraer estructura completa
        const sistemaCompleto = {
            titulo: $('title').text(),
            navegacion: [],
            modulos: {},
            dashboard: {
                cards: [],
                tablas: [],
                estadisticas: []
            }
        };

        // Extraer navegación
        $('nav a, .navbar a, .sidebar a, .menu a').each((i, el) => {
            const texto = $(el).text().trim();
            const href = $(el).attr('href');
            const icono = $(el).find('i').attr('class') || '';
            
            if (texto && href) {
                sistemaCompleto.navegacion.push({
                    texto,
                    href,
                    icono
                });
            }
        });

        // Extraer cards del dashboard
        $('.card, .widget, .info-box, [class*="card"]').each((i, el) => {
            const titulo = $(el).find('h1, h2, h3, h4, .card-title, .widget-title').text().trim();
            const valor = $(el).find('.number, .value, .count').text().trim();
            const icono = $(el).find('i').attr('class') || '';
            
            sistemaCompleto.dashboard.cards.push({
                titulo,
                valor,
                icono,
                html: $(el).html()
            });
        });

        // Intentar obtener páginas específicas
        const paginas = ['clientes.php', 'prestamos.php', 'cobros.php', 'cobradores.php', 'reportes.php'];
        
        for (const pagina of paginas) {
            try {
                console.log(`📄 Analizando ${pagina}...`);
                const response = await session.get(`/${pagina}`);
                const $page = cheerio.load(response.data);
                
                sistemaCompleto.modulos[pagina] = {
                    titulo: $page('title').text(),
                    formularios: [],
                    tablas: [],
                    botones: []
                };

                // Extraer formularios
                $page('form').each((i, form) => {
                    const campos = [];
                    $(form).find('input, select, textarea').each((j, field) => {
                        campos.push({
                            name: $(field).attr('name'),
                            type: $(field).attr('type'),
                            placeholder: $(field).attr('placeholder'),
                            required: $(field).attr('required') !== undefined
                        });
                    });
                    
                    sistemaCompleto.modulos[pagina].formularios.push({
                        action: $(form).attr('action'),
                        method: $(form).attr('method'),
                        campos
                    });
                });

                // Extraer tablas
                $page('table').each((i, table) => {
                    const headers = [];
                    $(table).find('th').each((j, th) => {
                        headers.push($(th).text().trim());
                    });
                    
                    sistemaCompleto.modulos[pagina].tablas.push({
                        headers,
                        filas: $(table).find('tr').length
                    });
                });

                console.log(`✅ ${pagina} analizada`);
                
            } catch (error) {
                console.log(`⚠️ No se pudo acceder a ${pagina}:`, error.message);
            }
        }

        // Guardar análisis
        fs.writeFileSync(
            '/home/sistema-prestamos/sistema-original-completo.json', 
            JSON.stringify(sistemaCompleto, null, 2)
        );

        console.log('💾 Análisis guardado en sistema-original-completo.json');
        console.log('📊 Resumen del análisis:');
        console.log(`- Navegación: ${sistemaCompleto.navegacion.length} elementos`);
        console.log(`- Dashboard cards: ${sistemaCompleto.dashboard.cards.length} elementos`);
        console.log(`- Módulos analizados: ${Object.keys(sistemaCompleto.modulos).length}`);

        return sistemaCompleto;

    } catch (error) {
        console.error('❌ Error en extracción:', error.message);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    extraerSistemaOriginal().then(() => {
        console.log('🎉 Extracción completa finalizada');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { extraerSistemaOriginal };