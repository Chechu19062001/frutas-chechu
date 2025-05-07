document.addEventListener('DOMContentLoaded', function() {
    // Cargar los productos al iniciar
    cargarProductos();

    // Configurar los filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Quitar la clase activa de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar la clase activa al botón seleccionado
            this.classList.add('active');
            
            // Aplicar el filtro
            const filter = this.getAttribute('data-filter');
            filtrarProductos(filter);
        });
    });

    // Configurar la búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const textoFiltrado = this.value.toLowerCase().trim();
        buscarProductos(textoFiltrado);
    });

    // Agregar listener para botones de reserva (delegación de eventos)
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.classList.contains('reservar-btn') || e.target.closest('.reservar-btn'))) {
            const productoId = e.target.classList.contains('reservar-btn') 
                ? e.target.getAttribute('data-id') 
                : e.target.closest('.reservar-btn').getAttribute('data-id');
            mostrarFormularioReserva(productoId);
        } else if (e.target && (e.target.classList.contains('ver-detalle-btn') || e.target.closest('.ver-detalle-btn'))) {
            const productoId = e.target.classList.contains('ver-detalle-btn') 
                ? e.target.getAttribute('data-id') 
                : e.target.closest('.ver-detalle-btn').getAttribute('data-id');
            mostrarDetalleReserva(productoId);
        }
    });
});

// Función para verificar si es dispositivo móvil
function esDispositivoMovil() {
    return window.innerWidth <= 768;
}

// Función para cargar los productos desde localStorage
function cargarProductos() {
    const contenedor = document.getElementById('producto-container');
    
    // Productos predefinidos con imágenes mejoradas de plantas exóticas
    const productosDefault = [
        {
            id: 'mandarina-radical',
            nombre: 'Mandarina Radical',
            descripcion: 'Nuestra variedad más jugosa y aromática de mandarina. Perfecta para zumos y postres.',
            imagen: '/api/placeholder/400/300?text=Mandarina+Exótica',
            disponible: false,
            reservable: true,
            etiqueta: 'Exótico'
        },
        {
            id: 'melones-shimo',
            nombre: 'Melones Shimo',
            descripcion: 'Melones con sabor intenso a chicle de melón. Una experiencia refrescante de sabor exótico.',
            imagen: '/api/placeholder/400/300?text=Melón+Exótico',
            disponible: false,
            reservable: true,
            etiqueta: 'Exótico'
        }
    ];
    
    // Obtener productos del localStorage o usar los predefinidos
    let productos = JSON.parse(localStorage.getItem('productos'));
    
    // Si no hay productos en localStorage o la estructura es incorrecta, usar los predefinidos
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        localStorage.setItem('productos', JSON.stringify(productosDefault));
        productos = productosDefault;
    } else if (esDispositivoMovil()) {
        // Si es un dispositivo móvil, filtrar para mostrar solo los productos específicos
        productos = productos.filter(producto => 
            producto.id === 'mandarina-radical' || producto.id === 'melones-shimo'
        );
        
        // Si no se encontraron los productos específicos, usar los predefinidos
        if (productos.length === 0) {
            productos = productosDefault;
        }
    }
    
    // Limpiar el contenedor
    contenedor.innerHTML = '';
    
    if (productos.length === 0) {
        // Mostrar mensaje de vacío
        mostrarMensajeVacio();
    } else {
        // Mostrar los productos
        productos.forEach(producto => {
            const productoElemento = crearElementoProducto(producto);
            contenedor.appendChild(productoElemento);
        });
    }
}

// Re-verificar productos al cambiar el tamaño de la ventana
window.addEventListener('resize', function() {
    cargarProductos();
});

// Función para crear un elemento HTML de un producto
function crearElementoProducto(producto) {
    const disponibilidadClass = producto.disponible ? 'disponible' : 'no-disponible';
    const disponibilidadTexto = producto.disponible ? 'Disponible' : 'No disponible';
    const disponibilidadIcon = producto.disponible ? 'fas fa-check-circle' : 'fas fa-times-circle';
    
    const productoDiv = document.createElement('div');
    productoDiv.className = `producto ${disponibilidadClass}-item`;
    productoDiv.setAttribute('data-disponibilidad', producto.disponible ? 'disponible' : 'no-disponible');
    productoDiv.setAttribute('data-id', producto.id);
    
    // Contenido base del producto
    let contenidoHTML = `
        <div class="producto-img-container">
            <img src="${producto.imagen || '/api/placeholder/400/300?text=Fruta+Exótica'}" alt="${producto.nombre}" class="producto-img">
            ${producto.etiqueta ? `<div class="producto-label">${producto.etiqueta}</div>` : ''}
        </div>
        <div class="producto-info">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <span class="producto-disponibilidad ${disponibilidadClass}">
                <i class="${disponibilidadIcon}"></i> ${disponibilidadTexto}
            </span>
    `;
    
    // Añadir información de reserva si el producto tiene reservas
    if (producto.reservas && producto.reservas.length > 0) {
        contenidoHTML += `
            <div class="reserva-info">
                <i class="fas fa-users"></i> ${producto.reservas.length} reserva(s)
                <button class="ver-detalle-btn" data-id="${producto.id}">
                    <i class="fas fa-info-circle"></i> Ver detalles
                </button>
            </div>
        `;
    }
    
    // Añadir botón de reserva si el producto es reservable
    if (producto.reservable && !producto.disponible) {
        contenidoHTML += `
            <button class="reservar-btn" data-id="${producto.id}">
                <i class="fas fa-calendar-check"></i> Reservar
            </button>
        `;
    }
    
    contenidoHTML += `</div>`;
    productoDiv.innerHTML = contenidoHTML;
    
    return productoDiv;
}

