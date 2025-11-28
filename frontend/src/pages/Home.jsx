import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const [categorias, setCategorias] = useState([])
  const [promociones, setPromociones] = useState([])
  const [configuracion, setConfiguracion] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [mostrarTutorial, setMostrarTutorial] = useState(true)

  useEffect(() => {
    fetchData()
    // Ocultar tutorial después de 5 segundos
    const timer = setTimeout(() => {
      setMostrarTutorial(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [catRes, promoRes, configRes] = await Promise.all([
        axios.get('${import.meta.env.VITE_API_URL}/api/categorias'),
        axios.get('${import.meta.env.VITE_API_URL}/api/promociones'),
        axios.get('${import.meta.env.VITE_API_URL}/api/configuracion')
      ])
      setCategorias(catRes.data)
      setPromociones(promoRes.data)
      setConfiguracion(configRes.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar las promociones')
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      red: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      orange: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      purple: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      indigo: 'from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600'
    }
    return colors[color] || colors.blue
  }

  const promocionesAgrupadas = categorias.map(cat => ({
    ...cat,
    promociones: promociones.filter(p => p.categoria_id === cat.id)
  })).filter(cat => cat.promociones.length > 0)

  const promocionesSinCategoria = promociones.filter(p => !p.categoria_id)

  const nextCategoria = () => {
    if (categoriaActiva < promocionesAgrupadas.length - 1) {
      setCategoriaActiva(categoriaActiva + 1)
    }
  }

  const prevCategoria = () => {
    if (categoriaActiva > 0) {
      setCategoriaActiva(categoriaActiva - 1)
    }
  }

  const irACategoria = (index) => {
    setCategoriaActiva(index)
  }

  // Funciones para detectar swipe en móviles
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextCategoria()
      setMostrarTutorial(false) // Ocultar tutorial al deslizar
    }
    if (isRightSwipe) {
      prevCategoria()
      setMostrarTutorial(false) // Ocultar tutorial al deslizar
    }
  }

  const abrirMapa = () => {
    if (!configuracion) return
    const { latitud, longitud } = configuracion
    
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Abrir en app de mapas del dispositivo
      window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`
    } else {
      // Abrir en nueva pestaña en desktop
      window.open(`https://www.google.com/maps?q=${latitud},${longitud}`, '_blank')
    }
  }

  const abrirWhatsApp = () => {
    if (!configuracion) return
    const { telefono_whatsapp, mensaje_whatsapp } = configuracion
    const mensaje = encodeURIComponent(mensaje_whatsapp || 'Hola! Quisiera consultar sobre una promoción')
    window.open(`https://wa.me/${telefono_whatsapp}?text=${mensaje}`, '_blank')
  }

  const llamarTelefono = () => {
    if (!configuracion) return
    window.location.href = `tel:${configuracion.telefono}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              🛒 Ofertas Increíbles
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto drop-shadow">
              Descubre las mejores promociones de tu minimercado favorito
            </p>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="rgb(240 253 244)"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-green-600 absolute top-0"></div>
            </div>
            <p className="text-gray-600 font-medium">Cargando ofertas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="text-4xl mr-4">⚠️</span>
              <div>
                <h3 className="text-red-800 font-bold text-lg">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Carrusel de Categorías */}
            {promocionesAgrupadas.length > 0 && (
              <div className="relative">
                {/* Tutorial de Swipe para móviles */}
                {mostrarTutorial && promocionesAgrupadas.length > 1 && (
                  <div className="md:hidden fixed top-1/2 left-0 right-0 z-50 flex justify-center pointer-events-none animate-bounce">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      <span className="font-semibold">Desliza para ver más ofertas</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Categoría Actual con soporte para swipe */}
                <div 
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  className="touch-pan-y"
                >
                  <section className="space-y-6">
                  {/* Categoría Header */}
                  <div className={`bg-gradient-to-r ${getColorClasses(promocionesAgrupadas[categoriaActiva].color)} p-6 rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-300`}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{promocionesAgrupadas[categoriaActiva].icono}</span>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-1">
                          {promocionesAgrupadas[categoriaActiva].nombre}
                        </h2>
                        {promocionesAgrupadas[categoriaActiva].descripcion && (
                          <p className="text-white/90 text-lg">{promocionesAgrupadas[categoriaActiva].descripcion}</p>
                        )}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white font-bold text-lg">
                          {promocionesAgrupadas[categoriaActiva].promociones.length} {promocionesAgrupadas[categoriaActiva].promociones.length === 1 ? 'oferta' : 'ofertas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promociones Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {promocionesAgrupadas[categoriaActiva].promociones.map((promo) => (
                      <div 
                        key={promo.id} 
                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                      >
                        <div className="relative overflow-hidden bg-gray-100 h-64">
                          <img
                            src={promo.imagen_url}
                            alt={promo.titulo}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                            <span className="text-xl">{promocionesAgrupadas[categoriaActiva].icono}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                            {promo.titulo}
                          </h3>
                          {promo.descripcion && (
                            <ul className="text-base text-gray-700 space-y-2">
                              {promo.descripcion.split('\n').filter(line => line.trim()).map((line, idx) => {
                                // Detectar si la línea contiene un precio (formato: $999 o $999.99)
                                const precioMatch = line.match(/\$\s*[\d,\.]+/g);
                                
                                if (precioMatch) {
                                  // Si tiene precio, resaltarlo
                                  let lineaFormateada = line;
                                  precioMatch.forEach(precio => {
                                    lineaFormateada = lineaFormateada.replace(
                                      precio,
                                      `<span class="text-2xl font-black text-green-600">${precio}</span>`
                                    );
                                  });
                                  return (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-green-600 font-bold text-lg mt-1">•</span>
                                      <span dangerouslySetInnerHTML={{ __html: lineaFormateada }} className="flex-1" />
                                    </li>
                                  );
                                }
                                
                                // Detectar texto entre asteriscos para negritas: **texto**
                                let conFormato = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
                                
                                // Detectar texto rojo: ##texto##
                                conFormato = conFormato.replace(/##(.*?)##/g, '<span class="font-bold text-red-600">$1</span>');
                                
                                // Detectar texto azul: @@texto@@
                                conFormato = conFormato.replace(/@@(.*?)@@/g, '<span class="font-bold text-blue-600">$1</span>');
                                
                                // Detectar texto destacado: ++texto++
                                conFormato = conFormato.replace(/\+\+(.*?)\+\+/g, '<span class="font-bold text-orange-600">$1</span>');
                                
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold text-lg mt-1">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: conFormato }} className="flex-1" />
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  </section>
                </div>

                {/* Controles de Navegación */}
                {promocionesAgrupadas.length > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-6">
                    {/* Botones Anterior/Siguiente */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={prevCategoria}
                        disabled={categoriaActiva === 0}
                        className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-95"
                      >
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <span className="text-lg font-semibold text-gray-700">
                        {categoriaActiva + 1} / {promocionesAgrupadas.length}
                      </span>

                      <button
                        onClick={nextCategoria}
                        disabled={categoriaActiva === promocionesAgrupadas.length - 1}
                        className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-95"
                      >
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Indicadores de puntos */}
                    <div className="flex gap-2">
                      {promocionesAgrupadas.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => irACategoria(index)}
                          className={`transition-all duration-300 rounded-full ${
                            index === categoriaActiva
                              ? 'w-12 h-3 bg-green-600'
                              : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Ir a categoría ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Lista de categorías clickeables */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {promocionesAgrupadas.map((cat, index) => (
                        <button
                          key={cat.id}
                          onClick={() => irACategoria(index)}
                          className={`px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                            index === categoriaActiva
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 shadow hover:shadow-md'
                          }`}
                        >
                          <span className="text-lg mr-2">{cat.icono}</span>
                          {cat.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Promociones sin categoría */}
            {promocionesSinCategoria.length > 0 && (
              <section className="space-y-6">
                <div className="bg-gradient-to-r from-gray-500 to-slate-600 p-6 rounded-2xl shadow-xl">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🏷️</span>
                    Otras Promociones
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {promocionesSinCategoria.map((promo) => (
                    <div 
                      key={promo.id} 
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                    >
                      <div className="relative overflow-hidden bg-gray-100 h-64">
                        <img
                          src={promo.imagen_url}
                          alt={promo.titulo}
                          loading="lazy"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                          {promo.titulo}
                        </h3>
                        {promo.descripcion && (
                          <ul className="text-base text-gray-700 space-y-2">
                            {promo.descripcion.split('\n').filter(line => line.trim()).map((line, idx) => {
                              // Detectar si la línea contiene un precio (formato: $999 o $999.99)
                              const precioMatch = line.match(/\$\s*[\d,\.]+/g);
                              
                              if (precioMatch) {
                                // Si tiene precio, resaltarlo
                                let lineaFormateada = line;
                                precioMatch.forEach(precio => {
                                  lineaFormateada = lineaFormateada.replace(
                                    precio,
                                    `<span class="text-2xl font-black text-green-600">${precio}</span>`
                                  );
                                });
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold text-lg mt-1">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: lineaFormateada }} className="flex-1" />
                                  </li>
                                );
                              }
                              
                              // Detectar texto entre asteriscos para negritas: **texto**
                              let conFormato = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
                              
                              // Detectar texto rojo: ##texto##
                              conFormato = conFormato.replace(/##(.*?)##/g, '<span class="font-bold text-red-600">$1</span>');
                              
                              // Detectar texto azul: @@texto@@
                              conFormato = conFormato.replace(/@@(.*?)@@/g, '<span class="font-bold text-blue-600">$1</span>');
                              
                              // Detectar texto destacado: ++texto++
                              conFormato = conFormato.replace(/\+\+(.*?)\+\+/g, '<span class="font-bold text-orange-600">$1</span>');
                              
                              return (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-green-600 font-bold text-lg mt-1">•</span>
                                  <span dangerouslySetInnerHTML={{ __html: conFormato }} className="flex-1" />
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {promociones.length === 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🛍️</div>
                <h3 className="text-3xl font-bold text-gray-700 mb-3">
                  Aún no hay promociones
                </h3>
                <p className="text-xl text-gray-500">
                  ¡Pronto habrán ofertas increíbles para ti!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-800 via-emerald-800 to-teal-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {configuracion?.nombre_negocio || 'Minimercado'} - Tu tienda de confianza
            </h3>
            <p className="text-green-100 mb-6">
              Las mejores ofertas, siempre cerca de ti
            </p>
            
            {/* Información de Contacto Interactiva */}
            {configuracion && (
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {/* Ubicación con GPS */}
                <button
                  onClick={abrirMapa}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-green-100 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{configuracion.ubicacion}</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={abrirWhatsApp}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-green-100 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Teléfono */}
                <button
                  onClick={llamarTelefono}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-green-100 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Llamar</span>
                </button>
              </div>
            )}

            {/* Horarios */}
            {configuracion?.horarios && (
              <div className="mb-6 bg-white/10 rounded-lg p-4 inline-block">
                <h4 className="text-white font-semibold mb-2 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horarios de Atención
                </h4>
                <div className="text-green-100 text-sm whitespace-pre-line">
                  {configuracion.horarios}
                </div>
              </div>
            )}
            
            {/* Botón Admin en el footer - discreto */}
            <div className="mb-6">
              <Link 
                to="/login"
                className="inline-block text-green-300 hover:text-white text-sm transition-colors duration-300 opacity-50 hover:opacity-100"
              >
                Administración
              </Link>
            </div>
            
            <p className="text-green-300 text-sm">
              © 2025 {configuracion?.nombre_negocio || 'Minimercado'}. Todas las ofertas válidas según stock disponible.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
