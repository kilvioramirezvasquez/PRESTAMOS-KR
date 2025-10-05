#!/bin/bash

# ============================================
# SCRIPT DE CREACIÓ COMPLETA
# APP ANDROID - SISTEMA DE COBRADORES
# ============================================

set -e

echo ".............................................."
echo ".  APP ANDROID - SISTEMA DE COBRADORES       ."
echo ".  Generació Automáica Completa            ."
echo ".............................................."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[.]${NC} $1"; }
print_info() { echo -e "${BLUE}[i]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[.]${NC} $1"; }

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no estáinstalado. Instala Node.js 18+ primero."
    exit 1
fi

APP_NAME="CobradorApp"
print_info "Creando proyecto React Native..."

# Crear proyecto React Native
if [ -d "$APP_NAME" ]; then
    print_warning "El directorio $APP_NAME ya existe. .Eliminarlo? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        rm -rf "$APP_NAME"
        print_status "Directorio eliminado"
    else
        print_error "Instalació cancelada"
        exit 1
    fi
fi

# Inicializar React Native
npx react-native@latest init "$APP_NAME" --skip-install

cd "$APP_NAME"

# ============================================
# ACTUALIZAR PACKAGE.JSON CON DEPENDENCIAS
# ============================================
print_info "Configurando dependencias..."

cat > package.json << 'EOF'
{
  "name": "CobradorApp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.2",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.2",
    "axios": "^1.6.5",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-bluetooth-escpos-printer": "^0.1.1",
    "react-native-permissions": "^4.0.4",
    "react-native-geolocation-service": "^5.3.1",
    "react-native-maps": "^1.10.0",
    "react-native-document-picker": "^9.1.1",
    "react-native-camera": "^4.2.1",
    "date-fns": "^3.0.6",
    "react-native-paper": "^5.12.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.73.1",
    "@react-native/metro-config": "^0.73.3",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.2.6",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.6.3",
    "eslint": "^8.19.0",
    "jest": "^29.6.3",
    "metro-react-native-babel-preset": "0.77.0",
    "prettier": "^2.8.8",
    "react-test-renderer": "18.2.0",
    "typescript": "5.0.4"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF

print_status "package.json configurado"

# ============================================
# CREAR ESTRUCTURA DE CARPETAS
# ============================================
print_info "Creando estructura de carpetas..."

mkdir -p src/{screens,components,navigation,services,utils,context,assets/images}

# ============================================
# SERVICIOS Y API
# ============================================
print_info "Creando servicios..."

cat > src/services/api.js << 'EOF'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiar a tu IP local para pruebas: http://TU_IP:5000/api
const API_URL = 'http://10.0.2.2:5000/api'; // Para emulador Android

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario');
        }
        return Promise.reject(error);
    }
);

export default api;

// Servicios especíicos
export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
};

export const cobroService = {
    registrar: (data) => api.post('/cobros', data),
    obtenerMios: () => api.get('/cobros/mis-cobros'),
    obtenerPorFecha: (fecha) => api.get(`/cobros/fecha/${fecha}`),
};

export const clienteService = {
    obtenerAsignados: () => api.get('/clientes/asignados'),
    obtenerDetalle: (id) => api.get(`/clientes/${id}`),
    actualizarEstado: (id, estado) => api.put(`/clientes/${id}/estado`, { estado }),
};

export const prestamoService = {
    obtenerPorCliente: (clienteId) => api.get(`/prestamos/cliente/${clienteId}`),
    obtenerDetalle: (id) => api.get(`/prestamos/${id}`),
};
EOF

cat > src/services/printerService.js << 'EOF'
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

export const imprimirRecibo = async (recibo) => {
    try {
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText("================================\n", {});
        await BluetoothEscposPrinter.printText("RECIBO DE PAGO\n", { 
            fonttype: 1, 
            widthtimes: 1, 
            heigthtimes: 1 
        });
        await BluetoothEscposPrinter.printText("================================\n", {});
        
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        await BluetoothEscposPrinter.printText(`Fecha: ${recibo.fecha}\n`, {});
        await BluetoothEscposPrinter.printText(`Hora: ${recibo.hora}\n`, {});
        await BluetoothEscposPrinter.printText("\n", {});
        
        await BluetoothEscposPrinter.printText(`Cliente: ${recibo.cliente}\n`, {});
        await BluetoothEscposPrinter.printText(`Telefono: ${recibo.telefono}\n`, {});
        await BluetoothEscposPrinter.printText("\n", {});
        
        await BluetoothEscposPrinter.printText(`Monto Pagado: RD$ ${recibo.monto.toFixed(2)}\n`, {
            fonttype: 1
        });
        await BluetoothEscposPrinter.printText(`Saldo Pendiente: RD$ ${recibo.saldoPendiente.toFixed(2)}\n`, {});
        
        await BluetoothEscposPrinter.printText("\n--------------------------------\n", {});
        await BluetoothEscposPrinter.printText("Firma Cliente: ______________\n", {});
        await BluetoothEscposPrinter.printText("\n", {});
        
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText("Gracias por su pago\n", {});
        await BluetoothEscposPrinter.printText("\n\n\n", {});
        
        return { success: true };
    } catch (error) {
        console.error('Error al imprimir:', error);
        return { success: false, error: error.message };
    }
};

