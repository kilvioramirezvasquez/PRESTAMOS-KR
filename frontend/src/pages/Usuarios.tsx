import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { usuariosAPI } from '../services/api'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Key,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Usuario {
  _id: string
  nombre: string
  email: string
  rol: 'admin' | 'gerente' | 'cobrador'
  telefono?: string
  zona?: string
  activo: boolean
  createdAt: string
}

interface FormUsuario {
  nombre: string
  email: string
  password: string
  rol: 'admin' | 'gerente' | 'cobrador'
  telefono: string
  zona: string
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRol, setSelectedRol] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [formData, setFormData] = useState<FormUsuario>({
    nombre: '',
    email: '',
    password: '',
    rol: 'cobrador',
    telefono: '',
    zona: ''
  })

  useEffect(() => {
    cargarUsuarios()
  }, [currentPage, selectedRol])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedRol && { rol: selectedRol }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const response = await usuariosAPI.obtenerTodos(params)
      if (response.success) {
        setUsuarios(response.data.usuarios)
        setTotalPages(response.data.pages)
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const { password, ...updateData } = formData
        const response = await usuariosAPI.actualizar(editingUser._id, updateData)
        if (response.success) {
          toast.success('Usuario actualizado exitosamente')
        }
      } else {
        // Crear nuevo usuario
        const response = await usuariosAPI.crear(formData)
        if (response.success) {
          toast.success('Usuario creado exitosamente')
        }
      }
      
      setShowForm(false)
      setEditingUser(null)
      resetForm()
      cargarUsuarios()
    } catch (error: any) {
      console.error('Error guardando usuario:', error)
      toast.error(error.response?.data?.message || 'Error al guardar usuario')
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      telefono: usuario.telefono || '',
      zona: usuario.zona || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    if (window.confirm(`¿Estás seguro de que deseas desactivar a ${usuario.nombre}?`)) {
      try {
        const response = await usuariosAPI.eliminar(usuario._id)
        if (response.success) {
          toast.success('Usuario desactivado exitosamente')
          cargarUsuarios()
        }
      } catch (error: any) {
        console.error('Error eliminando usuario:', error)
        toast.error(error.response?.data?.message || 'Error al desactivar usuario')
      }
    }
  }

  const handleChangePassword = async (usuario: Usuario) => {
    const newPassword = window.prompt(`Nueva contraseña para ${usuario.nombre}:`)
    if (newPassword && newPassword.length >= 6) {
      try {
        const response = await usuariosAPI.cambiarPassword(usuario._id, newPassword)
        if (response.success) {
          toast.success('Contraseña actualizada exitosamente')
        }
      } catch (error: any) {
        console.error('Error cambiando contraseña:', error)
        toast.error(error.response?.data?.message || 'Error al cambiar contraseña')
      }
    } else if (newPassword) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'cobrador',
      telefono: '',
      zona: ''
    })
  }

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Badge variant="destructive">Administrador</Badge>
      case 'gerente':
        return <Badge variant="default">Gerente</Badge>
      case 'cobrador':
        return <Badge variant="secondary">Cobrador</Badge>
      default:
        return <Badge variant="outline">{rol}</Badge>
    }
  }

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'gerente':
        return <UserCheck className="h-4 w-4 text-blue-600" />
      case 'cobrador':
        return <Users className="h-4 w-4 text-green-600" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios del sistema</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingUser(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                  onKeyPress={(e) => e.key === 'Enter' && cargarUsuarios()}
                />
              </div>
            </div>
            <div>
              <select
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value)}
                className="input-field"
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="cobrador">Cobrador</option>
              </select>
            </div>
            <button
              onClick={cargarUsuarios}
              className="btn-primary"
            >
              Buscar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Usuario */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </CardTitle>
            <CardDescription>
              {editingUser ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="cobrador">Cobrador</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona
                  </label>
                  <input
                    type="text"
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Total: {usuarios.length} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <div key={usuario._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(usuario.rol)}
                        <div>
                          <h3 className="font-semibold flex items-center space-x-2">
                            <span>{usuario.nombre}</span>
                            {!usuario.activo && <UserX className="h-4 w-4 text-red-600" />}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{usuario.email}</span>
                            </div>
                            {usuario.telefono && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{usuario.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(usuario.rol)}
                        <Badge variant={usuario.activo ? "default" : "secondary"}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {usuario.zona && (
                          <Badge variant="outline">{usuario.zona}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleChangePassword(usuario)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Desactivar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Usuarios