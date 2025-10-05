const axios = require('axios');
const cheerio = require('cheerio');

class PrestasyAnalyzer {
    constructor() {
        this.baseUrl = 'http://invmarcos.ddns.net';
        this.session = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
    }

    async login() {
        try {
            console.log('🔐 Intentando login en el sistema Prestasy...');
            
            // Primero obtener la página de login para cookies/tokens
            const loginPage = await this.session.get('/');
            console.log('📄 Página de login obtenida');

            // Intentar login con credenciales
            const loginData = {
                usuario: 'admin',
                clave: '741741'
            };

            const response = await this.session.post('/login.php', loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('✅ Login response status:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Error en login:', error.message);
            return null;
        }
    }

    async exploreDashboard() {
        try {
            console.log('🏠 Explorando dashboard principal...');
            const response = await this.session.get('/dashboard.php');
            const $ = cheerio.load(response.data);
            
            // Extraer información del dashboard
            const title = $('title').text();
            const menuItems = [];
            
            $('nav a, .menu a, .sidebar a').each((i, el) => {
                const text = $(el).text().trim();
                const href = $(el).attr('href');
                if (text && href) {
                    menuItems.push({ text, href });
                }
            });

            console.log('📊 Dashboard info:');
            console.log('- Título:', title);
            console.log('- Menú items:', menuItems);

            return { title, menuItems, html: response.data };
        } catch (error) {
            console.error('❌ Error explorando dashboard:', error.message);
            return null;
        }
    }

    async exploreAllPages() {
        try {
            const commonPages = [
                '/dashboard.php',
                '/clientes.php',
                '/prestamos.php',
                '/cobros.php',
                '/cobradores.php',
                '/reportes.php',
                '/usuarios.php',
                '/configuracion.php'
            ];

            const pagesInfo = {};

            for (const page of commonPages) {
                try {
                    console.log(`🔍 Analizando: ${page}`);
                    const response = await this.session.get(page);
                    const $ = cheerio.load(response.data);
                    
                    pagesInfo[page] = {
                        title: $('title').text(),
                        forms: $('form').length,
                        tables: $('table').length,
                        buttons: $('button, .btn').length,
                        colors: this.extractColors(response.data),
                        layout: this.analyzeLayout($)
                    };
                } catch (error) {
                    console.log(`⚠️  Página ${page} no accesible: ${error.message}`);
                }
            }

            return pagesInfo;
        } catch (error) {
            console.error('❌ Error explorando páginas:', error.message);
            return {};
        }
    }

    extractColors($html) {
        const colors = [];
        const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
        const matches = $html.match(colorRegex);
        if (matches) {
            return [...new Set(matches)];
        }
        return [];
    }

    analyzeLayout($) {
        return {
            hasNavbar: $('nav, .navbar').length > 0,
            hasSidebar: $('.sidebar, .side-menu').length > 0,
            hasCards: $('.card, .panel').length > 0,
            hasDataTables: $('.datatable, table.table').length > 0
        };
    }

    async generateReport() {
        console.log('🚀 Iniciando análisis completo del sistema Prestasy...\n');
        
        const loginResult = await this.login();
        if (!loginResult) {
            console.log('❌ No se pudo hacer login. Terminando análisis.');
            return;
        }

        const dashboard = await this.exploreDashboard();
        const pages = await this.exploreAllPages();

        console.log('\n📋 REPORTE COMPLETO DEL SISTEMA PRESTASY');
        console.log('=' .repeat(50));
        
        if (dashboard) {
            console.log('\n🏠 DASHBOARD:');
            console.log(`- Título: ${dashboard.title}`);
            console.log(`- Menú items: ${dashboard.menuItems.length}`);
            dashboard.menuItems.forEach(item => {
                console.log(`  • ${item.text} -> ${item.href}`);
            });
        }

        console.log('\n📄 PÁGINAS ENCONTRADAS:');
        Object.entries(pages).forEach(([url, info]) => {
            console.log(`\n${url}:`);
            console.log(`  - Título: ${info.title}`);
            console.log(`  - Formularios: ${info.forms}`);
            console.log(`  - Tablas: ${info.tables}`);
            console.log(`  - Botones: ${info.buttons}`);
            console.log(`  - Colores: ${info.colors.slice(0, 5).join(', ')}`);
            console.log(`  - Layout: Navbar=${info.layout.hasNavbar}, Sidebar=${info.layout.hasSidebar}`);
        });

        return { dashboard, pages };
    }
}

// Ejecutar análisis
const analyzer = new PrestasyAnalyzer();
analyzer.generateReport()
    .then(result => {
        console.log('\n✅ Análisis completado!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error en análisis:', error);
        process.exit(1);
    });