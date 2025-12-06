import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config/api'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('promociones')
  const [categorias, setCategorias] = useState([])
  const [promociones, setPromociones] = useState([])
  const [configuracion, setConfiguracion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state para promociones
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [imagen, setImagen] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state para categorías
  const [catNombre, setCatNombre] = useState('')
  const [catDescripcion, setCatDescripcion] = useState('')
  const [catIcono, setCatIcono] = useState('🏷️')
  const [catColor, setCatColor] = useState('blue')
  const [catOrden, setCatOrden] = useState(0)
  const [editingCatId, setEditingCatId] = useState(null)

  // Estado para drag and drop
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggingOver, setDraggingOver] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { 'Authorization': `Bearer ${token}` }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [catRes, promoRes, configRes] = await Promise.all([
        axios.get(`${API_URL}/api/categorias`),
        axios.get(`${API_URL}/api/promociones`),
        axios.get(`${API_URL}/api/configuracion`)
      ])
      setCategorias(catRes.data)
      setPromociones(promoRes.data)
      setConfiguracion(configRes.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // === PROMOCIONES ===
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handlePromoSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) {
      alert('El título es obligatorio')
      return
    }
    if (!editingId && !imagen) {
      alert('La imagen es obligatoria')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('titulo', titulo.trim())
      formData.append('descripcion', descripcion.trim())
      if (categoriaId) formData.append('categoria_id', categoriaId)
      if (imagen) formData.append('imagen', imagen)

      if (editingId) {
        await axios.put(`/api/promociones/${editingId}`, formData, { headers: getAuthHeaders() })
        showSuccess('Promoción actualizada exitosamente')
      } else {
        await axios.post('/api/promociones', formData, { headers: getAuthHeaders() })
        showSuccess('Promoción creada exitosamente')
      }

      setTitulo('')
      setDescripcion('')
      setCategoriaId('')
      setImagen(null)
      setPreviewUrl(null)
      setEditingId(null)
      fetchData()
    } catch (err) {
      console.error('Error:', err)
      if (err.response?.status === 401) {
        alert('Sesión expirada')
        handleLogout()
      } else {
        setError(err.response?.data?.error || 'Error al guardar')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleEditPromo = (promo) => {
    setEditingId(promo.id)
    setTitulo(promo.titulo)
    setDescripcion(promo.descripcion || '')
    setCategoriaId(promo.categoria_id || '')
    setPreviewUrl(promo.imagen_url)
    setActiveTab('promociones')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePromo = async (id) => {
    if (!confirm('¿Eliminar esta promoción?')) return
    try {
      await axios.delete(`/api/promociones/${id}`, { headers: getAuthHeaders() })
      showSuccess('Promoción eliminada')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const handleCancelPromo = () => {
    setEditingId(null)
    setTitulo('')
    setDescripcion('')
    setCategoriaId('')
    setImagen(null)
    setPreviewUrl(null)
  }

  // === CATEGORÍAS ===
  const handleCatSubmit = async (e) => {
    e.preventDefault()
    if (!catNombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    try {
      const data = {
        nombre: catNombre.trim(),
        descripcion: catDescripcion.trim(),
        icono: catIcono,
        color: catColor,
        orden: parseInt(catOrden) || 0
      }

      if (editingCatId) {
        await axios.put(`/api/categorias/${editingCatId}`, data, { headers: getAuthHeaders() })
        showSuccess('Categoría actualizada')
      } else {
        await axios.post('/api/categorias', data, { headers: getAuthHeaders() })
        showSuccess('Categoría creada')
      }

      setCatNombre('')
      setCatDescripcion('')
      setCatIcono('🏷️')
      setCatColor('blue')
      setCatOrden(0)
      setEditingCatId(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleEditCat = (cat) => {
    setEditingCatId(cat.id)
    setCatNombre(cat.nombre)
    setCatDescripcion(cat.descripcion || '')
    setCatIcono(cat.icono)
    setCatColor(cat.color)
    setCatOrden(cat.orden)
    setActiveTab('categorias')
  }

  const handleDeleteCat = async (id) => {
    if (!confirm('¿Eliminar esta categoría? Las promociones asociadas quedarán sin categoría.')) return
    try {
      await axios.delete(`${API_URL}/api/categorias/${id}`, { headers: getAuthHeaders() })
      showSuccess('Categoría eliminada')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar')
    }
  }

  // === CONFIGURACIÓN ===
  const handleConfigSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/api/configuracion`, configuracion, { headers: getAuthHeaders() })
      showSuccess('Configuración actualizada')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleConfigChange = (field, value) => {
    setConfiguracion(prev => ({ ...prev, [field]: value }))
  }

  // === DRAG AND DROP ===
  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggingOver(index)
  }

  const handleDragLeave = () => {
    setDraggingOver(null)
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      setDraggingOver(null)
      return
    }

    try {
      const newPromociones = [...promociones]
      const [draggedPromo] = newPromociones.splice(draggedItem, 1)
      newPromociones.splice(dropIndex, 0, draggedPromo)

      setPromociones(newPromociones)

      const ordenActualizado = newPromociones.map((promo, index) => ({
        id: promo.id,
        orden: index
      }))

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/promociones/reorder`,
        { promociones: ordenActualizado },
        { headers: getAuthHeaders() }
      )

      showSuccess('Orden actualizado exitosamente')
    } catch (err) {
      console.error('Error al reordenar:', err)
      fetchData()
      alert('Error al actualizar el orden')
    } finally {
      setDraggedItem(null)
      setDraggingOver(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggingOver(null)
  }

  // === DRAG AND DROP ===
  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggingOver(index)
  }

  const handleDragLeave = () => {
    setDraggingOver(null)
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      setDraggingOver(null)
      return
    }

    try {
      // Reordenar el array localmente
      const newPromociones = [...promociones]
      const [draggedPromo] = newPromociones.splice(draggedItem, 1)
      newPromociones.splice(dropIndex, 0, draggedPromo)

      // Actualizar el orden en el estado
      setPromociones(newPromociones)

      // Preparar datos para el backend
      const ordenActualizado = newPromociones.map((promo, index) => ({
        id: promo.id,
        orden: index
      }))

      // Enviar al backend
      await axios.put(
        `${API_URL}/api/promociones/reorder`,
        { promociones: ordenActualizado },
        { headers: getAuthHeaders() }
      )

      showSuccess('Orden actualizado exitosamente')
    } catch (err) {
      console.error('Error al reordenar:', err)
      // Recargar datos si hay error
      fetchData()
      alert('Error al actualizar el orden')
    } finally {
      setDraggedItem(null)
      setDraggingOver(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggingOver(null)
  }

  const iconos = ['🎄', '🥤', '🛒', '🥩', '🍞', '🧀', '🍎', '🐟', '🍕', '🎂', '☕', '🍷', '🎁', '💝', '🏷️', '⭐']
  const colores = [
    { value: 'red', label: 'Rojo', class: 'bg-red-500' },
    { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
    { value: 'purple', label: 'Morado', class: 'bg-purple-500' },
    { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">⚙️</span>
                Panel de Administración
              </h1>
              <p className="text-green-100 mt-1">Gestiona promociones y categorías</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('promociones')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition ${
                activeTab === 'promociones'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎯 Promociones
            </button>
            <button
              onClick={() => setActiveTab('categorias')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition ${
                activeTab === 'categorias'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📂 Categorías
            </button>
            <button
              onClick={() => setActiveTab('configuracion')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition ${
                activeTab === 'configuracion'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>

        {/* PROMOCIONES TAB */}
        {activeTab === 'promociones' && (
          <div className="space-y-8">
            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
              </h2>
              <form onSubmit={handlePromoSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      placeholder="Ej: Oferta 2x1 en Gaseosas"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    >
                      <option value="">Sin categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icono} {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="Descripción opcional de la promoción"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Imagen {!editingId && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  {previewUrl && (
                    <div className="mt-4">
                      <img src={previewUrl} alt="Preview" className="max-w-sm rounded-lg shadow-md" />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {uploading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Promoción'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelPromo}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📋 Promociones ({promociones.length})
              </h2>
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Tip:</span> Arrastra y suelta las promociones para cambiar su orden de aparición
                </p>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : promociones.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No hay promociones</p>
              ) : (
                <div className="grid gap-4">
                  {promociones.map((promo, index) => (
                    <div 
                      key={promo.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col sm:flex-row gap-4 p-4 border-2 rounded-lg transition-all cursor-move ${
                        draggedItem === index 
                          ? 'opacity-50 border-green-400' 
                          : draggingOver === index
                          ? 'border-green-500 bg-green-50 scale-105'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {/* Icono de arrastre */}
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <div className="text-gray-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 min-w-[30px]">
                          #{index + 1}
                        </span>
                      </div>

                      <img src={promo.imagen_url} alt={promo.titulo} className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{promo.titulo}</h3>
                        {promo.descripcion && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{promo.descripcion}</p>}
                        {promo.categoria_nombre && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {promo.categoria_icono} {promo.categoria_nombre}
                          </span>
                        )}
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <button onClick={() => handleEditPromo(promo)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                          Editar
                        </button>
                        <button onClick={() => handleDeletePromo(promo.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORÍAS TAB */}
        {activeTab === 'categorias' && (
          <div className="space-y-8">
            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingCatId ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
              </h2>
              <form onSubmit={handleCatSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={catNombre}
                      onChange={(e) => setCatNombre(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Ej: Promociones Navideñas"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orden</label>
                    <input
                      type="number"
                      value={catOrden}
                      onChange={(e) => setCatOrden(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={catDescripcion}
                    onChange={(e) => setCatDescripcion(e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Descripción opcional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icono</label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconos.map(ico => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setCatIcono(ico)}
                        className={`text-3xl p-3 rounded-lg border-2 hover:scale-110 transition ${
                          catIcono === ico ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {colores.map(col => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setCatColor(col.value)}
                        className={`p-4 rounded-lg ${col.class} text-white font-semibold hover:scale-105 transition ${
                          catColor === col.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {editingCatId ? 'Actualizar' : 'Crear Categoría'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null)
                        setCatNombre('')
                        setCatDescripcion('')
                        setCatIcono('🏷️')
                        setCatColor('blue')
                        setCatOrden(0)
                      }}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 Categorías ({categorias.length})</h2>
              {categorias.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No hay categorías</p>
              ) : (
                <div className="grid gap-4">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition">
                      <span className="text-4xl">{cat.icono}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{cat.nombre}</h3>
                        {cat.descripcion && <p className="text-sm text-gray-600">{cat.descripcion}</p>}
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 bg-${cat.color}-100 text-${cat.color}-700 rounded text-xs font-semibold`}>
                            {cat.color}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                            Orden: {cat.orden}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditCat(cat)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteCat(cat.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONFIGURACIÓN TAB */}
        {activeTab === 'configuracion' && configuracion && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Configuración del Negocio</h2>
            
            <form onSubmit={handleConfigSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={configuracion.nombre_negocio || ''}
                  onChange={(e) => handleConfigChange('nombre_negocio', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Ej: Minimercado Don Juan"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ubicación (Texto)
                  </label>
                  <input
                    type="text"
                    value={configuracion.ubicacion || ''}
                    onChange={(e) => handleConfigChange('ubicacion', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="Ej: Mendoza, Argentina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={configuracion.telefono || ''}
                    onChange={(e) => handleConfigChange('telefono', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="Ej: +54 261 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitud (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={configuracion.latitud || ''}
                    onChange={(e) => handleConfigChange('latitud', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="Ej: -32.889458"
                  />
                  <p className="text-xs text-gray-500 mt-1">Busca en Google Maps y copia la latitud</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitud (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={configuracion.longitud || ''}
                    onChange={(e) => handleConfigChange('longitud', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="Ej: -68.845839"
                  />
                  <p className="text-xs text-gray-500 mt-1">Busca en Google Maps y copia la longitud</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp (Formato internacional sin +)
                </label>
                <input
                  type="text"
                  value={configuracion.telefono_whatsapp || ''}
                  onChange={(e) => handleConfigChange('telefono_whatsapp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Ej: 5492611234567"
                />
                <p className="text-xs text-gray-500 mt-1">Código de país + código de área + número (sin espacios ni símbolos)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje Predeterminado de WhatsApp
                </label>
                <input
                  type="text"
                  value={configuracion.mensaje_whatsapp || ''}
                  onChange={(e) => handleConfigChange('mensaje_whatsapp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Ej: Hola! Quisiera consultar sobre una promoción"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horarios de Atención
                </label>
                <textarea
                  value={configuracion.horarios || ''}
                  onChange={(e) => handleConfigChange('horarios', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Ej:&#10;Lunes a Viernes: 8:00 - 20:00&#10;Sábados: 9:00 - 13:00&#10;Domingos: Cerrado"
                />
                <p className="text-xs text-gray-500 mt-1">Cada línea en un renglón diferente</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
