/**
 * ChechuTablas - Script principal optimizado
 * Versión: 1.3
 */

// Gestión de datos centralizada
const DB = {
    currentUser: null,
    savedTables: [],
    publicTables: [],
    currentTableId: null,
    syncInterval: null,
    
    // Guardar datos en localStorage
    saveData() {
        localStorage.setItem('chechuUser', this.currentUser);
        localStorage.setItem('chechuTables', JSON.stringify(this.savedTables));
        
        // Guardar tablas públicas en almacenamiento compartido simulado
        if (this.publicTables.length > 0) {
            localStorage.setItem('globalChechuPublicTables', JSON.stringify(this.publicTables));
        }
    },
    
    // Cargar datos de localStorage
    loadData() {
        this.currentUser = localStorage.getItem('chechuUser') || null;
        
        try {
            this.savedTables = JSON.parse(localStorage.getItem('chechuTables')) || [];
            
            // Cargar tablas públicas del almacenamiento global
            const globalPublicTables = JSON.parse(localStorage.getItem('globalChechuPublicTables')) || [];
            
            // Si hay tablas públicas compartidas, usarlas
            if (globalPublicTables.length > 0) {
                this.publicTables = globalPublicTables;
            } else {
                // Datos de ejemplo para tablas públicas iniciales
                this.publicTables = [
                    {
                        id: 'pub1',
                        name: 'AutoFlower Master',
                        author: 'GreenThumb420',
                        likes: 84,
                        products: ['BIO BLOOM', 'BUD CANDY', 'TOP MAX'],
                        description: 'Perfecta para variedades autoflorecientes en interior.',
                        createdAt: '2025-04-15',
                        rows: [
                            {
                                product: 'BIO BLOOM',
                                values: ['0 ml/L', '0 ml/L', '1.5 ml/L', '1.5 ml/L', '1.5 ml/L', '3 ml/L', '3 ml/L', '3 ml/L', '0 ml/L', '0 ml/L']
                            },
                            {
                                product: 'BUD CANDY',
                                values: ['0 ml/L', '0 ml/L', '0 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '0 ml/L', '0 ml/L']
                            },
                            {
                                product: 'TOP MAX',
                                values: ['0 ml/L', '0 ml/L', '0 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '0 ml/L', '0 ml/L']
                            }
                        ]
                    },
                    {
                        id: 'pub2',
                        name: 'Power Bloom',
                        author: 'CannaMaster',
                        likes: 56,
                        products: ['FLORA NOVA', 'CARBOLOAD', 'Bloombastic'],
                        description: 'Potencia el crecimiento en la fase de floración.',
                        createdAt: '2025-04-28',
                        rows: [
                            {
                                product: 'FLORA NOVA',
                                values: ['0 ml/L', '0 ml/L', '1.5 ml/L', '1.5 ml/L', '3 ml/L', '3 ml/L', '3 ml/L', '3 ml/L', '0 ml/L', '0 ml/L']
                            },
                            {
                                product: 'CARBOLOAD',
                                values: ['0 ml/L', '0 ml/L', '0 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '2 ml/L', '0 ml/L', '0 ml/L']
                            },
                            {
                                product: 'Bloombastic',
                                values: ['0 ml/L', '0 ml/L', '0 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '1 ml/L', '0 ml/L', '0 ml/L']
                            }
                        ]
                    }
                ];
                // Guardar tablas de ejemplo en almacenamiento global
                localStorage.setItem('globalChechuPublicTables', JSON.stringify(this.publicTables));
            }
            
            // Iniciar sincronización periódica
            this.startSyncInterval();
            
        } catch (e) {
            this.savedTables = [];
            this.publicTables = [];
            console.error("Error al cargar datos:", e);
        }
    },
    
    // Iniciar intervalo de sincronización
    startSyncInterval() {
        // Detener intervalo anterior si existe
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Sincronizar inmediatamente al cargar
        this.syncPublicTables();
        
        // Establecer nuevo intervalo para sincronizar cada 30 segundos
        this.syncInterval = setInterval(() => {
            this.syncPublicTables();
        }, 30000);
    },
    
    // Sincronizar tablas públicas con almacenamiento compartido
    syncPublicTables() {
        try {
            // Obtener tablas públicas del almacenamiento global
            const globalTables = JSON.parse(localStorage.getItem('globalChechuPublicTables')) || [];
            
            // Comparar si hay cambios
            if (JSON.stringify(globalTables) !== JSON.stringify(this.publicTables)) {
                // Actualizar tablas locales con las globales
                this.publicTables = globalTables;
                
                // Refrescar interfaz si el modal está abierto
                if (document.getElementById('publicTablesModal').classList.contains('active')) {
                    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
                    TableManager.loadPublicTablesList(activeFilter);
                }
            }
        } catch (e) {
            console.error("Error al sincronizar tablas públicas:", e);
        }
    }
};

// Utilidades generales
const Utils = {
    // Mostrar notificación
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    },
    
    // Mostrar/ocultar loader
    toggleLoader(show) {
        document.getElementById('loader').classList.toggle('hidden', !show);
    },
    
    // Generar ID único
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Formatear fecha
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

// Gestor de modales
const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
    },
    
    // Configurar todos los modales
    setupModals() {
        // Configurar botones de cierre
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modal = closeBtn.closest('.modal');
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Cerrar al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
};

// Gestor de tablas
const TableManager = {
    // Crear tabla de abonado
    createFeedingTable() {
        const selectedProducts = this.getSelectedProducts();
        
        if (Object.values(selectedProducts).filter(Boolean).length === 0) {
            Utils.showNotification('Selecciona al menos un producto para generar la tabla');
            return;
        }
        
        Utils.toggleLoader(true);
        
        // Simulamos un pequeño retraso para dar sensación de procesamiento
        setTimeout(() => {
            this.populateTable(selectedProducts);
            document.getElementById('tableCard').classList.remove('hidden');
            document.getElementById('tableNameInput').focus();
            Utils.toggleLoader(false);
        }, 800);
    },
    
    // Obtener productos seleccionados
    getSelectedProducts() {
        const products = {};
        
        document.querySelectorAll('.product-options input[type="radio"]:checked').forEach(radio => {
            products[radio.name] = radio.value;
        });
        
        return products;
    },
    
    // Rellenar tabla con datos calculados
    populateTable(products) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        Object.entries(products).forEach(([category, product]) => {
            if (!product) return;
            
            const row = document.createElement('tr');
            
            // Celda de producto
            const productCell = document.createElement('td');
            productCell.textContent = product;
            row.appendChild(productCell);
            
            // Generar valores según tipo de producto y fase
            for (let week = 1; week <= 10; week++) {
                const cell = document.createElement('td');
                cell.className = 'editable-cell';
                cell.contentEditable = true;
                
                let value = '0';
                
                // Lógica para generar valores según fase y producto
                if (category === 'abono') {
                    if (week < 3) value = '0';
                    else if (week < 6) value = '1.5';
                    else if (week < 9) value = '3';
                    else value = '0';
                } else if (category === 'azucar') {
                    if (week < 4) value = '0';
                    else if (week < 9) value = '2';
                    else value = '0';
                } else if (category === 'estimulador') {
                    if (week > 3 && week < 9) value = '1';
                    else value = '0';
                } else if (category === 'tamano') {
                    if (week > 5 && week < 9) value = '2';
                    else value = '0';
                }
                
                cell.textContent = value + ' ml/L';
                row.appendChild(cell);
            }
            
            tableBody.appendChild(row);
        });
        
        DB.currentTableId = Utils.generateId();
    },
    
    // Guardar tabla actual
    saveCurrentTable() {
        const tableName = document.getElementById('tableNameInput').value.trim();
        
        if (!tableName) {
            Utils.showNotification('Por favor, dale un nombre a tu tabla');
            document.getElementById('tableNameInput').focus();
            return;
        }
        
        // Recoger datos de la tabla
        const products = [];
        const rows = document.querySelectorAll('#tableBody tr');
        
        rows.forEach(row => {
            const productName = row.querySelector('td').textContent;
            products.push(productName);
        });
        
        // Crear objeto de tabla
        const tableData = {
            id: DB.currentTableId || Utils.generateId(),
            name: tableName,
            author: DB.currentUser,
            products: products,
            rows: this.serializeTableRows(),
            createdAt: new Date().toISOString()
        };
        
        // Guardar en memoria y localStorage
        const existingIndex = DB.savedTables.findIndex(t => t.id === tableData.id);
        
        if (existingIndex >= 0) {
            DB.savedTables[existingIndex] = tableData;
            Utils.showNotification('Tabla actualizada correctamente');
        } else {
            DB.savedTables.push(tableData);
            Utils.showNotification('Tabla guardada correctamente');
        }
        
        DB.saveData();
    },
    
    // Serializar filas de la tabla
    serializeTableRows() {
        const rows = [];
        document.querySelectorAll('#tableBody tr').forEach(tr => {
            const rowData = {
                product: tr.querySelector('td').textContent,
                values: []
            };
            
            tr.querySelectorAll('td:not(:first-child)').forEach(td => {
                rowData.values.push(td.textContent);
            });
            
            rows.push(rowData);
        });
        
        return rows;
    },
    
    // Cargar tabla guardada
    loadTable(tableId) {
        const table = DB.savedTables.find(t => t.id === tableId);
        
        if (!table) return;
        
        document.getElementById('tableNameInput').value = table.name;
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        table.rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Celda de producto
            const productCell = document.createElement('td');
            productCell.textContent = row.product;
            tr.appendChild(productCell);
            
            // Celdas de valores
            row.values.forEach(value => {
                const cell = document.createElement('td');
                cell.className = 'editable-cell';
                cell.contentEditable = true;
                cell.textContent = value;
                tr.appendChild(cell);
            });
            
            tableBody.appendChild(tr);
        });
        
        document.getElementById('tableCard').classList.remove('hidden');
        DB.currentTableId = tableId;
    },
    
    // Cargar tablas guardadas en el modal
    loadSavedTablesList() {
        const tablesList = document.getElementById('savedTablesList');
        tablesList.innerHTML = '';
        
        if (DB.savedTables.length === 0) {
            tablesList.innerHTML = '<p style="text-align: center; padding: 20px;">No tienes tablas guardadas aún</p>';
            return;
        }
        
        DB.savedTables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'table-card';
            
            tableCard.innerHTML = `
                <h3>${table.name}</h3>
                <p>Productos: ${table.products.slice(0, 2).join(', ')}${table.products.length > 2 ? '...' : ''}</p>
                <p>Creada: ${Utils.formatDate(table.createdAt)}</p>
                <div class="table-card-actions">
                    <button class="btn btn-view" data-id="${table.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-edit" data-id="${table.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-delete" data-id="${table.id}">
                        <i class="fas fa-trash"></i> Borrar
                    </button>
                </div>
            `;
            
            tablesList.appendChild(tableCard);
        });
        
        // Configurar botones
        this.setupTableButtons();
    },
    
    // Configurar botones de las tablas
    setupTableButtons() {
        // Ver tabla
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.getAttribute('data-id');
                Modal.close('savedTablesModal');
                this.loadTable(tableId);
            });
        });
        
        // Editar tabla (mismo comportamiento que ver para esta versión)
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.getAttribute('data-id');
                Modal.close('savedTablesModal');
                this.loadTable(tableId);
            });
        });
        
        // Borrar tabla
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.getAttribute('data-id');
                if (confirm('¿Estás seguro de que quieres eliminar esta tabla?')) {
                    DB.savedTables = DB.savedTables.filter(t => t.id !== tableId);
                    DB.saveData();
                    this.loadSavedTablesList();
                    Utils.showNotification('Tabla eliminada correctamente');
                }
            });
        });
    },
    
    // Cargar tablas públicas en el modal
    loadPublicTablesList(filter = 'all') {
        const tablesList = document.getElementById('publicTablesList');
        tablesList.innerHTML = '';
        
        // Ordenar tablas según el filtro
        let filteredTables = [...DB.publicTables];
        
        if (filter === 'popular') {
            filteredTables.sort((a, b) => b.likes - a.likes);
        } else if (filter === 'recent') {
            filteredTables.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Búsqueda
        const searchTerm = document.getElementById('searchPublicTables').value.toLowerCase();
        if (searchTerm) {
            filteredTables = filteredTables.filter(table => 
                table.name.toLowerCase().includes(searchTerm) || 
                table.author.toLowerCase().includes(searchTerm) || 
                (table.description && table.description.toLowerCase().includes(searchTerm)) ||
                table.products.some(p => p.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filteredTables.length === 0) {
            tablesList.innerHTML = '<p style="text-align: center; padding: 20px;">No hay tablas que coincidan con tu búsqueda</p>';
            return;
        }
        
        filteredTables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'table-card';
            
            tableCard.innerHTML = `
                <h3>${table.name} <span class="public-badge">${table.likes} ♥</span></h3>
                <p>Por: ${table.author}</p>
                <p>${table.description || 'Sin descripción'}</p>
                <p>Productos: ${table.products.join(', ')}</p>
                <p>Fecha: ${Utils.formatDate(table.createdAt)}</p>
                <div class="table-card-actions">
                    <button class="btn btn-view-public" data-id="${table.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </div>
            `;
            
            tablesList.appendChild(tableCard);
        });
        
        // Configurar botones para ver tablas públicas
        document.querySelectorAll('.btn-view-public').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.getAttribute('data-id');
                this.viewPublicTable(tableId);
            });
        });
    },
    
    // Ver tabla pública en detalle
    viewPublicTable(tableId) {
        const table = DB.publicTables.find(t => t.id === tableId);
        
        if (!table) return;
        
        // Llenar datos de la tabla
        document.getElementById('viewTableName').textContent = table.name;
        document.getElementById('viewTableAuthor').textContent = table.author;
        document.getElementById('likeCount').textContent = table.likes;
        
        // Llenar la tabla
        const tableBody = document.getElementById('viewTableBody');
        tableBody.innerHTML = '';
        
        table.rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Celda de producto
            const productCell = document.createElement('td');
            productCell.textContent = row.product;
            tr.appendChild(productCell);
            
            // Celdas de valores
            row.values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                tr.appendChild(cell);
            });
            
            tableBody.appendChild(tr);
        });
        
        // Configurar botón de like
        const likeBtn = document.getElementById('likeTableBtn');
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').className = 'far fa-heart';
        
        likeBtn.onclick = () => {
            if (likeBtn.classList.contains('liked')) {
                table.likes--;
                likeBtn.classList.remove('liked');
                likeBtn.querySelector('i').className = 'far fa-heart';
            } else {
                table.likes++;
                likeBtn.classList.add('liked');
                likeBtn.querySelector('i').className = 'fas fa-heart';
            }
            document.getElementById('likeCount').textContent = table.likes;
            DB.saveData();
        };
        
        // Configurar botón de copiar
        document.getElementById('copyToMyTablesBtn').onclick = () => {
            this.copyPublicTable(tableId);
        };
        
        // Cerrar modal anterior si está abierto
        Modal.close('publicTablesModal');
        
        // Abrir modal de visualización
        Modal.open('viewTableModal');
    },
    
    // Copiar tabla pública a tablas personales
    copyPublicTable(tableId) {
        const publicTable = DB.publicTables.find(t => t.id === tableId);
        
        if (!publicTable) return;
        
        // Crear copia para tablas personales
        const newTable = {
            id: Utils.generateId(),
            name: `Copia de ${publicTable.name}`,
            author: DB.currentUser,
            products: [...publicTable.products],
            rows: JSON.parse(JSON.stringify(publicTable.rows)), // Copia profunda
            createdAt: new Date().toISOString()
        };
        
        // Añadir a tablas personales
        DB.savedTables.push(newTable);
        DB.saveData();
        
        Utils.showNotification('Tabla copiada a tus tablas personales');
        Modal.close('viewTableModal');
    },
    
    // Compartir tabla con la comunidad
    shareTable() {
        if (!DB.currentTableId) {
            Utils.showNotification('Primero debes crear o cargar una tabla');
            return;
        }
        
        const table = DB.savedTables.find(t => t.id === DB.currentTableId);
        
        if (!table) {
            Utils.showNotification('No se encontró la tabla actual');
            return;
        }
        
        const description = document.getElementById('tableDescription').value.trim();
        const allowComments = document.getElementById('allowComments').checked;
        
        // Crear objeto para tabla pública
        const publicTable = {
            id: 'pub_' + Utils.generateId(),
            name: table.name,
            author: DB.currentUser,
            likes: 0,
            products: [...table.products],
            rows: JSON.parse(JSON.stringify(table.rows)), // Copia profunda
            description: description,
            allowComments: allowComments,
            createdAt: new Date().toISOString(),
            comments: []
        };
        
        // Añadir a tablas públicas
        DB.publicTables.push(publicTable);
        
        // Guardar en almacenamiento global y local
        localStorage.setItem('globalChechuPublicTables', JSON.stringify(DB.publicTables));
        DB.saveData();
        
        Utils.showNotification('¡Tabla compartida con la comunidad!');
        Modal.close('shareTableModal');
    }
};

