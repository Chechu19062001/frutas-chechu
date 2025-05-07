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
});

// Función para cargar los productos desde localStorage
function cargarProductos() {
    const contenedor = document.getElementById('producto-container');
    const estadoVacio = document.getElementById('no-productos');
    
    // Obtener productos del localStorage o usar un array vacío si no hay productos
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    
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
    
    productoDiv.innerHTML = `
        <div class="producto-img-container">
            <img src="${producto.imagen || '/api/placeholder/400/300'}" alt="${producto.nombre}" class="producto-img">
        </div>
        <div class="producto-info">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <span class="producto-disponibilidad ${disponibilidadClass}">
                <i class="${disponibilidadIcon}"></i> ${disponibilidadTexto}
            </span>
        </div>
    `;
    
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