// Función para filtrar productos por disponibilidad
function filtrarProductos(filtro) {
    const productos = document.querySelectorAll('.producto');
    let hayProductosVisibles = false;
    
    productos.forEach(producto => {
        if (filtro === 'all') {
            producto.style.display = 'block';
            hayProductosVisibles = true;
        } else {
            const disponibilidad = producto.getAttribute('data-disponibilidad');
            if (disponibilidad === filtro) {
                producto.style.display = 'block';
                hayProductosVisibles = true;
            } else {
                producto.style.display = 'none';
            }
        }
    });
    
    // Verificar si hay productos visibles después del filtrado
    if (!hayProductosVisibles) {
        mostrarMensajeVacio(filtro);
    } else {
        // Ocultar mensaje de vacío si existe
        const mensajeVacio = document.querySelector('.empty-state');
        if (mensajeVacio) {
            mensajeVacio.style.display = 'none';
        }
    }
}

// Función para buscar productos por nombre o descripción
function buscarProductos(texto) {
    const productos = document.querySelectorAll('.producto');
    let hayProductosVisibles = false;
    
    productos.forEach(producto => {
        const nombre = producto.querySelector('.producto-nombre').textContent.toLowerCase();
        const descripcion = producto.querySelector('.producto-descripcion').textContent.toLowerCase();
        const coincide = nombre.includes(texto) || descripcion.includes(texto);
        
        if (coincide) {
            producto.style.display = 'block';
            hayProductosVisibles = true;
        } else {
            producto.style.display = 'none';
        }
    });
    
    // Verificar si hay productos visibles después de la búsqueda
    if (!hayProductosVisibles) {
        mostrarMensajeBusquedaVacia(texto);
    } else {
        // Ocultar mensaje de búsqueda vacía si existe
        const mensajeVacio = document.querySelector('.empty-search');
        if (mensajeVacio) {
            mensajeVacio.remove();
        }
    }
}

// Función para mostrar un mensaje cuando no hay productos
function mostrarMensajeVacio(filtro) {
    const contenedor = document.getElementById('producto-container');
    
    // Eliminar mensajes existentes
    const mensajesVacios = document.querySelectorAll('.empty-state, .empty-filter, .empty-search');
    mensajesVacios.forEach(mensaje => mensaje.remove());
    
    // Crear nuevo mensaje
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state empty-filter';
    
    let mensaje = '';
    if (filtro === 'disponible') {
        mensaje = 'No hay frutas disponibles en este momento.';
    } else if (filtro === 'no-disponible') {
        mensaje = 'Todas nuestras frutas están disponibles.';
    } else {
        mensaje = 'No hay frutas en el inventario.';
    }
    
    emptyState.innerHTML = `
        <i class="fas fa-leaf"></i>
        <p>${mensaje}</p>
    `;
    
    contenedor.appendChild(emptyState);
}

// Función para mostrar un mensaje cuando la búsqueda no arroja resultados
function mostrarMensajeBusquedaVacia(texto) {
    const contenedor = document.getElementById('producto-container');
    
    // Eliminar mensajes existentes
    const mensajesVacios = document.querySelectorAll('.empty-search');
    mensajesVacios.forEach(mensaje => mensaje.remove());
    
    // Crear y mostrar mensaje
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state empty-search';
    emptyState.innerHTML = `
        <i class="fas fa-search"></i>
        <p>No se encontraron frutas que coincidan con "${texto}".</p>
    `;
    
    contenedor.appendChild(emptyState);
}

