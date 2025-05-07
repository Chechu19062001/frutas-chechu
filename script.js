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
        if (e.target && e.target.classList.contains('reservar-btn')) {
            const productoId = e.target.getAttribute('data-id');
            mostrarFormularioReserva(productoId);
        }
    });
});

// Función para cargar los productos desde localStorage
function cargarProductos() {
    const contenedor = document.getElementById('producto-container');
    const estadoVacio = document.getElementById('no-productos');
    
    // Obtener productos del localStorage o usar un array vacío si no hay productos
    const productos = JSON.parse(localStorage.getItem('productos')) || [
        {
            id: 'mandarina-radical',
            nombre: 'Mandarina Radical',
            descripcion: 'Nuestra variedad más jugosa y aromática de mandarina. Perfecta para zumos y postres.',
            imagen: '/api/placeholder/400/300?text=Mandarinas',
            disponible: false,
            reservable: true
        },
        {
            id: 'melones-shimo',
            nombre: 'Melones Shimo',
            descripcion: 'Melones con sabor intenso a chicle de melón. Una experiencia refrescante de sabor exótico.',
            imagen: '/api/placeholder/400/300?text=Melones',
            disponible: false,
            reservable: true
        }
    ];
    
    // Guardar los productos en localStorage si no existen
    if (!localStorage.getItem('productos')) {
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    
    // Limpiar el contenedor
    contenedor.innerHTML = '';
    
    if (productos.length === 0) {
        // Mostrar el mensaje de vacío
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-leaf"></i>
            <p>Aún no hay frutas en el inventario.</p>
        `;
        contenedor.appendChild(emptyState);
    } else {
        // Mostrar los productos
        productos.forEach(producto => {
            const productoElemento = crearElementoProducto(producto);
            contenedor.appendChild(productoElemento);
        });
    }
}

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
            <img src="${producto.imagen || '/api/placeholder/400/300'}" alt="${producto.nombre}" class="producto-img">
        </div>
        <div class="producto-info">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <span class="producto-disponibilidad ${disponibilidadClass}">
                <i class="${disponibilidadIcon}"></i> ${disponibilidadTexto}
            </span>
    `;
    
    // Añadir botón de reserva si el producto es reservable
    if (producto.reservable && !producto.disponible) {
        contenidoHTML += `
            <button class="reservar-btn" data-id="${producto.id}">
                <i class="fas fa-calendar-check"></i> Reservar
            </button>
        `;
    }
    
    // Añadir información de reserva si el producto tiene reservas
    if (producto.reservadoPor) {
        contenidoHTML += `
            <div class="reserva-info">
                <i class="fas fa-user-check"></i> Reservado por: ${producto.reservadoPor}
            </div>
        `;
    }
    
    contenidoHTML += `</div>`;
    productoDiv.innerHTML = contenidoHTML;
    
    return productoDiv;
}

// Función para filtrar productos por disponibilidad
function filtrarProductos(filtro) {
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
        if (filtro === 'all') {
            producto.style.display = 'block';
        } else {
            const disponibilidad = producto.getAttribute('data-disponibilidad');
            producto.style.display = disponibilidad === filtro ? 'block' : 'none';
        }
    });
    
    // Verificar si hay productos visibles después del filtrado
    mostrarMensajeVacio(filtro);
}

// Función para buscar productos por nombre
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
        // Ocultar el mensaje de búsqueda vacía si existe
        const mensajeVacio = document.querySelector('.empty-search');
        if (mensajeVacio) {
            mensajeVacio.remove();
        }
    }
}

// Función para mostrar un mensaje cuando no hay productos después del filtrado
function mostrarMensajeVacio(filtro) {
    const contenedor = document.getElementById('producto-container');
    let hayProductosVisibles = false;
    
    // Verificar si hay productos visibles
    document.querySelectorAll('.producto').forEach(producto => {
        if (producto.style.display !== 'none') {
            hayProductosVisibles = true;
        }
    });
    
    // Eliminar mensajes de vacío existentes
    const mensajesVacios = document.querySelectorAll('.empty-state, .empty-filter, .empty-search');
    mensajesVacios.forEach(mensaje => mensaje.remove());
    
    // Si no hay productos visibles, mostrar un mensaje
    if (!hayProductosVisibles) {
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
}

// Función para mostrar un mensaje cuando la búsqueda no arroja resultados
function mostrarMensajeBusquedaVacia(texto) {
    const contenedor = document.getElementById('producto-container');
    
    // Eliminar mensajes de búsqueda vacía existentes
    const mensajesVacios = document.querySelectorAll('.empty-search');
    mensajesVacios.forEach(mensaje => mensaje.remove());
    
    // Crear y mostrar el mensaje
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
    cerrarFormularioReserva();
    
    // Crear el modal de reserva
    const modal = document.createElement('div');
    modal.className = 'modal-reserva';
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
                    <button type="submit" class="confirmar-reserva">
                        <i class="fas fa-calendar-check"></i> Confirmar Reserva
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Agregar el modal al documento
    document.body.appendChild(modal);
    
    // Mostrar el modal con animación
    setTimeout(() => {
        modal.classList.add('activo');
    }, 10);
    
    // Evento para cerrar el modal
    modal.querySelector('.cerrar-modal').addEventListener('click', cerrarFormularioReserva);
    
    // Evento para el formulario de reserva
    modal.querySelector('#form-reserva').addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-reserva').value;
        const email = document.getElementById('email-reserva').value;
        
        if (nombre && email) {
            guardarReserva(productoId, nombre, email);
            cerrarFormularioReserva();
            mostrarConfirmacionReserva(producto.nombre, nombre);
        }
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarFormularioReserva();
        }
    });
}

// Función para cerrar el formulario de reserva
function cerrarFormularioReserva() {
    const modal = document.getElementById('modal-reserva');
    if (modal) {
        modal.classList.remove('activo');
        setTimeout(() => {
            modal.remove();
        }, 300); // Esperar a que termine la animación
    }
}

// Función para guardar la reserva en localStorage
function guardarReserva(productoId, nombre, email) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const productoIndex = productos.findIndex(p => p.id === productoId);
    
    if (productoIndex !== -1) {
        productos[productoIndex].reservadoPor = nombre;
        productos[productoIndex].emailReserva = email;
        
        localStorage.setItem('productos', JSON.stringify(productos));
        
        // Actualizar la visualización
        cargarProductos();
    }
}

// Función para mostrar confirmación de reserva
function mostrarConfirmacionReserva(nombreProducto, nombreCliente) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-reserva';
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas fa-check-circle"></i>
            <p>¡Gracias ${nombreCliente}! Has reservado ${nombreProducto} exitosamente.</p>
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
    }, 3000);
}