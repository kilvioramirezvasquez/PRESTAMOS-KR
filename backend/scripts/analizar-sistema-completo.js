const puppeteer = require('puppeteer');
const fs = require('fs');

async function analizarSistemaCompleto() {
    console.log('🚀 Iniciando análisis completo del sistema Prestsy...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Ir a la página de login
        console.log('📋 Accediendo al sistema...');
        await page.goto('http://invmarcos.ddns.net/', { waitUntil: 'networkidle0' });
        
        // Hacer login
        await page.type('input[name="user"]', 'admin');
        await page.type('input[name="pass"]', '741741');
        await page.click('button[type="submit"]');
        
        // Esperar a que cargue el dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        console.log('✅ Login exitoso! Analizando estructura...');
        
        // Extraer navegación principal
        const navegacion = await page.evaluate(() => {
            const menuItems = [];
            const navLinks = document.querySelectorAll('nav a, .navbar a, .menu a, [class*="nav"] a');
            
            navLinks.forEach(link => {
                if (link.href && link.textContent.trim()) {
                    menuItems.push({
                        texto: link.textContent.trim(),
                        url: link.href,
                        clase: link.className
                    });
                }
            });
            
            return menuItems;
        });
        
        console.log('📊 Navegación encontrada:', navegacion);
        
        // Buscar módulos en sidebar o menú
        const modulos = await page.evaluate(() => {
            const modules = [];
            const selectors = [
                '.sidebar a', '.menu-item', '.nav-item', 
                '[class*="sidebar"] a', '[class*="menu"] a',
                'ul li a', '.list-group-item'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.href && el.textContent.trim()) {
                        modules.push({
                            nombre: el.textContent.trim(),
                            url: el.href,
                            icono: el.querySelector('i') ? el.querySelector('i').className : '',
                            clase: el.className
                        });
                    }
                });
            });
            
            return modules;
        });
        
        console.log('🗂️ Módulos encontrados:', modulos);
        
        // Extraer información del dashboard
        const dashboardInfo = await page.evaluate(() => {
            return {
                titulo: document.title,
                h1: document.querySelector('h1') ? document.querySelector('h1').textContent : '',
                cards: Array.from(document.querySelectorAll('.card, .widget, .stat-box, [class*="card"]')).map(card => ({
                    titulo: card.querySelector('h1, h2, h3, h4, .title, .card-title') ? 
                           card.querySelector('h1, h2, h3, h4, .title, .card-title').textContent.trim() : '',
                    contenido: card.textContent.trim(),
                    clases: card.className
                })),
                tablas: Array.from(document.querySelectorAll('table')).map(table => ({
                    headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim()),
                    filas: table.querySelectorAll('tr').length
                }))
            };
        });
        
        console.log('📈 Dashboard info:', dashboardInfo);
        
        // Intentar navegar a módulos específicos conocidos
        const modulosComunes = [
            '/clientes', '/prestamos', '/cobros', '/cobradores', 
            '/reportes', '/configuracion', '/usuarios', '/dashboard'
        ];
        
        const estructuraCompleta = {
            navegacion,
            modulos,
            dashboardInfo,
            paginas: {}
        };
        
        for (const modulo of modulosComunes) {
            try {
                console.log(`🔍 Analizando módulo: ${modulo}`);
                await page.goto(`http://invmarcos.ddns.net${modulo}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 5000 
                });
                
                const paginaInfo = await page.evaluate(() => {
                    return {
                        titulo: document.title,
                        formularios: Array.from(document.querySelectorAll('form')).map(form => ({
                            action: form.action,
                            method: form.method,
                            campos: Array.from(form.querySelectorAll('input, select, textarea')).map(field => ({
                                name: field.name,
                                type: field.type,
                                placeholder: field.placeholder,
                                required: field.required
                            }))
                        })),
                        tablas: Array.from(document.querySelectorAll('table')).map(table => ({
                            headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim())
                        })),
                        botones: Array.from(document.querySelectorAll('button, .btn')).map(btn => ({
                            texto: btn.textContent.trim(),
                            clase: btn.className
                        }))
                    };
                });
                
                estructuraCompleta.paginas[modulo] = paginaInfo;
                console.log(`✅ Módulo ${modulo} analizado`);
                
            } catch (error) {
                console.log(`⚠️ No se pudo acceder a ${modulo}:`, error.message);
            }
        }
        
        // Guardar análisis completo
        fs.writeFileSync('/home/sistema-prestamos/analisis-sistema-completo.json', 
                        JSON.stringify(estructuraCompleta, null, 2));
        
        console.log('💾 Análisis completo guardado en analisis-sistema-completo.json');
        
        return estructuraCompleta;
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
    } finally {
        await browser.close();
    }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
    analizarSistemaCompleto().then(resultado => {
        console.log('🎉 Análisis completo finalizado');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { analizarSistemaCompleto };