// Función para mostrar el formulario de reserva
function mostrarFormularioReserva(productoId) {
    // Cerrar cualquier modal abierto previamente
    cerrarModal();
    
    // Crear modal de reserva
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-reserva';
    
    // Obtener información del producto
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) return;
    
    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h3>Reservar ${producto.nombre}</h3>
                <button class="cerrar-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>¡Reserva ahora este producto para cuando esté disponible!</p>
                <form id="form-reserva">
                    <div class="form-grupo">
                        <label for="nombre-reserva">Tu nombre</label>
                        <input type="text" id="nombre-reserva" required placeholder="Ingresa tu nombre">
                    </div>
                    <div class="form-grupo">
                        <label for="email-reserva">Email de contacto</label>
                        <input type="email" id="email-reserva" required placeholder="email@ejemplo.com">
                    </div>
                    <div class="form-grupo">
                        <label for="cantidad-reserva">Cantidad (5-50 unidades)</label>
                        <div class="cantidad-container">
                            <button type="button" class="cantidad-btn disminuir">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" id="cantidad-reserva" min="5" max="50" value="5" required>
                            <button type="button" class="cantidad-btn aumentar">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="confirmar-reserva">
                        <i class="fas fa-calendar-check"></i> Confirmar Reserva
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Agregar modal al documento
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => {
        modal.classList.add('activo');
    }, 10);
    
    // Evento para cerrar modal
    modal.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
    
    // Eventos para botones de cantidad
    const cantidadInput = modal.querySelector('#cantidad-reserva');
    
    modal.querySelector('.disminuir').addEventListener('click', function() {
        let valor = parseInt(cantidadInput.value, 10);
        if (valor > 5) {
            cantidadInput.value = valor - 1;
        }
    });
    
    modal.querySelector('.aumentar').addEventListener('click', function() {
        let valor = parseInt(cantidadInput.value, 10);
        if (valor < 50) {
            cantidadInput.value = valor + 1;
        }
    });
    
    // Validar entrada directa en el campo de cantidad
    cantidadInput.addEventListener('change', function() {
        let valor = parseInt(this.value, 10);
        if (isNaN(valor) || valor < 5) {
            this.value = 5;
        } else if (valor > 50) {
            this.value = 50;
        }
    });
    
    // Evento para el formulario
    modal.querySelector('#form-reserva').addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-reserva').value;
        const email = document.getElementById('email-reserva').value;
        const cantidad = parseInt(document.getElementById('cantidad-reserva').value, 10);
        
        if (nombre && email && cantidad >= 5 && cantidad <= 50) {
            guardarReserva(productoId, nombre, email, cantidad);
            cerrarModal();
            mostrarConfirmacionReserva(producto.nombre, nombre, cantidad);
        }
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
}

// Función para mostrar los detalles de las reservas
function mostrarDetalleReserva(productoId) {
    // Cerrar cualquier modal abierto previamente
    cerrarModal();
    
    // Crear modal de detalles
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-detalles';
    
    // Obtener información del producto
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto || !producto.reservas || producto.reservas.length === 0) return;
    
    // Crear contenido HTML para las reservas
    let reservasHTML = '';
    producto.reservas.forEach((reserva, index) => {
        reservasHTML += `
            <div class="reserva-item">
                <div class="reserva-numero">#${index + 1}</div>
                <div class="reserva-detalles">
                    <p><strong>Cliente:</strong> ${reserva.nombre}</p>
                    <p><strong>Email:</strong> ${reserva.email}</p>
                    <p><strong>Cantidad:</strong> ${reserva.cantidad} unidades</p>
                    <p><strong>Fecha:</strong> ${new Date(reserva.fecha).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    });
    
    // Contenido del modal
    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h3>Reservas para ${producto.nombre}</h3>
                <button class="cerrar-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="reservas-lista">
                    ${reservasHTML}
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al documento
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => {
        modal.classList.add('activo');
    }, 10);
    
    // Evento para cerrar modal
    modal.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
}

// Función para cerrar cualquier modal
function cerrarModal() {
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => {
        modal.classList.remove('activo');
        setTimeout(() => {
            modal.remove();
        }, 300); // Esperar a que termine la animación
    });
}

// Función para guardar la reserva en localStorage
function guardarReserva(productoId, nombre, email, cantidad) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const productoIndex = productos.findIndex(p => p.id === productoId);
    
    if (productoIndex !== -1) {
        // Crear objeto de reserva
        const reserva = {
            nombre,
            email,
            cantidad,
            fecha: new Date().toISOString()
        };
        
        // Inicializar array de reservas si no existe
        if (!productos[productoIndex].reservas) {
            productos[productoIndex].reservas = [];
        }
        
        // Añadir nueva reserva
        productos[productoIndex].reservas.push(reserva);
        
        // Guardar en localStorage
        localStorage.setItem('productos', JSON.stringify(productos));
        
        // Actualizar visualización
        cargarProductos();
    }
}

// Función para mostrar confirmación de reserva
function mostrarConfirmacionReserva(nombreProducto, nombreCliente, cantidad) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas fa-check-circle"></i>
            <div class="notificacion-texto">
                <p class="notificacion-titulo">¡Reserva Confirmada!</p>
                <p>Gracias ${nombreCliente}. Has reservado ${cantidad} unidades de ${nombreProducto}.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('activo');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('activo');
        setTimeout(() => {
            notificacion.remove();
        }, 500);
    }, 4000);
}