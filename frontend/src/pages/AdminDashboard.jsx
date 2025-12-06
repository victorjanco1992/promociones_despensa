import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config/api'

const AdminDashboard = () => {
  [cite_start]const [activeTab, setActiveTab] = useState('promociones') [cite: 1]
  [cite_start]const [categorias, setCategorias] = useState([]) [cite: 1]
  [cite_start]const [promociones, setPromociones] = useState([]) [cite: 1]
  [cite_start]const [configuracion, setConfiguracion] = useState(null) [cite: 1]
  [cite_start]const [loading, setLoading] = useState(true) [cite: 1]
  [cite_start]const [error, setError] = useState(null) [cite: 1]
  [cite_start]const [successMessage, setSuccessMessage] = useState('') [cite: 1]
  
  // Form state para promociones
  [cite_start]const [titulo, setTitulo] = useState('') [cite: 1]
  [cite_start]const [descripcion, setDescripcion] = useState('') [cite: 1]
  [cite_start]const [categoriaId, setCategoriaId] = useState('') [cite: 1]
  [cite_start]const [imagen, setImagen] = useState(null) [cite: 1]
  [cite_start]const [previewUrl, setPreviewUrl] = useState(null) [cite: 1, 2]
  [cite_start]const [uploading, setUploading] = useState(false) [cite: 2]
  [cite_start]const [editingId, setEditingId] = useState(null) [cite: 2]

  // Form state para categorías
  [cite_start]const [catNombre, setCatNombre] = useState('') [cite: 2]
  [cite_start]const [catDescripcion, setCatDescripcion] = useState('') [cite: 2]
  [cite_start]const [catIcono, setCatIcono] = useState('🏷️') [cite: 2]
  [cite_start]const [catColor, setCatColor] = useState('blue') [cite: 2]
  [cite_start]const [catOrden, setCatOrden] = useState(0) [cite: 2]
  [cite_start]const [editingCatId, setEditingCatId] = useState(null) [cite: 2]

  // Estado para drag and drop
  [cite_start]const [draggedItem, setDraggedItem] = useState(null) [cite: 2]
  [cite_start]const [draggingOver, setDraggingOver] = useState(null) [cite: 2]

  [cite_start]const navigate = useNavigate() [cite: 2]

  useEffect(() => {
    [cite_start]fetchData() [cite: 2]
  }, [])

  const getAuthHeaders = () => {
    [cite_start]const token = localStorage.getItem('token') [cite: 3]
    [cite_start]return { 'Authorization': `Bearer ${token}` } [cite: 3]
  }

  const handleLogout = () => {
    [cite_start]localStorage.removeItem('token') [cite: 3]
    [cite_start]navigate('/login') [cite: 3]
  }

  const fetchData = async () => {
    try {
      [cite_start]setLoading(true) [cite: 3]
      const [catRes, promoRes, configRes] = await Promise.all([
        [cite_start]axios.get(`${API_URL}/api/categorias`), [cite: 3]
        [cite_start]axios.get(`${API_URL}/api/promociones`), [cite: 3]
        [cite_start]axios.get(`${API_URL}/api/configuracion`) [cite: 3]
      ])
      
      [cite_start]setCategorias(catRes.data) [cite: 4]
      [cite_start]setPromociones(promoRes.data) [cite: 4]
      [cite_start]setConfiguracion(configRes.data) [cite: 4]
      [cite_start]setError(null) [cite: 4]
    } catch (err) {
      [cite_start]console.error('Error al cargar datos:', err) [cite: 4]
      [cite_start]setError('Error al cargar los datos') [cite: 4]
    } finally {
      [cite_start]setLoading(false) [cite: 4]
    }
  }

  const showSuccess = (message) => {
    [cite_start]setSuccessMessage(message) [cite: 4]
    [cite_start]setTimeout(() => setSuccessMessage(''), 3000) [cite: 4]
  }

  // === PROMOCIONES ===
  const handleImageChange = (e) => {
    [cite_start]const file = e.target.files[0] [cite: 5]
    if (file) {
      [cite_start]setImagen(file) [cite: 5]
      [cite_start]setPreviewUrl(URL.createObjectURL(file)) [cite: 5]
    }
  }

  const handlePromoSubmit = async (e) => {
    [cite_start]e.preventDefault() [cite: 5]
    if (!titulo.trim()) {
      [cite_start]alert('El título es obligatorio') [cite: 5]
      return
    }
    if (!editingId && !imagen) {
      [cite_start]alert('La imagen es obligatoria') [cite: 5]
      return
    }

    try {
      [cite_start]setUploading(true) [cite: 6]
      [cite_start]const formData = new FormData() [cite: 6]
      [cite_start]formData.append('titulo', titulo.trim()) [cite: 6]
      [cite_start]formData.append('descripcion', descripcion.trim()) [cite: 6]
      [cite_start]if (categoriaId) formData.append('categoria_id', categoriaId) [cite: 6]
      [cite_start]if (imagen) formData.append('imagen', imagen) [cite: 6]

      if (editingId) {
        [cite_start]await axios.put(`/api/promociones/${editingId}`, formData, { headers: getAuthHeaders() }) [cite: 6]
        [cite_start]showSuccess('Promoción actualizada exitosamente') [cite: 6]
      } else {
        [cite_start]await axios.post('/api/promociones', formData, { headers: getAuthHeaders() }) [cite: 6]
        [cite_start]showSuccess('Promoción creada exitosamente') [cite: 7]
      }

      [cite_start]setTitulo('') [cite: 7]
      [cite_start]setDescripcion('') [cite: 7]
      [cite_start]setCategoriaId('') [cite: 7]
      [cite_start]setImagen(null) [cite: 7]
      [cite_start]setPreviewUrl(null) [cite: 7]
      [cite_start]setEditingId(null) [cite: 7]
      [cite_start]fetchData() [cite: 7]
    } catch (err) {
      [cite_start]console.error('Error:', err) [cite: 7]
      if (err.response?.status === 401) {
        [cite_start]alert('Sesión expirada') [cite: 8]
        [cite_start]handleLogout() [cite: 8]
      } else {
        [cite_start]setError(err.response?.data?.error || 'Error al guardar') [cite: 8, 9]
      }
    } finally {
      [cite_start]setUploading(false) [cite: 9]
    }
  }

  const handleEditPromo = (promo) => {
    [cite_start]setEditingId(promo.id) [cite: 9]
    [cite_start]setTitulo(promo.titulo) [cite: 9]
    [cite_start]setDescripcion(promo.descripcion || '') [cite: 9]
    [cite_start]setCategoriaId(promo.categoria_id || '') [cite: 9]
    [cite_start]setPreviewUrl(promo.imagen_url) [cite: 9]
    [cite_start]setActiveTab('promociones') [cite: 9]
    [cite_start]window.scrollTo({ top: 0, behavior: 'smooth' }) [cite: 9]
  }

  const handleDeletePromo = async (id) => {
    [cite_start]if (!confirm('¿Eliminar esta promoción?')) return [cite: 9]
    try {
      [cite_start]await axios.delete(`/api/promociones/${id}`, { headers: getAuthHeaders() }) [cite: 10]
      [cite_start]showSuccess('Promoción eliminada') [cite: 10]
      [cite_start]fetchData() [cite: 10]
    } catch (err) {
      [cite_start]alert(err.response?.data?.error || 'Error al eliminar') [cite: 10]
    }
  }

  const handleCancelPromo = () => {
    [cite_start]setEditingId(null) [cite: 10]
    [cite_start]setTitulo('') [cite: 10]
    [cite_start]setDescripcion('') [cite: 10]
    [cite_start]setCategoriaId('') [cite: 10]
    [cite_start]setImagen(null) [cite: 10]
    [cite_start]setPreviewUrl(null) [cite: 10]
  }

  // === CATEGORÍAS ===
  const handleCatSubmit = async (e) => {
    [cite_start]e.preventDefault() [cite: 10]
    if (!catNombre.trim()) {
      [cite_start]alert('El nombre es obligatorio') [cite: 11]
      return
    }

    try {
      const data = {
        [cite_start]nombre: catNombre.trim(), [cite: 11]
        [cite_start]descripcion: catDescripcion.trim(), [cite: 11]
        [cite_start]icono: catIcono, [cite: 11]
        [cite_start]color: catColor, [cite: 11]
        orden: parseInt(catOrden) || [cite_start]0 [cite: 11, 12]
      }

      if (editingCatId) {
        [cite_start]await axios.put(`/api/categorias/${editingCatId}`, data, { headers: getAuthHeaders() }) [cite: 12]
        [cite_start]showSuccess('Categoría actualizada') [cite: 12]
      } else {
        [cite_start]await axios.post('/api/categorias', data, { headers: getAuthHeaders() }) [cite: 12]
        [cite_start]showSuccess('Categoría creada') [cite: 12]
      }

      [cite_start]setCatNombre('') [cite: 12]
      [cite_start]setCatDescripcion('') [cite: 12]
      [cite_start]setCatIcono('🏷️') [cite: 13]
      [cite_start]setCatColor('blue') [cite: 13]
      [cite_start]setCatOrden(0) [cite: 13]
      [cite_start]setEditingCatId(null) [cite: 13]
      [cite_start]fetchData() [cite: 13]
    } catch (err) {
      [cite_start]alert(err.response?.data?.error || 'Error al guardar') [cite: 13]
    }
  }

  const handleEditCat = (cat) => {
    [cite_start]setEditingCatId(cat.id) [cite: 13]
    [cite_start]setCatNombre(cat.nombre) [cite: 13]
    [cite_start]setCatDescripcion(cat.descripcion || '') [cite: 13]
    [cite_start]setCatIcono(cat.icono) [cite: 13]
    [cite_start]setCatColor(cat.color) [cite: 13]
    [cite_start]setCatOrden(cat.orden) [cite: 13]
    [cite_start]setActiveTab('categorias') [cite: 13]
  }

  const handleDeleteCat = async (id) => {
    [cite_start]if (!confirm('¿Eliminar esta categoría? Las promociones asociadas quedarán sin categoría.')) return [cite: 14]
    try {
      [cite_start]await axios.delete(`${API_URL}/api/categorias/${id}`, { headers: getAuthHeaders() }) [cite: 14]
      [cite_start]showSuccess('Categoría eliminada') [cite: 14]
      [cite_start]fetchData() [cite: 14]
    } catch (err) {
      [cite_start]alert(err.response?.data?.error || 'Error al eliminar') [cite: 14, 15]
    }
  }

  // === CONFIGURACIÓN ===
  const handleConfigSubmit = async (e) => {
    [cite_start]e.preventDefault() [cite: 15]
    try {
      [cite_start]await axios.put(`${API_URL}/api/configuracion`, configuracion, { headers: getAuthHeaders() }) [cite: 15]
      [cite_start]showSuccess('Configuración actualizada') [cite: 15]
      [cite_start]fetchData() [cite: 15]
    } catch (err) {
      [cite_start]alert(err.response?.data?.error || 'Error al guardar') [cite: 15]
    }
  }

  const handleConfigChange = (field, value) => {
    [cite_start]setConfiguracion(prev => ({ ...prev, [field]: value })) [cite: 15]
  }

  
  [cite_start]// === DRAG AND DROP === [cite: 16]
  [cite_start]const handleDragStart = (e, index) => { [cite: 16]
    [cite_start]setDraggedItem(index) [cite: 16]
    [cite_start]e.dataTransfer.effectAllowed = 'move' [cite: 16]
  }

  [cite_start]const handleDragOver = (e, index) => { [cite: 16]
    [cite_start]e.preventDefault() [cite: 16]
    [cite_start]e.dataTransfer.dropEffect = 'move' [cite: 16]
    [cite_start]setDraggingOver(index) [cite: 16]
  }

  [cite_start]const handleDragLeave = () => { [cite: 16]
    [cite_start]setDraggingOver(null) [cite: 16]
  }

  [cite_start]const handleDrop = async (e, dropIndex) => { [cite: 16]
    [cite_start]e.preventDefault() [cite: 16]
    
    [cite_start]if (draggedItem === null || draggedItem === dropIndex) { [cite: 16]
      [cite_start]setDraggedItem(null) [cite: 17]
      [cite_start]setDraggingOver(null) [cite: 17]
      return
    }

    try {
      [cite_start]const newPromociones = [...promociones] [cite: 17]
      [cite_start]const [draggedPromo] = newPromociones.splice(draggedItem, 1) [cite: 17]
      [cite_start]newPromociones.splice(dropIndex, 0, draggedPromo) [cite: 17]

      [cite_start]setPromociones(newPromociones) [cite: 17]

      [cite_start]const ordenActualizado = newPromociones.map((promo, index) => ({ [cite: 17]
        [cite_start]id: promo.id, [cite: 17]
        [cite_start]orden: index [cite: 17]
      }))

      await axios.put(
        [cite_start]`${import.meta.env.VITE_API_URL}/api/promociones/reorder`, [cite: 18]
        [cite_start]{ promociones: ordenActualizado }, [cite: 18]
        [cite_start]{ headers: getAuthHeaders() } [cite: 18]
      )

      [cite_start]showSuccess('Orden actualizado exitosamente') [cite: 18]
    } catch (err) {
      [cite_start]console.error('Error al reordenar:', err) [cite: 18]
      [cite_start]fetchData() [cite: 18]
      [cite_start]alert('Error al actualizar el orden') [cite: 18]
    } finally {
      [cite_start]setDraggedItem(null) [cite: 18]
      [cite_start]setDraggingOver(null) [cite: 18]
    }
  }

  [cite_start]const handleDragEnd = () => { [cite: 19]
    [cite_start]setDraggedItem(null) [cite: 19]
    [cite_start]setDraggingOver(null) [cite: 19]
  }

  // ELIMINADO: Segundo bloque de funciones de Drag and Drop (handleDragStart, handleDragOver, etc.)


  [cite_start]const iconos = ['🎄', '🥤', '🛒', '🥩', '🍞', '🧀', '🍎', '🐟', '🍕', '🎂', '☕', '🍷', '🎁', '💝', '🏷️', '⭐'] [cite: 22, 23]
  [cite_start]const colores = [ [cite: 23]
    [cite_start]{ value: 'red', label: 'Rojo', class: 'bg-red-500' }, [cite: 23]
    [cite_start]{ value: 'blue', label: 'Azul', class: 'bg-blue-500' }, [cite: 23]
    [cite_start]{ value: 'green', label: 'Verde', class: 'bg-green-500' }, [cite: 23]
    [cite_start]{ value: 'orange', label: 'Naranja', class: 'bg-orange-500' }, [cite: 23]
    [cite_start]{ value: 'purple', label: 'Morado', class: 'bg-purple-500' }, [cite: 23]
    [cite_start]{ value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' } [cite: 23]
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      [cite_start]<header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-xl"> [cite: 23, 24]
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">⚙️</span>
                Panel de Administración
                
                [cite_start]</h1> [cite: 24, 25]
              [cite_start]<p className="text-green-100 mt-1">Gestiona promociones y categorías</p> [cite: 25]
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg"
              > [cite_start][cite: 25, 26]
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
            
            [cite_start]<div className="flex items-center"> [cite: 27]
              [cite_start]<span className="text-2xl mr-3">✅</span> [cite: 27]
              [cite_start]<span className="font-medium">{successMessage}</span> [cite: 27]
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
            [cite_start]{error} [cite: 28]
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('promociones')}
              [cite_start]className={`flex-1 py-4 px-6 font-semibold text-lg transition ${ [cite: 29]
                activeTab === 'promociones'
                  ? [cite_start]'bg-green-600 text-white' [cite: 30]
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎯 Promociones
            </button>
            <button
              [cite_start]onClick={() => setActiveTab('categorias')} [cite: 31]
              className={`flex-1 py-4 px-6 font-semibold text-lg transition ${
                activeTab === 'categorias'
                  ? [cite_start]'bg-green-600 text-white' [cite: 32]
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📂 Categorías
            </button>
            <button
              [cite_start]onClick={() => setActiveTab('configuracion')} [cite: 33]
              className={`flex-1 py-4 px-6 font-semibold text-lg transition ${
                activeTab === 'configuracion'
                  ? [cite_start]'bg-green-600 text-white' [cite: 34]
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>

        
        [cite_start]{/* PROMOCIONES TAB */} [cite: 35]
        {activeTab === 'promociones' && (
          <div className="space-y-8">
            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
                
                [cite_start]</h2> [cite: 35, 36]
              <form onSubmit={handlePromoSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      
                      [cite_start]Título * [cite: 37]
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      [cite_start]onChange={(e) => setTitulo(e.target.value)} [cite: 38]
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      placeholder="Ej: Oferta 2x1 en Gaseosas"
                      [cite_start]required [cite: 39]
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      [cite_start]Categoría [cite: 40]
                    </label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 41]
                    >
                      [cite_start]<option value="">Sin categoría</option> [cite: 41]
                      {categorias.map(cat => (
                        [cite_start]<option key={cat.id} value={cat.id}> [cite: 42]
                          [cite_start]{cat.icono} {cat.nombre} [cite: 42]
                        </option>
                      ))}
                      [cite_start]</select> [cite: 43]
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Descripción [cite: 44]
                  </label>
                  <textarea
                    value={descripcion}
                    [cite_start]onChange={(e) => setDescripcion(e.target.value)} [cite: 44]
                    rows="3"
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 45]
                    [cite_start]placeholder="Descripción opcional de la promoción" [cite: 45]
                  />
                </div>

                [cite_start]<div> [cite: 46]
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Imagen {!editingId && '*'} [cite: 46]
                  </label>
                  <input
                    [cite_start]type="file" [cite: 47]
                    [cite_start]accept="image/*" [cite: 47]
                    [cite_start]onChange={handleImageChange} [cite: 47]
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" [cite: 47]
                  />
                  [cite_start]{previewUrl && ( [cite: 48]
                    [cite_start]<div className="mt-4"> [cite: 48]
                      [cite_start]<img src={previewUrl} alt="Preview" className="max-w-sm rounded-lg shadow-md" /> [cite: 48]
                    </div>
                  )}
                [cite_start]</div> [cite: 49]

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    [cite_start]className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition transform hover:scale-105 active:scale-95 shadow-lg" [cite: 50]
                  >
                    {uploading ? 'Guardando...' : editingId ? [cite_start]'Actualizar' : 'Crear Promoción'} [cite: 51]
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      [cite_start]onClick={handleCancelPromo} [cite: 52]
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                    >
                      [cite_start]Cancelar [cite: 53]
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              [cite_start]<h2 className="text-2xl font-bold text-gray-800 mb-4"> [cite: 54]
                [cite_start]📋 Promociones ({promociones.length}) [cite: 54]
              </h2>
              [cite_start]<div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4"> [cite: 54]
                [cite_start]<p className="text-sm text-blue-800 flex items-center gap-2"> [cite: 55]
                  [cite_start]<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> [cite: 55]
                    [cite_start]<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> [cite: 55]
                  </svg>
                  [cite_start]<span className="font-semibold">Tip:</span> Arrastra y suelta las promociones para cambiar su orden de aparición [cite: 56]
                  </p>
              </div>
              {loading ? [cite_start]( [cite: 56, 57]
                [cite_start]<div className="flex justify-center py-8"> [cite: 57]
                  [cite_start]<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div> [cite: 57]
                </div>
              ) : promociones.length === 0 ? [cite_start]( [cite: 57, 58]
                [cite_start]<p className="text-gray-600 text-center py-8">No hay promociones</p> [cite: 58]
              ) : (
                <div className="grid gap-4">
                  {promociones.map((promo, index) => (
                    <div 
                      [cite_start]key={promo.id} [cite: 59]
                      [cite_start]draggable [cite: 59]
                      [cite_start]onDragStart={(e) => handleDragStart(e, index)} [cite: 59]
                      [cite_start]onDragOver={(e) => handleDragOver(e, index)} [cite: 59]
                      [cite_start]onDragLeave={handleDragLeave} [cite: 60]
                      [cite_start]onDrop={(e) => handleDrop(e, index)} [cite: 60]
                      [cite_start]onDragEnd={handleDragEnd} [cite: 60]
                      [cite_start]className={`flex flex-col sm:flex-row gap-4 p-4 border-2 rounded-lg transition-all cursor-move ${ [cite: 60]
                        draggedItem === index 
                          ? 'opacity-50 border-green-400' 
                          : draggingOver === index
                          ? [cite_start]'border-green-500 bg-green-50 scale-105' [cite: 62]
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      [cite_start]{/* Icono de arrastre */} [cite: 63]
                      [cite_start]<div className="flex items-center justify-center sm:justify-start gap-2"> [cite: 63]
                        [cite_start]<div className="text-gray-400"> [cite: 63]
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            
                            [cite_start]<path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/> [cite: 64]
                          </svg>
                        </div>
                        [cite_start]<span className="text-sm font-semibold text-gray-500 min-w-[30px]"> [cite: 65]
                          [cite_start]#{index + 1} [cite: 65]
                        </span>
                      </div>

                      [cite_start]<img src={promo.imagen_url} alt={promo.titulo} className="w-full sm:w-32 h-32 object-cover rounded-lg" /> [cite: 66]
                      <div className="flex-1">
                        [cite_start]<h3 className="text-lg font-bold text-gray-800">{promo.titulo}</h3> [cite: 66]
                        [cite_start]{promo.descripcion && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{promo.descripcion}</p>} [cite: 66]
                        [cite_start]{promo.categoria_nombre && ( [cite: 67]
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            [cite_start]{promo.categoria_icono} {promo.categoria_nombre} [cite: 68]
                            </span>
                        )}
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        [cite_start]<button onClick={() => handleEditPromo(promo)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"> [cite: 69]
                          [cite_start]Editar [cite: 69]
                        </button>
                        <button onClick={() => handleDeletePromo(promo.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">
                          [cite_start]Eliminar [cite: 70]
                        </button>
                      </div>
                    </div>
                    [cite_start]))} [cite: 71]
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORÍAS TAB */}
        {activeTab === 'categorias' && (
          
          [cite_start]<div className="space-y-8"> [cite: 72]
            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingCatId ? [cite_start]'✏️ Editar Categoría' : '➕ Nueva Categoría'} [cite: 73]
              </h2>
              <form onSubmit={handleCatSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label> [cite: 73]
                    <input
                      type="text"
                      value={catNombre}
                      onChange={(e) => setCatNombre(e.target.value)}
                      [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" [cite: 75]
                      placeholder="Ej: Promociones Navideñas"
                      [cite_start]required [cite: 75]
                    />
                    [cite_start]</div> [cite: 76]
                  <div>
                    [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-2">Orden</label> [cite: 76]
                    <input
                      type="number"
                      [cite_start]value={catOrden} [cite: 77]
                      [cite_start]onChange={(e) => setCatOrden(e.target.value)} [cite: 77]
                      [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" [cite: 77]
                    />
                    [cite_start]</div> [cite: 78]
                </div>

                <div>
                  [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label> [cite: 78]
                  <textarea
                    value={catDescripcion}
                    [cite_start]onChange={(e) => setCatDescripcion(e.target.value)} [cite: 79]
                    rows="2"
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" [cite: 79]
                    placeholder="Descripción opcional"
                    [cite_start]/> [cite: 80]
                </div>

                <div>
                  [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-2">Icono</label> [cite: 80]
                  <div className="grid grid-cols-8 gap-2">
                    [cite_start]{iconos.map(ico => ( [cite: 81]
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setCatIcono(ico)}
                        [cite_start]className={`text-3xl p-3 rounded-lg border-2 hover:scale-110 transition ${ [cite: 82]
                          catIcono === ico ? [cite_start]'border-indigo-600 bg-indigo-50'[cite: 83]: 'border-gray-300'
                        }`}
                      >
                        [cite_start]{ico} [cite: 83]
                      </button>
                      [cite_start]))} [cite: 84]
                  </div>
                </div>

                <div>
                  [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-2">Color</label> [cite: 84]
                  [cite_start]<div className="grid grid-cols-3 sm:grid-cols-6 gap-3"> [cite: 85]
                    [cite_start]{colores.map(col => ( [cite: 85]
                      <button
                        key={col.value}
                        [cite_start]type="button" [cite: 86]
                        [cite_start]onClick={() => setCatColor(col.value)} [cite: 86]
                        className={`p-4 rounded-lg ${col.class} text-white font-semibold hover:scale-105 transition ${
                          catColor === col.value ? [cite_start]'ring-4 ring-offset-2 ring-gray-400' : '' [cite: 87]
                        }`}
                      >
                        [cite_start]{col.label} [cite: 87]
                      </button>
                      [cite_start]))} [cite: 88]
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    [cite_start]className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 active:scale-95 shadow-lg" [cite: 89]
                  >
                    {editingCatId ? [cite_start]'Actualizar' : 'Crear Categoría'} [cite: 90]
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      [cite_start]onClick={() => { [cite: 91]
                        [cite_start]setEditingCatId(null) [cite: 91]
                        [cite_start]setCatNombre('') [cite: 91]
                        [cite_start]setCatDescripcion('') [cite: 92]
                        [cite_start]setCatIcono('🏷️') [cite: 92]
                        [cite_start]setCatColor('blue') [cite: 92]
                        [cite_start]setCatOrden(0) [cite: 92]
                      }}
                      [cite_start]className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold" [cite: 93]
                    >
                      [cite_start]Cancelar [cite: 93]
                    </button>
                  )}
                </div>
                [cite_start]</form> [cite: 94]
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              [cite_start]<h2 className="text-2xl font-bold text-gray-800 mb-6">📂 Categorías ({categorias.length})</h2> [cite: 94]
              {categorias.length === 0 ? [cite_start]( [cite: 95]
                [cite_start]<p className="text-gray-600 text-center py-8">No hay categorías</p> [cite: 95]
              ) : (
                <div className="grid gap-4">
                  {categorias.map((cat) => (
                    [cite_start]<div key={cat.id} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition"> [cite: 96]
                      [cite_start]<span className="text-4xl">{cat.icono}</span> [cite: 96]
                      <div className="flex-1">
                        [cite_start]<h3 className="text-lg font-bold text-gray-800">{cat.nombre}</h3> [cite: 96]
                        
                        [cite_start]{cat.descripcion && <p className="text-sm text-gray-600">{cat.descripcion}</p>} [cite: 97]
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 bg-${cat.color}-100 text-${cat.color}-700 rounded text-xs font-semibold`}>
                            {cat.color}
                            [cite_start]</span> [cite: 98]
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                            Orden: {cat.orden}
                            
                            [cite_start]</span> [cite: 99]
                        </div>
                      </div>
                      <div className="flex gap-2">
                        
                        [cite_start]<button onClick={() => handleEditCat(cat)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"> [cite: 100]
                          [cite_start]Editar [cite: 100]
                        </button>
                        [cite_start]<button onClick={() => handleDeleteCat(cat.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"> [cite: 101]
                          [cite_start]Eliminar [cite: 101]
                        </button>
                      </div>
                    </div>
                    [cite_start]))} [cite: 102]
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONFIGURACIÓN TAB */}
        {activeTab === 'configuracion' && configuracion && (
          
          [cite_start]<div className="bg-white rounded-xl shadow-lg p-6"> [cite: 103]
            [cite_start]<h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Configuración del Negocio</h2> [cite: 103]
            
            [cite_start]<form onSubmit={handleConfigSubmit} className="space-y-6"> [cite: 103]
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  
                  [cite_start]Nombre del Negocio [cite: 104]
                </label>
                <input
                  type="text"
                  value={configuracion.nombre_negocio || [cite_start]''} [cite: 105]
                  [cite_start]onChange={(e) => handleConfigChange('nombre_negocio', e.target.value)} [cite: 105]
                  [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 105]
                  [cite_start]placeholder="Ej: Minimercado Don Juan" [cite: 105]
                />
              </div>

              
              [cite_start]<div className="grid md:grid-cols-2 gap-5"> [cite: 106]
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Ubicación (Texto) [cite: 106]
                  </label>
                  
                  <input
                    type="text"
                    value={configuracion.ubicacion || [cite_start]''} [cite: 107, 108]
                    [cite_start]onChange={(e) => handleConfigChange('ubicacion', e.target.value)} [cite: 108]
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 108]
                    [cite_start]placeholder="Ej: Mendoza, Argentina" [cite: 108]
                  />
                  
                  [cite_start]</div> [cite: 109]

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Teléfono [cite: 109]
                  </label>
                  
                  <input
                    type="tel"
                    value={configuracion.telefono || [cite_start]''} [cite: 110, 111]
                    [cite_start]onChange={(e) => handleConfigChange('telefono', e.target.value)} [cite: 111]
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 111]
                    [cite_start]placeholder="Ej: +54 261 123-4567" [cite: 111]
                  />
                  
                  [cite_start]</div> [cite: 112]
              </div>

              [cite_start]<div className="grid md:grid-cols-2 gap-5"> [cite: 112]
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Latitud (GPS) [cite: 113]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={configuracion.latitud || [cite_start]''} [cite: 114]
                    [cite_start]onChange={(e) => handleConfigChange('latitud', e.target.value)} [cite: 114]
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 114]
                    [cite_start]placeholder="Ej: -32.889458" [cite: 114]
                  />
                  
                  [cite_start]<p className="text-xs text-gray-500 mt-1">Busca en Google Maps y copia la latitud</p> [cite: 115]
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    [cite_start]Longitud (GPS) [cite: 116]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={configuracion.longitud || [cite_start]''} [cite: 117]
                    [cite_start]onChange={(e) => handleConfigChange('longitud', e.target.value)} [cite: 117]
                    [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 117]
                    [cite_start]placeholder="Ej: -68.845839" [cite: 117]
                  />
                  
                  [cite_start]<p className="text-xs text-gray-500 mt-1">Busca en Google Maps y copia la longitud</p> [cite: 118]
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  
                  [cite_start]WhatsApp (Formato internacional sin +) [cite: 119]
                </label>
                <input
                  type="text"
                  value={configuracion.telefono_whatsapp || [cite_start]''} [cite: 120]
                  [cite_start]onChange={(e) => handleConfigChange('telefono_whatsapp', e.target.value)} [cite: 120]
                  [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 120]
                  [cite_start]placeholder="Ej: 5492611234567" [cite: 120]
                />
                [cite_start]<p className="text-xs text-gray-500 mt-1">Código de país + código de área + número (sin espacios ni símbolos)</p> [cite: 121]
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  [cite_start]Mensaje Predeterminado de WhatsApp [cite: 122]
                  </label>
                <input
                  type="text"
                  value={configuracion.mensaje_whatsapp || [cite_start]''} [cite: 123]
                  [cite_start]onChange={(e) => handleConfigChange('mensaje_whatsapp', e.target.value)} [cite: 123]
                  [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 123]
                  [cite_start]placeholder="Ej: Hola! Quisiera consultar sobre una promoción" [cite: 123]
                />
                
                [cite_start]</div> [cite: 124]

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  [cite_start]Horarios de Atención [cite: 124]
                </label>
                <textarea
                  
                  value={configuracion.horarios || [cite_start]''} [cite: 125]
                  [cite_start]onChange={(e) => handleConfigChange('horarios', e.target.value)} [cite: 125]
                  rows="4"
                  [cite_start]className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" [cite: 125]
                  [cite_start]placeholder="Ej:&#10;Lunes a Viernes: 8:00 - 20:00&#10;Sábados: 9:00 - 13:00&#10;Domingos: Cerrado" [cite: 126]
                />
                [cite_start]<p className="text-xs text-gray-500 mt-1">Cada línea en un renglón diferente</p> [cite: 126]
              </div>

              <div className="flex gap-4">
                <button
                  
                  [cite_start]type="submit" [cite: 127]
                  [cite_start]className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 active:scale-95 shadow-lg" [cite: 127]
                >
                  [cite_start]Guardar Configuración [cite: 127]
                </button>
                
                [cite_start]</div> [cite: 128]
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