// Gestor de productos personalizados
const CustomProductManager = {
    setupCustomProducts() {
        document.querySelectorAll('.btn-add-custom').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                document.getElementById('customProductCategory').value = category;
                Modal.open('customProductModal');
            });
        });
        
        document.getElementById('saveCustomProductBtn').addEventListener('click', () => {
            this.addCustomProduct();
        });
    },
    
    addCustomProduct() {
        const name = document.getElementById('customProductName').value.trim();
        const category = document.getElementById('customProductCategory').value;
        
        if (!name) {
            Utils.showNotification('Introduce un nombre para el producto');
            return;
        }
        
        const productOptions = document.querySelector(`.product-options[data-category="${category}"]`);
        const label = document.createElement('label');
        label.className = 'product-option';
        
        label.innerHTML = `
            <input type="radio" name="${category}" value="${name}">
            <span class="product-icon"><i class="fas fa-flask"></i></span>
            <span>${name}</span>
        `;
        
        productOptions.appendChild(label);
        
        // Seleccionar el nuevo producto
        const radio = label.querySelector('input[type="radio"]');
        radio.checked = true;
        
        Modal.close('customProductModal');
        document.getElementById('customProductName').value = '';
        Utils.showNotification(`Añadido "${name}" a ${category}`);
    }
};

