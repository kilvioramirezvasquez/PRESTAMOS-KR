const axios = require('axios');
const cheerio = require('cheerio');

class PrestasyDeepAnalyzer {
    constructor() {
        this.baseUrl = 'http://invmarcos.ddns.net';
        this.session = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            }
        });
    }

    async testLogin() {
        try {
            console.log('🔐 Probando diferentes métodos de login...');
            
            // Método 1: GET inicial para obtener la página
            const initialPage = await this.session.get('/');
            console.log('📄 Página inicial obtenida, status:', initialPage.status);
            
            // Analizar página inicial
            const $ = cheerio.load(initialPage.data);
            console.log('🔍 Título página inicial:', $('title').text());
            
            // Buscar formulario de login
            const forms = $('form');
            console.log('📝 Formularios encontrados:', forms.length);
            
            forms.each((i, form) => {
                const action = $(form).attr('action');
                const method = $(form).attr('method');
                console.log(`  Formulario ${i+1}: action="${action}", method="${method}"`);
                
                $(form).find('input').each((j, input) => {
                    const name = $(input).attr('name');
                    const type = $(input).attr('type');
                    console.log(`    Input: name="${name}", type="${type}"`);
                });
            });

            // Método 2: Intentar login con diferentes formatos
            const loginAttempts = [
                { usuario: 'admin', clave: '741741' },
                { user: 'admin', password: '741741' },
                { email: 'admin', pass: '741741' },
                { login: 'admin', password: '741741' }
            ];

            for (const credentials of loginAttempts) {
                try {
                    console.log(`🔑 Intentando login con:`, Object.keys(credentials));
                    const response = await this.session.post('/login.php', credentials);
                    console.log(`   Status: ${response.status}, Redirected: ${response.request.responseURL}`);
                    
                    if (response.data.includes('dashboard') || response.data.includes('menu') || response.status === 302) {
                        console.log('✅ Login exitoso!');
                        return response;
                    }
                } catch (error) {
                    console.log(`   Error: ${error.message}`);
                }
            }

            return initialPage;
        } catch (error) {
            console.error('❌ Error en testLogin:', error.message);
            return null;
        }
    }

    async discoverPages() {
        console.log('🔍 Descubriendo estructura del sistema...');
        
        const possiblePages = [
            '/', '/index.php', '/login.php', '/main.php', '/home.php',
            '/dashboard.php', '/dashboard', '/inicio.php', '/principal.php',
            '/clientes.php', '/cliente.php', '/customers.php',
            '/prestamos.php', '/prestamo.php', '/loans.php',
            '/cobros.php', '/cobro.php', '/payments.php',
            '/cobradores.php', '/cobrador.php', '/collectors.php',
            '/usuarios.php', '/user.php', '/users.php',
            '/reportes.php', '/reporte.php', '/reports.php',
            '/admin.php', '/admin/', '/panel.php', '/panel/',
            '/config.php', '/configuracion.php', '/settings.php'
        ];

        const accessiblePages = [];

        for (const page of possiblePages) {
            try {
                const response = await this.session.get(page);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
                    const title = $('title').text();
                    const hasTable = $('table').length > 0;
                    const hasForm = $('form').length > 0;
                    const hasMenu = $('nav, .menu, .navbar').length > 0;
                    
                    accessiblePages.push({
                        url: page,
                        title: title,
                        hasTable,
                        hasForm,
                        hasMenu,
                        size: response.data.length
                    });
                    
                    console.log(`✅ ${page} - "${title}" (${response.data.length} chars)`);
                } else {
                    console.log(`⚠️  ${page} - Status: ${response.status}`);
                }
            } catch (error) {
                if (error.response && error.response.status !== 404) {
                    console.log(`❌ ${page} - Error: ${error.response.status}`);
                }
            }
        }

        return accessiblePages;
    }

    async analyzeMainContent() {
        try {
            console.log('📊 Analizando contenido principal...');
            
            const response = await this.session.get('/');
            const $ = cheerio.load(response.data);
            
            // Extraer todo el contenido útil
            const analysis = {
                title: $('title').text(),
                headings: [],
                links: [],
                forms: [],
                scripts: [],
                styles: [],
                images: []
            };

            $('h1, h2, h3, h4, h5, h6').each((i, el) => {
                analysis.headings.push($(el).text().trim());
            });

            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();
                if (href && text) {
                    analysis.links.push({ href, text });
                }
            });

            $('form').each((i, form) => {
                const formData = {
                    action: $(form).attr('action'),
                    method: $(form).attr('method'),
                    inputs: []
                };
                
                $(form).find('input, select, textarea').each((j, input) => {
                    formData.inputs.push({
                        name: $(input).attr('name'),
                        type: $(input).attr('type'),
                        placeholder: $(input).attr('placeholder')
                    });
                });
                
                analysis.forms.push(formData);
            });

            // Buscar archivos JavaScript y CSS
            $('script[src]').each((i, el) => {
                analysis.scripts.push($(el).attr('src'));
            });

            $('link[href*=".css"], style').each((i, el) => {
                const href = $(el).attr('href');
                if (href) analysis.styles.push(href);
            });

            return analysis;
        } catch (error) {
            console.error('❌ Error analizando contenido:', error.message);
            return null;
        }
    }

    async run() {
        console.log('🚀 ANÁLISIS PROFUNDO DEL SISTEMA PRESTASY');
        console.log('=' .repeat(50));
        
        const loginResult = await this.testLogin();
        const pages = await this.discoverPages();
        const content = await this.analyzeMainContent();
        
        console.log('\n📋 RESUMEN DEL ANÁLISIS:');
        console.log(`- Páginas accesibles: ${pages.length}`);
        
        if (content) {
            console.log(`- Título: ${content.title}`);
            console.log(`- Enlaces: ${content.links.length}`);
            console.log(`- Formularios: ${content.forms.length}`);
            console.log(`- Scripts: ${content.scripts.length}`);
        }

        console.log('\n📄 PÁGINAS DESCUBIERTAS:');
        pages.forEach(page => {
            console.log(`${page.url} - "${page.title}"`);
            console.log(`  Tablas: ${page.hasTable}, Formularios: ${page.hasForm}, Menú: ${page.hasMenu}`);
        });

        if (content && content.forms.length > 0) {
            console.log('\n📝 FORMULARIOS ENCONTRADOS:');
            content.forms.forEach((form, i) => {
                console.log(`Formulario ${i+1}: ${form.action} (${form.method})`);
                form.inputs.forEach(input => {
                    console.log(`  - ${input.name} (${input.type})`);
                });
            });
        }

        if (content && content.links.length > 0) {
            console.log('\n🔗 ENLACES PRINCIPALES:');
            content.links.slice(0, 10).forEach(link => {
                console.log(`  ${link.text} -> ${link.href}`);
            });
        }

        return { pages, content };
    }
}

const analyzer = new PrestasyDeepAnalyzer();
analyzer.run()
    .then(() => {
        console.log('\n✅ Análisis profundo completado!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });