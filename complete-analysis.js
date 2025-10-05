const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');

async function analyzePrestaasyComplete() {
    console.log('🚀 ANÁLISIS COMPLETO DEL SISTEMA PRESTASY ORIGINAL');
    console.log('=' .repeat(60));

    const session = axios.create({
        baseURL: 'http://invmarcos.ddns.net',
        timeout: 15000,
        withCredentials: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    });

    try {
        // 1. Obtener página de login y analizar el HTML completo
        console.log('📄 Obteniendo página de login...');
        const loginPage = await session.get('/');
        const $ = cheerio.load(loginPage.data);
        
        // Mostrar TODO el HTML para entender la estructura
        console.log('\n🔍 ANÁLISIS COMPLETO DE LA PÁGINA DE LOGIN:');
        console.log('Título:', $('title').text());
        
        // Buscar formularios y campos específicos
        console.log('\n📝 ESTRUCTURA DEL FORMULARIO:');
        $('form').each((i, form) => {
            console.log(`Formulario ${i+1}:`);
            console.log('  Action:', $(form).attr('action') || 'No definido');
            console.log('  Method:', $(form).attr('method') || 'No definido');
            console.log('  ID:', $(form).attr('id') || 'No definido');
            console.log('  Class:', $(form).attr('class') || 'No definido');
            
            $(form).find('input, select, textarea, button').each((j, field) => {
                const tag = field.tagName.toLowerCase();
                const name = $(field).attr('name') || 'sin nombre';
                const id = $(field).attr('id') || 'sin id';
                const type = $(field).attr('type') || 'sin tipo';
                const placeholder = $(field).attr('placeholder') || 'sin placeholder';
                const value = $(field).attr('value') || 'sin valor';
                
                console.log(`    ${tag}: name="${name}", id="${id}", type="${type}"`);
                if (placeholder !== 'sin placeholder') console.log(`         placeholder="${placeholder}"`);
                if (value !== 'sin valor') console.log(`         value="${value}"`);
            });
        });

        // Buscar cualquier script o información sobre el sistema
        console.log('\n💻 SCRIPTS Y RECURSOS:');
        $('script').each((i, script) => {
            const src = $(script).attr('src');
            if (src) {
                console.log(`  Script externo: ${src}`);
            } else {
                const content = $(script).text();
                if (content.trim().length > 0) {
                    console.log(`  Script inline (${content.length} chars):`, 
                               content.substring(0, 100) + '...');
                }
            }
        });

        $('link[rel="stylesheet"]').each((i, link) => {
            console.log(`  CSS: ${$(link).attr('href')}`);
        });

        // Intentar diferentes métodos de login
        console.log('\n🔐 INTENTANDO LOGIN CON DIFERENTES MÉTODOS...');
        
        // Método 1: Usando los nombres de campos que encontremos
        const inputNames = [];
        $('form input[type="text"], form input[type="email"], form input:not([type])').each((i, input) => {
            const name = $(input).attr('name');
            const id = $(input).attr('id');
            if (name) inputNames.push(name);
            if (id && !inputNames.includes(id)) inputNames.push(id);
        });

        const passwordNames = [];
        $('form input[type="password"]').each((i, input) => {
            const name = $(input).attr('name');
            const id = $(input).attr('id');
            if (name) passwordNames.push(name);
            if (id && !passwordNames.includes(id)) passwordNames.push(id);
        });

        console.log('Campos de usuario encontrados:', inputNames);
        console.log('Campos de contraseña encontrados:', passwordNames);

        // Generar combinaciones de login
        const loginCombinations = [];
        for (const userField of inputNames.length > 0 ? inputNames : ['usuario', 'user', 'email', 'login']) {
            for (const passField of passwordNames.length > 0 ? passwordNames : ['clave', 'password', 'pass', 'pwd']) {
                loginCombinations.push({
                    [userField]: 'admin',
                    [passField]: '741741'
                });
            }
        }

        // También probar envío por POST a diferentes endpoints
        const endpoints = ['/login.php', '/auth.php', '/validate.php', '/check.php', '/', '/index.php'];

        for (const endpoint of endpoints) {
            for (const credentials of loginCombinations) {
                try {
                    console.log(`🔑 Probando ${endpoint} con:`, Object.keys(credentials));
                    
                    // Como form data
                    const response1 = await session.post(endpoint, qs.stringify(credentials), {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
                    
                    console.log(`   Status: ${response1.status}`);
                    
                    // Verificar si el login fue exitoso
                    if (response1.data.includes('dashboard') || 
                        response1.data.includes('menu') || 
                        response1.data.includes('bienvenido') ||
                        response1.data.includes('cerrar sesion') ||
                        response1.data.includes('logout') ||
                        !response1.data.includes('Iniciar')) {
                        
                        console.log('✅ ¡LOGIN EXITOSO!');
                        console.log('📊 Analizando página después del login...');
                        
                        const postLogin$ = cheerio.load(response1.data);
                        console.log('Nuevo título:', postLogin$('title').text());
                        
                        // Buscar menús y navegación
                        console.log('\n🗂️  MENÚS Y NAVEGACIÓN:');
                        postLogin$('nav a, .menu a, .navbar a, ul li a').each((i, link) => {
                            const href = $(link).attr('href');
                            const text = $(link).text().trim();
                            if (href && text && text.length > 1) {
                                console.log(`  ${text} -> ${href}`);
                            }
                        });

                        // Buscar cualquier tabla o datos
                        console.log('\n📊 TABLAS Y DATOS:');
                        postLogin$('table').each((i, table) => {
                            console.log(`  Tabla ${i+1}: ${$(table).find('tr').length} filas`);
                        });

                        return response1.data;
                    }
                } catch (error) {
                    // Silenciar errores de login fallidos
                }
            }
        }

        console.log('\n⚠️  No se pudo hacer login automáticamente.');
        console.log('📋 Información recopilada de la página de login:');
        console.log('- Sistema: Prestasy');
        console.log('- Desarrollado por: Softcoder');
        console.log('- Formulario de login presente');
        console.log('- Credenciales esperadas: admin / 741741');

        return loginPage.data;

    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
        return null;
    }
}

// Ejecutar
analyzePrestaasyComplete()
    .then((result) => {
        if (result) {
            console.log('\n✅ Análisis completado. Información del sistema original obtenida.');
        } else {
            console.log('\n❌ No se pudo completar el análisis.');
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error final:', error);
        process.exit(1);
    });