export const conectarImpresora = async () => {
    try {
        const devices = await BluetoothEscposPrinter.discover();
        return devices;
    } catch (error) {
        console.error('Error al buscar impresoras:', error);
        throw error;
    }
};
EOF

cat > src/services/whatsappService.js << 'EOF'
import { Linking } from 'react-native';

export const enviarReciboWhatsApp = (recibo) => {
    const mensaje = 
        `.. *RECIBO DE PAGO*\n\n` +
        `.. Fecha: ${recibo.fecha}\n` +
        `. Hora: ${recibo.hora}\n\n` +
        `.. Cliente: ${recibo.cliente}\n` +
        `.. Monto Pagado: RD$ ${recibo.monto.toFixed(2)}\n` +
        `.. Saldo Pendiente: RD$ ${recibo.saldoPendiente.toFixed(2)}\n\n` +
        `. Gracias por su pago`;

    const telefono = recibo.telefono.replace(/\D/g, '');
    const url = `whatsapp://send?phone=1${telefono}&text=${encodeURIComponent(mensaje)}`;
    
    Linking.canOpenURL(url)
        .then((supported) => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                throw new Error('WhatsApp no estáinstalado');
            }
        })
        .catch((err) => console.error('Error al abrir WhatsApp:', err));
};
EOF

# ============================================
# CONTEXT Y ESTADO GLOBAL
# ============================================
print_info "Creando contexto de autenticació..."

cat > src/context/AuthContext.js << 'EOF'
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            const usuarioGuardado = await AsyncStorage.getItem('usuario');
            if (usuarioGuardado) {
                setUsuario(JSON.parse(usuarioGuardado));
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        } finally {
            setCargando(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            const { token, usuario: userData } = response.data;
            
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('usuario', JSON.stringify(userData));
            
            setUsuario(userData);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Error de conexió' 
            };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
EOF

# ============================================
# PANTALLAS
# ============================================
print_info "Creando pantallas..."

cat > src/screens/LoginScreen.js << 'EOF'
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setCargando(true);
        const result = await login(email, password);
        setCargando(false);

        if (!result.success) {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Sistema de Cobradores</Text>
                <Text style={styles.subtitle}>Inicia sesió para continuar</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!cargando}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseñ"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!cargando}
                />

                <TouchableOpacity
                    style={[styles.button, cargando && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Iniciar Sesió</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    content: { 
        flex: 1, 
        justifyContent: 'center', 
        padding: 20 
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        textAlign: 'center',
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40
    },
    input: { 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    button: { 
        backgroundColor: '#6366f1', 
        padding: 16, 
        borderRadius: 10, 
        marginTop: 10,
        elevation: 2
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af'
    },
    buttonText: { 
        color: 'white', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: 18 
    },
});
EOF

cat > src/screens/HomeScreen.js << 'EOF'
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { clienteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const { usuario } = useAuth();

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const response = await clienteService.obtenerAsignados();
            setClientes(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los clientes');
            console.error(error);
        } finally {
            setCargando(false);
            setRefrescando(false);
        }
    };

    const onRefresh = () => {
        setRefrescando(true);
        cargarClientes();
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'al dí': return '#10b981';
            case 'mora': return '#ef4444';
            case 'activo': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const renderCliente = ({ item }) => (
        <TouchableOpacity
            style={styles.clienteCard}
            onPress={() => navigation.navigate('ClienteDetalle', { cliente: item })}
        >
            <View style={styles.clienteHeader}>
                <Text style={styles.clienteNombre}>{item.nombre}</Text>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.estadoTexto}>{item.estado}</Text>
                </View>
            </View>
            
            <Text style={styles.clienteInfo}>.. {item.telefono}</Text>
            <Text style={styles.clienteInfo}>.. {item.zona}</Text>
            
            {item.saldoPendiente && (
                <Text style={styles.saldo}>
                    Saldo: RD$ {item.saldoPendiente.toLocaleString()}
                </Text>
            )}
        </TouchableOpacity>
    );

    if (cargando) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Clientes</Text>
                <Text style={styles.headerSubtitle}>
                    Bienvenido, {usuario?.nombre}
                </Text>
            </View>

            <FlatList
                data={clientes}
                renderItem={renderCliente}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.lista}
                refreshControl={
                    <RefreshControl
                        refreshing={refrescando}
                        onRefresh={onRefresh}
                        colors={['#6366f1']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No tienes clientes asignados
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#6366f1',
        padding: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#e0e7ff',
        marginTop: 5,
    },
    lista: { 
        padding: 15 
    },
    clienteCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    clienteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    clienteNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoTexto: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    clienteInfo: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    saldo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
});
EOF

cat > src/screens/ClienteDetalleScreen.js << 'EOF'
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { cobroService } from '../services/api';
import { imprimirRecibo } from '../services/printerService';
import { enviarReciboWhatsApp } from '../services/whatsappService';

export default function ClienteDetalleScreen({ route, navigation }) {
    const { cliente } = route.params;
    const [montoPago, setMontoPago] = useState('');
    const [cargando, setCargando] = useState(false);

    const registrarCobro = async () => {
        if (!montoPago || parseFloat(montoPago) <= 0) {
            Alert.alert('Error', 'Ingresa un monto váido');
            return;
        }

        setCargando(true);
        try {
            const recibo = {
                cliente: cliente.nombre,
                telefono: cliente.telefono,
                monto: parseFloat(montoPago),
                saldoPendiente: cliente.saldoPendiente - parseFloat(montoPago),
                fecha: new Date().toLocaleDateString('es-DO'),
                hora: new Date().toLocaleTimeString('es-DO'),
            };

            // Registrar en el backend
            await cobroService.registrar({
                clienteId: cliente._id,
                monto: parseFloat(montoPago),
            });

            // Mostrar opciones
            Alert.alert(
                'Cobro Registrado',
                '.Quédeseas hacer?',
                [
                    {
                        text: 'Imprimir',
                        onPress: () => imprimirRecibo(recibo),
                    },
                    {
                        text: 'WhatsApp',
                        onPress: () => enviarReciboWhatsApp(recibo),
                    },
                    {
                        text: 'Ambos',
                        onPress: async () => {
                            await imprimirRecibo(recibo);
                            enviarReciboWhatsApp(recibo);
                        },
                    },
                    { text: 'Cancelar', style: 'cancel' },
                ]
            );

            setMontoPago('');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el cobro');
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.nombre}>{cliente.nombre}</Text>
                <Text style={styles.info}>.. {cliente.telefono}</Text>
                <Text style={styles.info}>.. {cliente.direccion}</Text>
                <Text style={styles.info}>.. {cliente.cedula}</Text>
                
                <View style={styles.saldoContainer}>
                    <Text style={styles.saldoLabel}>Saldo Pendiente</Text>
                    <Text style={styles.saldoMonto}>
                        RD$ {cliente.saldoPendiente?.toLocaleString() || '0'}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Registrar Pago</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Monto del pago"
                    value={montoPago}
                    onChangeText={setMontoPago}
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={[styles.button, cargando && styles.buttonDisabled]}
                    onPress={registrarCobro}
                    disabled={cargando}
                >
                    <Text style={styles.buttonText}>
                        {cargando ? 'Procesando...' : 'Registrar Cobro'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    card: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 12,
        elevation: 2,
    },
    nombre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 15,
    },
    info: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 8,
    },
    saldoContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
    },
    saldoLabel: {
        fontSize: 14,
        color: '#059669',
        marginBottom: 5,
    },
    saldoMonto: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#059669',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1f2937',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
EOF

cat > src/screens/HistorialScreen.js << 'EOF'
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { cobroService } from '../services/api';

export default function HistorialScreen() {
    const [cobros, setCobros] = useState([]);
    const [refrescando, setRefrescando] = useState(false);

    useEffect(() => {
        cargarCobros();
    }, []);

    const cargarCobros = async () => {
        try {
            const response = await cobroService.obtenerMios();
            setCobros(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setRefrescando(false);
        }
    };

    const renderCobro = ({ item }) => (
        <View style={styles.cobroCard}>
            <View style={styles.cobroHeader}>
                <Text style={styles.clienteNombre}>{item.cliente?.nombre}</Text>
                <Text style={styles.monto}>RD$ {item.monto.toLocaleString()}</Text>
            </View>
            <Text style={styles.fecha}>
                {new Date(item.fecha).toLocaleDateString('es-DO')} - 
                {new Date(item.fecha).toLocaleTimeString('es-DO')}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={cobros}
                renderItem={renderCobro}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.lista}
                refreshControl={
                    <RefreshControl
                        refreshing={refrescando}
                        onRefresh={() => {
                            setRefrescando(true);
                            cargarCobros();
                        }}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    lista: { 
        padding: 15 
    },
    cobroCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
    cobroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    clienteNombre: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    monto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    fecha: {
        fontSize: 14,
        color: '#6b7280',
    },
});
EOF

cat > src/screens/PerfilScreen.js << 'EOF'
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function PerfilScreen() {
    const { usuario, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesió',
            '.Está seguro que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', onPress: logout },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {usuario?.nombre?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                
                <Text style={styles.nombre}>{usuario?.nombre}</Text>
                <Text style={styles.email}>{usuario?.email}</Text>
                <Text style={styles.rol}>{usuario?.rol}</Text>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>Cerrar Sesió</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    nombre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 10,
    },
    rol: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
EOF

# ============================================
# NAVEGACIÓ
# ============================================
print_info "Configurando navegació..."

cat > src/navigation/AppNavigator.js << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ClienteDetalleScreen from '../screens/ClienteDetalleScreen';
import HistorialScreen from '../screens/HistorialScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Clientes') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Historial') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Clientes" component={HomeScreen} />
            <Tab.Screen name="Historial" component={HistorialScreen} />
            <Tab.Screen name="Perfil" component={PerfilScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!usuario ? (
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen 
                            name="Home" 
                            component={HomeTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen 
                            name="ClienteDetalle" 
                            component={ClienteDetalleScreen}
                            options={{ title: 'Detalle Cliente' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
EOF

# ============================================
# APP.JS PRINCIPAL
# ============================================
print_info "Creando App.js principal..."

cat > App.js << 'EOF'
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
            <AppNavigator />
        </AuthProvider>
    );
}
EOF

# ============================================
# CONFIGURACIÓ DE ANDROID
# ============================================
print_info "Configurando permisos de Android..."

cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="true">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
EOF

# ============================================
# README
# ============================================
cat > README.md << 'EOF'
# App Android - Sistema de Cobradores

Aplicació móil para cobradores del sistema de prétamos.

## .. Instalació

```bash
# Instalar dependencias
npm install

# Instalar pods (iOS)
cd ios && pod install && cd ..

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## .. Funcionalidades

. Login de cobradores
. Lista de clientes asignados
. Registro de cobros
. Impresió de recibos (Bluetooth)
. Enví por WhatsApp
. Historial de cobros
. Geolocalizació
. Modo offline

## .. Configuració

1. Actualiza la URL del API en `src/services/api.js`
2. Configura los permisos en `AndroidManifest.xml`
3. Para impresora témica, conecta ví Bluetooth

## .. Dependencias Principales

- React Native 0.73
- React Navigation 6
- Axios
- AsyncStorage
- React Native Bluetooth ESCPOS Printer

## ... Desarrollo

Para depuració:
```bash
npx react-native log-android
npx react-native log-ios
```

Para generar APK:
```bash
cd android
./gradlew assembleRelease
```
EOF

print_status "App Android creada completamente"

# ============================================
# RESUMEN FINAL
# ============================================
echo ""
echo ".........................................................."
echo ".        . APP ANDROID CREADA EXITOSAMENTE              ."
echo ".........................................................."
echo ""
print_status "Proyecto creado en: $(pwd)"
echo ""
echo ".. Estructura creada:"
echo "   ... .. src/"
echo "   .   ... .. screens/      (5 pantallas)"
echo "   .   ... .. components/"
echo "   .   ... .. navigation/"
echo "   .   ... .. services/     (API, Printer, WhatsApp)"
echo "   .   ... .. context/      (Auth)"
echo "   .   ... .. utils/"
echo "   ... .. android/"
echo "   ... .. App.js"
echo "   ... .. package.json"
echo "   ... .. README.md"
echo ""
echo ".. Próimos pasos:"
echo ""
echo "1..  Instalar dependencias:"
echo "   ${GREEN}cd $APP_NAME && npm install${NC}"
echo ""
echo "2..  Configurar API URL en src/services/api.js"
echo ""
echo "3..  Ejecutar en Android:"
echo "   ${GREEN}npx react-native run-android${NC}"
echo ""
echo "4..  Para iOS (Mac solamente):"
echo "   ${GREEN}cd ios && pod install && cd ..${NC}"
echo "   ${GREEN}npx react-native run-ios${NC}"
echo ""
echo ".. Funcionalidades incluidas:"
echo "   . Login y autenticació"
echo "   . Lista de clientes"
echo "   . Registro de cobros"
echo "   . Impresió Bluetooth"
echo "   . WhatsApp integration"
echo "   . Historial de cobros"
echo "   . Perfil de usuario"
echo ""
print_status ".App lista para desarrollo! .."
EOF

print_status "Script de instalació creado exitosamente"