// Inicialización de la aplicación
function initApp() {
    // Cargar datos almacenados
    DB.loadData();
    
    // Si hay usuario guardado, saltar pantalla de bienvenida
    if (DB.currentUser) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        document.getElementById('usernameDisplay').textContent = DB.currentUser;
    }
    
    // Configurar inicio de sesión
    document.getElementById('startAppBtn').addEventListener('click', () => {
        const username = document.getElementById('usernameInput').value.trim();
        
        if (!username) {
            Utils.showNotification('Por favor, escribe un nombre de usuario');
            return;
        }
        
        DB.currentUser = username;
        DB.saveData();
        
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        document.getElementById('usernameDisplay').textContent = username;
        
        Utils.showNotification(`¡Bienvenido, ${username}!`);
    });
    
    // Configurar modales y eventos
    Modal.setupModals();
    CustomProductManager.setupCustomProducts();
    
    // Botones principales
    document.getElementById('createTableBtn').addEventListener('click', () => {
        TableManager.createFeedingTable();
    });
    
    document.getElementById('saveTableBtn').addEventListener('click', () => {
        TableManager.saveCurrentTable();
    });
    
    document.getElementById('createNewTableBtn').addEventListener('click', () => {
        document.getElementById('tableCard').classList.add('hidden');
    });
    
    document.getElementById('showSavedTablesBtn').addEventListener('click', () => {
        TableManager.loadSavedTablesList();
        Modal.open('savedTablesModal');
    });
    
    document.getElementById('publicTablesBtn').addEventListener('click', () => {
        TableManager.loadPublicTablesList();
        Modal.open('publicTablesModal');
    });
    
    // Configurar búsqueda y filtros de tablas públicas
    document.getElementById('searchPublicTables').addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        TableManager.loadPublicTablesList(activeFilter);
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            TableManager.loadPublicTablesList(filter);
        });
    });
    
    // Configurar compartir tabla
    document.getElementById('shareTableBtn').addEventListener('click', () => {
        document.getElementById('tableDescription').value = '';
        document.getElementById('allowComments').checked = true;
        Modal.open('shareTableModal');
    });
    
    document.getElementById('confirmShareBtn').addEventListener('click', () => {
        TableManager.shareTable();
    });
    
    document.getElementById('cancelShareBtn').addEventListener('click', () => {
        Modal.close('shareTableModal');
    });
    
    // Permitir enviar formularios con Enter
    document.getElementById('usernameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('startAppBtn').click();
        }
    });
    
    document.getElementById('customProductName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveCustomProductBtn').click();
        }
    });
    
    document.getElementById('searchPublicTables').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar recarga
        }
    });
    
    document.getElementById('tableDescription').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            document.getElementById('confirmShareBtn').click();
        }
    });
}

// Iniciar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initApp);