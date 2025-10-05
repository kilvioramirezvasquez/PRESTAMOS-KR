const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class SistemaViejo {
    constructor() {
        this.baseUrl = 'http://invmarcos.ddns.net';
        this.session = axios.create({
            baseURL: this.baseUrl,
            timeout: 15000,
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        
        this.datosAnalisis = {
            informacionGeneral: {
                empresa: 'Inversiones Marcos',
                codigo: 'invmarcos / invmarcos_local',
                usuario: 'marcos',
                sitioWeb: 'invmarcos.ddns.net',
                servidorAPI: 'prestamov2.ddns.net:8000'
            },
            baseDatos: {
                principal: {
                    nombre: 'prestamos_invmarcos',
                    host: 'prestamov2.ddns.net',
                    puerto: 3306,
                    usuario: 'p_invmarcos'
                },
                local: {
                    nombre: 'prestamos_invmarcos',
                    host: 'localhost',
                    puerto: 3306,
                    usuario: 'p_invmarcos_app'
                }
            },
            modulos: [],
            paginasEncontradas: [],
            paginasNoEncontradas: [],
            fechaAnalisis: new Date().toISOString(),
            estadoConexion: 'desconocido'
        };
    }

    async verificarConexion() {
        console.log('🌐 Verificando conexión con el sistema original...');
        try {
            const response = await this.session.get('/');
            if (response.status === 200) {
                this.datosAnalisis.estadoConexion = 'conectado';
                console.log('✅ Conexión exitosa con el sistema original');
                return true;
            }
        } catch (error) {
            this.datosAnalisis.estadoConexion = 'desconectado';
            console.log('❌ No se pudo conectar al sistema original:', error.message);
            return false;
        }
    }

    async analizarPaginaPrincipal() {
        console.log('🔍 Analizando página principal...');
        try {
            const response = await this.session.get('/');
            const $ = cheerio.load(response.data);
            
            const titulo = $('title').text() || 'Sin título';
            
            this.datosAnalisis.paginasEncontradas.push({
                url: '/',
                status: response.status,
                titulo: titulo.trim(),
                contentType: response.headers['content-type']
            });

            // Buscar enlaces y formularios
            const enlaces = [];
            $('a[href]').each((i, link) => {
                const href = $(link).attr('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
                    enlaces.push(href);
                }
            });

            console.log(`📄 Página principal analizada: ${titulo}`);
            console.log(`🔗 Enlaces encontrados: ${enlaces.length}`);
            
            return enlaces;
        } catch (error) {
            console.error('❌ Error analizando página principal:', error.message);
            return [];
        }
    }

    async probarPaginas() {
        console.log('🧪 Probando páginas del sistema...');
        
        const paginasAProbar = [
            '/dashboard.php',
            '/main.php',
            '/home.php',
            '/admin.php',
            '/clientes.php',
            '/prestamos.php',
            '/cobros.php',
            '/cobradores.php',
            '/usuarios.php',
            '/reportes.php',
            '/configuracion.php',
            '/cliente.php',
            '/prestamo.php',
            '/cobro.php',
            '/cobrador.php',
            '/login.php',
            '/index.php',
            '/recargas.php',
            '/solicitudes.php',
            '/sync.php',
            '/panel.php'
        ];

        for (const pagina of paginasAProbar) {
            try {
                console.log(`  Probando: ${pagina}`);
                const response = await this.session.get(pagina);
                
                const $ = cheerio.load(response.data);
                const titulo = $('title').text() || 'Sin título';
                
                this.datosAnalisis.paginasEncontradas.push({
                    url: pagina,
                    status: response.status,
                    titulo: titulo.trim(),
                    contentType: response.headers['content-type']
                });
                
                console.log(`    ✅ ${pagina} - ${response.status} - ${titulo.trim()}`);
            } catch (error) {
                this.datosAnalisis.paginasNoEncontradas.push({
                    url: pagina,
                    status: error.response?.status,
                    error: error.response?.statusText || error.message
                });
                
                console.log(`    ❌ ${pagina} - ${error.response?.status || 'Error'} - ${error.message}`);
            }
        }
    }

    generarModulosBasadosEnAnalisis() {
        console.log('📋 Generando información de módulos...');
        
        const modulosBase = [
            {
                nombre: 'Préstamos',
                descripcion: 'Gestión de préstamos y créditos',
                url: '/prestamos.php',
                icono: 'CreditCard',
                funcionalidades: [
                    'Crear nuevo préstamo',
                    'Consultar préstamos activos',
                    'Calcular intereses',
                    'Programar pagos',
                    'Historial de préstamos'
                ]
            },
            {
                nombre: 'Clientes',
                descripcion: 'Administración de clientes asignados',
                url: '/clientes.php',
                icono: 'Users',
                funcionalidades: [
                    'Registro de clientes',
                    'Consulta de información',
                    'Asignación de cobradores',
                    'Historial crediticio',
                    'Documentos del cliente'
                ]
            },
            {
                nombre: 'Cobradores',
                descripcion: 'Gestión de cobradores y rutas',
                url: '/cobradores.php',
                icono: 'UserCheck',
                funcionalidades: [
                    'Gestión de cobradores',
                    'Asignación de rutas',
                    'Control de rendimiento',
                    'Comisiones',
                    'Reportes de cobro'
                ]
            },
            {
                nombre: 'Pagos Realizados',
                descripcion: 'Registro de pagos y transacciones',
                url: '/pagos.php',
                icono: 'DollarSign',
                funcionalidades: [
                    'Registro de pagos',
                    'Consulta de transacciones',
                    'Recibos de pago',
                    'Estados de cuenta',
                    'Conciliación bancaria'
                ]
            },
            {
                nombre: 'Cobros Pendientes',
                descripcion: 'Control de cobros por realizar',
                url: '/cobros.php',
                icono: 'AlertCircle',
                funcionalidades: [
                    'Lista de cobros pendientes',
                    'Programación de visitas',
                    'Seguimiento de morosos',
                    'Notificaciones automáticas',
                    'Estrategias de cobranza'
                ]
            },
            {
                nombre: 'Recargas',
                descripcion: 'Sistema de recargas telefónicas',
                url: '/recargas.php',
                icono: 'Globe',
                funcionalidades: [
                    'Recargas telefónicas',
                    'Consulta de saldo',
                    'Historial de recargas',
                    'Comisiones por recarga',
                    'Reportes de ventas'
                ]
            },
            {
                nombre: 'Solicitudes de Préstamos',
                descripcion: 'Nuevas solicitudes',
                url: '/solicitudes.php',
                icono: 'FileText',
                funcionalidades: [
                    'Recepción de solicitudes',
                    'Evaluación crediticia',
                    'Documentación requerida',
                    'Aprobación/Rechazo',
                    'Seguimiento del proceso'
                ]
            },
            {
                nombre: 'Sincronización',
                descripcion: 'Sincronización de datos',
                url: '/sync.php',
                icono: 'Server',
                funcionalidades: [
                    'Sincronización automática',
                    'Backup de datos',
                    'Resolución de conflictos',
                    'Logs de sincronización',
                    'Monitoreo de estado'
                ]
            },
            {
                nombre: 'Configuración',
                descripcion: 'Configuración del sistema',
                url: '/configuracion.php',
                icono: 'Settings',
                funcionalidades: [
                    'Parámetros del sistema',
                    'Configuración de usuarios',
                    'Tasas de interés',
                    'Configuración de reportes',
                    'Respaldos automáticos'
                ]
            },
            {
                nombre: 'Dashboard',
                descripcion: 'Panel principal del sistema',
                url: '/dashboard.php',
                icono: 'LayoutDashboard',
                funcionalidades: [
                    'Resumen general',
                    'Estadísticas principales',
                    'Alertas y notificaciones',
                    'Accesos rápidos',
                    'Gráficos de rendimiento'
                ]
            }
        ];

        // Determinar el estado de cada módulo basado en las páginas encontradas/no encontradas
        this.datosAnalisis.modulos = modulosBase.map(modulo => {
            const paginaEncontrada = this.datosAnalisis.paginasEncontradas.find(p => p.url === modulo.url);
            const paginaNoEncontrada = this.datosAnalisis.paginasNoEncontradas.find(p => p.url === modulo.url);
            
            let estado = 'desconocido';
            if (paginaEncontrada) {
                estado = 'activo';
            } else if (paginaNoEncontrada) {
                estado = paginaNoEncontrada.status === 404 ? 'inactivo' : 'error';
            }

            return {
                ...modulo,
                estado
            };
        });
    }

    async ejecutarAnalisisCompleto() {
        console.log('🚀 INICIANDO ANÁLISIS COMPLETO DEL SISTEMA ORIGINAL');
        console.log('=' .repeat(60));
        
        const inicioAnalisis = Date.now();
        
        // 1. Verificar conexión
        const conectado = await this.verificarConexion();
        
        if (conectado) {
            // 2. Analizar página principal
            await this.analizarPaginaPrincipal();
            
            // 3. Probar páginas del sistema
            await this.probarPaginas();
        }
        
        // 4. Generar información de módulos
        this.generarModulosBasadosEnAnalisis();
        
        const tiempoTotal = (Date.now() - inicioAnalisis) / 1000;
        this.datosAnalisis.tiempoAnalisis = `${tiempoTotal.toFixed(2)} segundos`;
        
        console.log('\n📊 RESUMEN DEL ANÁLISIS:');
        console.log(`- Estado de conexión: ${this.datosAnalisis.estadoConexion}`);
        console.log(`- Páginas encontradas: ${this.datosAnalisis.paginasEncontradas.length}`);
        console.log(`- Páginas no encontradas: ${this.datosAnalisis.paginasNoEncontradas.length}`);
        console.log(`- Módulos analizados: ${this.datosAnalisis.modulos.length}`);
        console.log(`- Tiempo total: ${this.datosAnalisis.tiempoAnalisis}`);
        
        return this.datosAnalisis;
    }

    guardarResultados() {
        const archivo = path.join(__dirname, 'frontend', 'public', 'sistema-viejo-analisis.json');
        fs.writeFileSync(archivo, JSON.stringify(this.datosAnalisis, null, 2));
        console.log(`💾 Resultados guardados en: ${archivo}`);
    }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
    const analyzer = new SistemaViejo();
    
    analyzer.ejecutarAnalisisCompleto()
        .then((resultados) => {
            analyzer.guardarResultados();
            console.log('\n✅ Análisis completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error durante el análisis:', error);
            process.exit(1);
        });
}

module.exports = SistemaViejo;