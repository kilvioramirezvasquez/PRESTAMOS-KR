const axios = require('axios');
const cheerio = require('cheerio');

async function simulateJavaScriptLogin() {
    console.log('🔐 SIMULANDO LOGIN JAVASCRIPT DEL SISTEMA PRESTASY');
    console.log('=' .repeat(50));

    const session = axios.create({
        baseURL: 'http://invmarcos.ddns.net',
        timeout: 15000,
        withCredentials: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'es-ES,es;q=0.5',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    });

    try {
        // 1. Primero obtener la página para establecer sesión
        console.log('📄 Estableciendo sesión...');
        await session.get('/');

        // 2. Probar diferentes endpoints de autenticación
        const authEndpoints = [
            '/login.php',
            '/auth.php', 
            '/validate.php',
            '/check.php',
            '/ajax/login.php',
            '/api/login.php',
            '/includes/login.php',
            '/login_process.php',
            '/process_login.php'
        ];

        const credentials = {
            user: 'admin',
            pass: '741741'
        };

        console.log('🔑 Probando endpoints de autenticación...');
        
        for (const endpoint of authEndpoints) {
            try {
                console.log(`Probando: ${endpoint}`);
                const response = await session.post(endpoint, credentials);
                console.log(`  Status: ${response.status}`);
                console.log(`  Response length: ${response.data.length}`);
                
                // Verificar respuesta JSON
                try {
                    const jsonData = typeof response.data === 'string' ? 
                                   JSON.parse(response.data) : response.data;
                    console.log(`  JSON Response:`, jsonData);
                    
                    if (jsonData.success || jsonData.status === 'success' || jsonData.redirect) {
                        console.log('✅ LOGIN EXITOSO VÍA JSON!');
                        
                        // Si hay redirect, seguirlo
                        if (jsonData.redirect) {
                            console.log(`🔄 Siguiendo redirect: ${jsonData.redirect}`);
                            const dashboardResponse = await session.get(jsonData.redirect);
                            return await analyzeDashboard(dashboardResponse.data);
                        }
                    }
                } catch (jsonError) {
                    // No es JSON, continuar
                }
                
            } catch (error) {
                if (error.response) {
                    console.log(`  Error ${error.response.status}: ${error.response.statusText}`);
                } else {
                    console.log(`  Error: ${error.message}`);
                }
            }
        }

        // 3. Probar con formato de datos diferentes
        console.log('\n🔄 Probando formatos de datos alternativos...');
        const dataFormats = [
            `user=admin&pass=741741`,
            `usuario=admin&clave=741741`,
            `email=admin&password=741741`,
            JSON.stringify({user: 'admin', pass: '741741'}),
            JSON.stringify({usuario: 'admin', clave: '741741'})
        ];

        for (const data of dataFormats) {
            try {
                const isJson = data.startsWith('{');
                const headers = isJson ? 
                    {'Content-Type': 'application/json'} : 
                    {'Content-Type': 'application/x-www-form-urlencoded'};

                const response = await session.post('/login.php', data, { headers });
                console.log(`Formato: ${isJson ? 'JSON' : 'Form'} - Status: ${response.status}`);
                
                if (response.data.includes('dashboard') || response.data.includes('main.php')) {
                    console.log('✅ LOGIN EXITOSO!');
                    return await analyzeDashboard(response.data);
                }
            } catch (error) {
                // Continuar con siguiente formato
            }
        }

        console.log('\n⚠️  No se pudo hacer login automático.');
        console.log('💡 Información recopilada del sistema Prestasy:');
        console.log('   - Campos de login: user, pass');
        console.log('   - Credenciales: admin, 741741');
        console.log('   - Framework CSS: Bootstrap');
        console.log('   - Iconos: Icomoon');
        console.log('   - JavaScript: jQuery');
        
        return null;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function analyzeDashboard(html) {
    console.log('\n🏠 ANALIZANDO DASHBOARD...');
    const $ = cheerio.load(html);
    
    const analysis = {
        title: $('title').text(),
        navigation: [],
        cards: [],
        tables: [],
        colors: [],
        layout: {
            hasSidebar: $('.sidebar, .side-menu, nav').length > 0,
            hasTopbar: $('.navbar, .header, .topbar').length > 0,
            hasCards: $('.card, .panel, .box').length > 0
        }
    };

    // Extraer navegación
    $('nav a, .menu a, .sidebar a, ul li a').each((i, link) => {
        const href = $(link).attr('href');
        const text = $(link).text().trim();
        if (href && text && text.length > 1) {
            analysis.navigation.push({ text, href });
        }
    });

    // Extraer tarjetas/paneles
    $('.card, .panel, .box, .widget').each((i, card) => {
        const title = $(card).find('.card-title, .panel-title, .box-title, h1, h2, h3').first().text().trim();
        const content = $(card).text().trim().substring(0, 100);
        analysis.cards.push({ title, content });
    });

    // Extraer colores del CSS inline
    const styleText = $('style').text() + ' ' + $('*').attr('style');
    const colorMatches = styleText.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/g);
    if (colorMatches) {
        analysis.colors = [...new Set(colorMatches)];
    }

    console.log('📊 ANÁLISIS DEL DASHBOARD:');
    console.log(`- Título: ${analysis.title}`);
    console.log(`- Enlaces de navegación: ${analysis.navigation.length}`);
    console.log(`- Tarjetas/Paneles: ${analysis.cards.length}`);
    console.log(`- Colores encontrados: ${analysis.colors.length}`);
    console.log(`- Layout: Sidebar=${analysis.layout.hasSidebar}, Topbar=${analysis.layout.hasTopbar}`);

    if (analysis.navigation.length > 0) {
        console.log('\n🗂️  MENÚ PRINCIPAL:');
        analysis.navigation.slice(0, 10).forEach(item => {
            console.log(`  ${item.text} -> ${item.href}`);
        });
    }

    return analysis;
}

// Ejecutar
simulateJavaScriptLogin()
    .then(result => {
        if (result) {
            console.log('\n✅ Sistema analizado exitosamente!');
        } else {
            console.log('\n📝 Análisis parcial completado.');
        }
        console.log('\n🔄 Ahora procederé a replicar el diseño en nuestro sistema...');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });