import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import axios from 'axios';

interface LoginPrestasyProps {
  onLogin: (token: string) => void;
}

const LoginPrestasy: React.FC<LoginPrestasyProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    user: '',
    pass: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validación estilo Prestasy original
    if (!credentials.user) {
      setError('El campo Usuario es requerido');
      return;
    }
    
    if (!credentials.pass) {
      setError('El campo Contraseña es requerido');
      return;
    }

    setLoading(true);

    try {
      // Login con la API correcta
      const response = await axios.post('http://159.203.69.59:5000/api/auth/login', {
        email: credentials.user,
        password: credentials.pass
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        onLogin(response.data.token);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error de conexión. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Limpiar error al escribir
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      {/* Background Pattern - Estilo Prestasy */}
      <div className="absolute inset-0 bg-black bg-opacity-20">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Prestasy-KR</h1>
          <p className="text-blue-100 text-lg">Sistema de Gestión de Préstamos</p>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm border-0 shadow-2xl rounded-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600">Digita tus datos de acceso</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Usuario - Exacto como el original */}
              <div className="space-y-2">
                <label htmlFor="user" className="text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="user"
                    type="text"
                    placeholder="Usuario"
                    value={credentials.user}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('user', e.target.value)}
                    className="w-full pl-10 h-12 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo Contraseña - Exacto como el original */}
              <div className="space-y-2">
                <label htmlFor="pass" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={credentials.pass}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pass', e.target.value)}
                    className="w-full pl-10 pr-12 h-12 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón Entrar - Estilo Prestasy */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Entrar
                  </div>
                )}
              </button>
            </form>

            {/* Información de prueba */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm font-medium mb-2">Credenciales de prueba:</p>
              <div className="text-blue-700 text-sm space-y-1">
                <p><strong>Usuario:</strong> admin</p>
                <p><strong>Contraseña:</strong> 741741</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Estilo Prestasy original */}
        <div className="text-center mt-8">
          <p className="text-white text-sm">
            © 2025. <strong>Prestasy-KR</strong> Desarrollado Por{' '}
            <a 
              href="http://softcoder.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white underline"
            >
              Softcoder
            </a>
          </p>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
      <div className="absolute bottom-24 left-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
    </div>
  );
};

export default LoginPrestasy;