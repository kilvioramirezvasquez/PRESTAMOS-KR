const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function explorarSistemaCompleto() {
    console.log('🔍 Explorando sistema Prestsy completo...');
    
    const baseURL = 'http://invmarcos.ddns.net';
    
    // Crear sesión con soporte para cookies
    const session = axios.create({
        baseURL,
        timeout: 10000,
        withCredentials: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const sistemaPrestsy = {
        login: {},
        panel: {},
        navegacion: [],
        modulos: {},
        archivosCSS: [],
        archivosJS: [],
        estructura: {}
    };

    try {
        // 1. Analizar página de login
        console.log('📋 Analizando página de login...');
        const loginPage = fs.readFileSync('/home/sistema-prestamos/pagina_index.html', 'utf8');
        const $login = cheerio.load(loginPage);
        
        sistemaPrestsy.login = {
            titulo: $login('title').text(),
            logo: $login('img').attr('src'),
            campos: [],
            scripts: [],
            estilos: []
        };

        // Extraer campos del formulario
        $login('input').each((i, input) => {
            sistemaPrestsy.login.campos.push({
                id: $login(input).attr('id'),
                type: $login(input).attr('type'),
                placeholder: $login(input).attr('placeholder'),
                class: $login(input).attr('class')
            });
        });

        // Extraer archivos CSS y JS
        $login('link[rel="stylesheet"]').each((i, link) => {
            sistemaPrestsy.archivosCSS.push($login(link).attr('href'));
        });

        $login('script[src]').each((i, script) => {
            sistemaPrestsy.archivosJS.push($login(script).attr('src'));
        });

        console.log('✅ Login analizado');

        // 2. Hacer login real
        console.log('🔐 Intentando login...');
        
        const loginData = new URLSearchParams({
            'user': 'admin',
            'pass': '741741'
        });

        const loginResponse = await session.post('/logear.php', loginData);
        console.log('Login response:', loginResponse.data);

        // 3. Acceder al panel principal
        console.log('🏠 Accediendo al panel...');
        const panelResponse = await session.get('/panel.php');
        
        if (panelResponse.status === 200) {
            console.log('✅ Panel obtenido exitosamente');
            
            // Guardar HTML del panel
            fs.writeFileSync('/home/sistema-prestamos/panel.html', panelResponse.data);
            
            const $panel = cheerio.load(panelResponse.data);
            
            sistemaPrestsy.panel = {
                titulo: $panel('title').text(),
                navegacion: [],
                modulos: [],
                dashboard: {
                    cards: [],
                    tablas: [],
                    graficos: []
                }
            };

            // Extraer navegación
            console.log('🧭 Extrayendo navegación...');
            $panel('nav a, .navbar a, .sidebar a, .menu a, ul li a').each((i, link) => {
                const texto = $panel(link).text().trim();
                const href = $panel(link).attr('href');
                const icono = $panel(link).find('i').attr('class') || '';
                
                if (texto && href && !href.includes('#')) {
                    sistemaPrestsy.panel.navegacion.push({
                        texto,
                        href,
                        icono
                    });
                }
            });

            // Extraer cards o widgets del dashboard
            console.log('📊 Extrayendo widgets del dashboard...');
            $panel('.card, .widget, .stat-box, .info-box, [class*="card"], .panel').each((i, widget) => {
                const titulo = $panel(widget).find('h1, h2, h3, h4, .title, .card-title, .widget-title').text().trim();
                const valor = $panel(widget).find('.number, .value, .count, .stat-number').text().trim();
                const icono = $panel(widget).find('i').attr('class') || '';
                const color = $panel(widget).attr('class');
                
                if (titulo || valor) {
                    sistemaPrestsy.panel.dashboard.cards.push({
                        titulo,
                        valor,
                        icono,
                        color,
                        html: $panel(widget).html()?.substring(0, 200) + '...'
                    });
                }
            });

            // Extraer tablas
            $panel('table').each((i, table) => {
                const headers = [];
                $panel(table).find('th').each((j, th) => {
                    headers.push($panel(th).text().trim());
                });
                
                if (headers.length > 0) {
                    sistemaPrestsy.panel.dashboard.tablas.push({
                        headers,
                        filas: $panel(table).find('tr').length - 1
                    });
                }
            });

            console.log(`📋 Navegación encontrada: ${sistemaPrestsy.panel.navegacion.length} elementos`);
            console.log(`📊 Widgets encontrados: ${sistemaPrestsy.panel.dashboard.cards.length} elementos`);
            console.log(`📋 Tablas encontradas: ${sistemaPrestsy.panel.dashboard.tablas.length} elementos`);

            // 4. Explorar módulos encontrados en la navegación
            console.log('🔍 Explorando módulos...');
            
            for (const nav of sistemaPrestsy.panel.navegacion.slice(0, 10)) { // Limitar a 10 para no saturar
                try {
                    console.log(`📄 Explorando: ${nav.texto} (${nav.href})`);
                    
                    let url = nav.href;
                    if (!url.startsWith('http')) {
                        url = url.startsWith('/') ? url : `/${url}`;
                    }
                    
                    const moduloResponse = await session.get(url);
                    
                    if (moduloResponse.status === 200) {
                        const $modulo = cheerio.load(moduloResponse.data);
                        
                        sistemaPrestsy.modulos[nav.texto] = {
                            url: nav.href,
                            titulo: $modulo('title').text(),
                            formularios: [],
                            tablas: [],
                            botones: []
                        };

                        // Extraer formularios
                        $modulo('form').each((i, form) => {
                            const campos = [];
                            $modulo(form).find('input, select, textarea').each((j, field) => {
                                campos.push({
                                    name: $modulo(field).attr('name'),
                                    type: $modulo(field).attr('type') || $modulo(field).prop('tagName').toLowerCase(),
                                    placeholder: $modulo(field).attr('placeholder'),
                                    label: $modulo(field).closest('.form-group').find('label').text().trim()
                                });
                            });
                            
                            sistemaPrestsy.modulos[nav.texto].formularios.push({
                                action: $modulo(form).attr('action'),
                                method: $modulo(form).attr('method'),
                                campos
                            });
                        });

                        // Extraer tablas
                        $modulo('table').each((i, table) => {
                            const headers = [];
                            $modulo(table).find('th').each((j, th) => {
                                headers.push($modulo(th).text().trim());
                            });
                            
                            sistemaPrestsy.modulos[nav.texto].tablas.push({
                                headers,
                                filas: $modulo(table).find('tr').length - 1
                            });
                        });

                        // Extraer botones principales
                        $modulo('button, .btn, input[type="submit"]').each((i, btn) => {
                            const texto = $modulo(btn).text().trim() || $modulo(btn).attr('value');
                            if (texto) {
                                sistemaPrestsy.modulos[nav.texto].botones.push({
                                    texto,
                                    class: $modulo(btn).attr('class'),
                                    onclick: $modulo(btn).attr('onclick')
                                });
                            }
                        });

                        console.log(`✅ Módulo '${nav.texto}' analizado`);
                        
                        // Guardar HTML del módulo
                        fs.writeFileSync(
                            `/home/sistema-prestamos/modulo_${nav.texto.replace(/\s+/g, '_').toLowerCase()}.html`,
                            moduloResponse.data
                        );
                        
                    } else {
                        console.log(`⚠️ Error ${moduloResponse.status} en módulo '${nav.texto}'`);
                    }
                    
                } catch (error) {
                    console.log(`❌ Error explorando '${nav.texto}':`, error.message);
                }
                
                // Pausa para no saturar
                await new Promise(resolve => setTimeout(resolve, 200));
            }

        } else {
            console.log(`❌ No se pudo acceder al panel (${panelResponse.status})`);
        }

    } catch (error) {
        console.error('❌ Error en exploración:', error.message);
    }

    // Guardar análisis completo
    fs.writeFileSync(
        '/home/sistema-prestamos/sistema-prestsy-completo.json',
        JSON.stringify(sistemaPrestsy, null, 2)
    );

    console.log('💾 Análisis completo guardado');
    console.log('📊 Resumen final:');
    console.log(`- Archivos CSS: ${sistemaPrestsy.archivosCSS.length}`);
    console.log(`- Archivos JS: ${sistemaPrestsy.archivosJS.length}`);
    console.log(`- Navegación: ${sistemaPrestsy.panel.navegacion?.length || 0} elementos`);
    console.log(`- Módulos analizados: ${Object.keys(sistemaPrestsy.modulos).length}`);
    console.log(`- Widgets dashboard: ${sistemaPrestsy.panel.dashboard?.cards?.length || 0}`);

    return sistemaPrestsy;
}

// Ejecutar
if (require.main === module) {
    explorarSistemaCompleto().then(() => {
        console.log('🎉 Exploración completa finalizada');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { explorarSistemaCompleto };