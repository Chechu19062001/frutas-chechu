// Simulación de base de datos con localStorage
const DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '{}');
    },
    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },
    getTables() {
        return JSON.parse(localStorage.getItem('tables') || '[]');
    },
    saveTables(tables) {
        localStorage.setItem('tables', JSON.stringify(tables));
    },
    getPublicTables() {
        return JSON.parse(localStorage.getItem('publicTables') || '[]');
    },
    savePublicTables(publicTables) {
        localStorage.setItem('publicTables', JSON.stringify(publicTables));
    },
    getCurrentUser() {
        return localStorage.getItem('currentUser');
    },
    setCurrentUser(username) {
        localStorage.setItem('currentUser', username);
    },
    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    }
};

// Funciones de utilidad
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}

function generateID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Gestión de autenticación
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
    });
});

document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Por favor completa todos los campos');
        return;
    }
    
    const users = DB.getUsers();
    if (!users[username] || users[username] !== password) {
        showNotification('Usuario o contraseña incorrectos');
        return;
    }
    
    DB.setCurrentUser(username);
    showLoader();
    setTimeout(() => {
        hideLoader();
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        document.getElementById('usernameDisplay').textContent = username;
    }, 1000);
});

document.getElementById('registerButton').addEventListener('click', () => {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden');
        return;
    }
    
    const users = DB.getUsers();
    if (users[username]) {
        showNotification('El nombre de usuario ya existe');
        return;
    }
    
    users[username] = password;
    DB.saveUsers(users);
    showNotification('¡Registro exitoso! Ya puedes iniciar sesión');
    
    // Cambiar a pestaña de login
    document.querySelector('.auth-tab[data-tab="login"]').click();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    DB.clearCurrentUser();
    document.getElementById('appContent').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    // Limpiar campos
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
});

// Verificar si hay sesión activa
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = DB.getCurrentUser();
    if (currentUser) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        document.getElementById('usernameDisplay').textContent = currentUser;
    }
    
    // Cargar productos personalizados
    loadCustomProducts();
});

// Gestión de productos personalizados
function loadCustomProducts() {
    const customProducts = JSON.parse(localStorage.getItem('customProducts') || '{}');
    const currentUser = DB.getCurrentUser();
    
    if (currentUser && customProducts[currentUser]) {
        Object.keys(customProducts[currentUser]).forEach(category => {
            const productsContainer = document.querySelector(`.product-options[data-category="${category}"]`);
            
            customProducts[currentUser][category].forEach(product => {
                const label = document.createElement('label');
                label.className = 'product-option';
                label.innerHTML = `
                    <input type="radio" name="${category}" value="${product}">
                    <span class="product-icon"><i class="fas fa-flask"></i></span>
                    <span>${product}</span>
                `;
                productsContainer.appendChild(label);
            });
        });
    }
}

// Agregar producto personalizado
document.querySelectorAll('.btn-add-custom').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('customProductCategory').value = btn.dataset.category;
        document.getElementById('customProductModal').style.display = 'flex';
    });
});

document.getElementById('saveCustomProductBtn').addEventListener('click', () => {
    const productName = document.getElementById('customProductName').value.trim();
    const category = document.getElementById('customProductCategory').value;
    const currentUser = DB.getCurrentUser();
    
    if (!productName || !category) {
        showNotification('Completa todos los campos');
        return;
    }
    
    const customProducts = JSON.parse(localStorage.getItem('customProducts') || '{}');
    
    if (!customProducts[currentUser]) {
        customProducts[currentUser] = {};
    }
    
    if (!customProducts[currentUser][category]) {
        customProducts[currentUser][category] = [];
    }
    
    customProducts[currentUser][category].push(productName);
    localStorage.setItem('customProducts', JSON.stringify(customProducts));
    
    // Agregar a la interfaz
    const productsContainer = document.querySelector(`.product-options[data-category="${category}"]`);
    const label = document.createElement('label');
    label.className = 'product-option';
    label.innerHTML = `
        <input type="radio" name="${category}" value="${productName}">
        <span class="product-icon"><i class="fas fa-flask"></i></span>
        <span>${productName}</span>
    `;
    productsContainer.appendChild(label);
    
    // Cerrar modal
    document.getElementById('customProductModal').style.display = 'none';
    document.getElementById('customProductName').value = '';
    document.getElementById('customProductCategory').value = '';
    
    showNotification('Producto personalizado agregado');
});

// Crear tabla de abonado
document.getElementById('createTableBtn').addEventListener('click', () => {
    // Verificar que se ha seleccionado al menos un producto
    let hasProduct = false;
    const categories = ['abono', 'azucar', 'estimulador', 'tamano'];
    const selectedProducts = {};
    
    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) {
            hasProduct = true;
            selectedProducts[category] = selected.value;
        }
    });
    
    if (!hasProduct) {
        showNotification('Selecciona al menos un producto');
        return;
    }
    
    // Generar filas de la tabla
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    Object.values(selectedProducts).forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product}</td>
            ${Array(10).fill().map((_, i) => `
                <td contenteditable="true" 
                    data-week="${i+1}" 
                    data-product="${product}" 
                    class="editable-cell">
                </td>
            `).join('')}
        `;
        tableBody.appendChild(row);
    });
    
    // Mostrar tarjeta de tabla
    document.getElementById('tableCard').classList.remove('hidden');
    document.getElementById('tableNameInput').value = `Tabla de ${DB.getCurrentUser()} - ${new Date().toLocaleDateString()}`;
    
    // Scroll hasta la tabla
    document.getElementById('tableCard').scrollIntoView({ behavior: 'smooth' });
});

// Guardar tabla
document.getElementById('saveTableBtn').addEventListener('click', () => {
    const tableName = document.getElementById('tableNameInput').value.trim();
    if (!tableName) {
        showNotification('Dale un nombre a tu tabla');
        return;
    }
    
    const products = [];
    document.querySelectorAll('#tableBody tr').forEach(row => {
        const product = row.cells[0].textContent;
        const doses = [];
        
        for (let i = 1; i <= 10; i++) {
            doses.push(row.cells[i].textContent);
        }
        
        products.push({ product, doses });
    });
    
    const tableData = {
        id: generateID(),
        name: tableName,
        author: DB.getCurrentUser(),
        date: new Date().toISOString(),
        products,
        isPublic: false
    };
    
    const tables = DB.getTables();
    tables.push(tableData);
    DB.saveTables(tables);
    
    showNotification('¡Tabla guardada correctamente!');
});

// Ver tablas guardadas
document.getElementById('showSavedTablesBtn').addEventListener('click', () => {
    const tables = DB.getTables();
    const currentUser = DB.getCurrentUser();
    const savedTablesList = document.getElementById('savedTablesList');
    
    savedTablesList.innerHTML = '';
    
    const userTables = tables.filter(table => table.author === currentUser);
    
    if (userTables.length === 0) {
        savedTablesList.innerHTML = '<p class="text-muted">No tienes tablas guardadas</p>';
    } else {
        userTables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'card table-card';
            const publicStatus = table.isPublic ? 
                '<span class="public-badge"><i class="fas fa-globe"></i> Pública</span>' : '';
            
            tableCard.innerHTML = `
                <h3>${table.name} ${publicStatus}</h3>
                <p>Creada: ${new Date(table.date).toLocaleDateString()}</p>
                <div class="table-card-actions">
                    <button class="btn btn-view" data-table-id="${table.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-edit" data-table-id="${table.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-delete" data-table-id="${table.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn ${table.isPublic ? 'btn-unpublish' : 'btn-publish'}" data-table-id="${table.id}">
                        <i class="fas ${table.isPublic ? 'fa-lock' : 'fa-globe'}"></i> 
                        ${table.isPublic ? 'Despublicar' : 'Publicar'}
                    </button>
                </div>
            `;
            
            savedTablesList.appendChild(tableCard);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.dataset.tableId;
                const table = tables.find(t => t.id === tableId);
                if (table) {
                    displayTableInModal(table);
                }
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.dataset.tableId;
                const table = tables.find(t => t.id === tableId);
                if (table) {
                    openTableForEditing(table);
                }
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.dataset.tableId;
                deleteTable(tableId);
            });
        });
        
        document.querySelectorAll('.btn-publish, .btn-unpublish').forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.dataset.tableId;
                toggleTablePublicStatus(tableId);
            });
        });
    }
    
    document.getElementById('savedTablesModal').style.display = 'flex';
});

// Función para abrir tabla para edición
function openTableForEditing(table) {
    document.getElementById('editTableNameInput').value = table.name;
    
    const editTableBody = document.getElementById('editTableBody');
    editTableBody.innerHTML = '';
    
    table.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product}</td>
            ${product.doses.map((dose, idx) => `
                <td contenteditable="true" 
                    data-week="${idx+1}" 
                    data-product="${product.product}" 
                    class="editable-cell">
                    ${dose || ''}
                </td>
            `).join('')}
        `;
        editTableBody.appendChild(row);
    });
    
    // Guardar ID de la tabla que se está editando
    document.getElementById('editTableModal').dataset.tableId = table.id;
    
    // Mostrar modal
    document.getElementById('savedTablesModal').style.display = 'none';
    document.getElementById('editTableModal').style.display = 'flex';
}

// Guardar cambios en tabla editada
document.getElementById('updateTableBtn').addEventListener('click', () => {
    const tableId = document.getElementById('editTableModal').dataset.tableId;
    const tableName = document.getElementById('editTableNameInput').value.trim();
    
    if (!tableName) {
        showNotification('Dale un nombre a tu tabla');
        return;
    }
    
    const products = [];
    document.querySelectorAll('#editTableBody tr').forEach(row => {
        const product = row.cells[0].textContent;
        const doses = [];
        
        for (let i = 1; i <= 10; i++) {
            doses.push(row.cells[i].textContent);
        }
        
        products.push({ product, doses });
    });
    
    // Actualizar tabla
    const tables = DB.getTables();
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex !== -1) {
        // Mantener estado público y fecha de creación original
        const isPublic = tables[tableIndex].isPublic;
        const originalDate = tables[tableIndex].date;
        
        tables[tableIndex] = {
            id: tableId,
            name: tableName,
            author: DB.getCurrentUser(),
            date: originalDate,
            products,
            isPublic
        };
        
        DB.saveTables(tables);
        
        // Actualizar tablas públicas si es necesario
        if (isPublic) {
            const publicTables = DB.getPublicTables();
            const publicIndex = publicTables.findIndex(t => t.id === tableId);
            if (publicIndex !== -1) {
                publicTables[publicIndex] = tables[tableIndex];
                DB.savePublicTables(publicTables);
            }
        }
        
        showNotification('¡Tabla actualizada correctamente!');
        document.getElementById('editTableModal').style.display = 'none';
    }
});

// Cancelar edición
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editTableModal').style.display = 'none';
    document.getElementById('savedTablesModal').style.display = 'flex';
});

// Eliminar tabla
function deleteTable(tableId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tabla?')) {
        let tables = DB.getTables();
        
        // Verificar si la tabla es pública para eliminarla también de ahí
        const tableToDelete = tables.find(t => t.id === tableId);
        if (tableToDelete && tableToDelete.isPublic) {
            let publicTables = DB.getPublicTables();
            publicTables = publicTables.filter(t => t.id !== tableId);
            DB.savePublicTables(publicTables);
        }
        
        // Eliminar de tablas personales
        tables = tables.filter(t => t.id !== tableId);
        DB.saveTables(tables);
        
        showNotification('Tabla eliminada correctamente');
        
        // Refrescar lista de tablas
        document.getElementById('showSavedTablesBtn').click();
    }
}

// Cambiar estado público/privado de una tabla
function toggleTablePublicStatus(tableId) {
    const tables = DB.getTables();
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex !== -1) {
        // Cambiar estado
        tables[tableIndex].isPublic = !tables[tableIndex].isPublic;
        
        // Actualizar en localStorage
        DB.saveTables(tables);
        
        // Actualizar lista de tablas públicas
        let publicTables = DB.getPublicTables();
        
        if (tables[tableIndex].isPublic) {
            // Añadir a públicas
            publicTables.push(tables[tableIndex]);
            showNotification('Tabla publicada correctamente');
        } else {
            // Quitar de públicas
            publicTables = publicTables.filter(t => t.id !== tableId);
            showNotification('Tabla retirada del espacio público');
        }
        
        DB.savePublicTables(publicTables);
        
        // Refrescar lista de tablas
        document.getElementById('showSavedTablesBtn').click();
    }
}

// Mostrar tabla en modal
function displayTableInModal(tableData) {
    document.getElementById('viewTableName').textContent = tableData.name;
    document.getElementById('viewTableAuthor').textContent = tableData.author;
    
    const tableBody = document.getElementById('viewTableBody');
    tableBody.innerHTML = '';
    
    tableData.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product}</td>
            ${product.doses.map(dose => `<td>${dose || ''}</td>`).join('')}
        `;
        tableBody.appendChild(row);
    });
    
    // Si estamos viendo una tabla pública y no es nuestra, mostrar botón de copiar
    const currentUser = DB.getCurrentUser();
    const isMine = tableData.author === currentUser;
    
    document.getElementById('copyToMyTablesBtn').style.display = isMine ? 'none' : 'block';
    document.getElementById('viewTableModal').dataset.tableId = tableData.id;
    
    // Ocultar modales anteriores y mostrar este
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.getElementById('viewTableModal').style.display = 'flex';
}

// Manejar el botón de tablas públicas
document.getElementById('publicTablesBtn').addEventListener('click', () => {
    const publicTables = DB.getPublicTables();
    const publicTablesList = document.getElementById('publicTablesList');
    
    publicTablesList.innerHTML = '';
    
    if (publicTables.length === 0) {
        publicTablesList.innerHTML = '<p class="text-muted">No hay tablas publicadas</p>';
    } else {
        publicTables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'card table-card';
            tableCard.innerHTML = `
                <h3>${table.name}</h3>
                <p>Autor: ${table.author}</p>
                <p>Creada: ${new Date(table.date).toLocaleDateString()}</p>
                <div class="table-card-actions">
                    <button class="btn btn-view" data-table-id="${table.id}">
                        <i class="fas fa-eye"></i> Ver tabla
                    </button>
                </div>
            `;
            
            tableCard.querySelector('.btn-view').addEventListener('click', () => {
                displayTableInModal(table);
            });
            
            publicTablesList.appendChild(tableCard);
        });
    }
    
    document.getElementById('publicTablesModal').style.display = 'flex';
});

// Copiar tabla pública a mis tablas
document.getElementById('copyToMyTablesBtn').addEventListener('click', () => {
    const tableId = document.getElementById('viewTableModal').dataset.tableId;
    const publicTables = DB.getPublicTables();
    const tableToClone = publicTables.find(t => t.id === tableId);
    
    if (tableToClone) {
        const newTable = {
            id: generateID(),
            name: `${tableToClone.name} (copia)`,
            author: DB.getCurrentUser(),
            date: new Date().toISOString(),
            products: JSON.parse(JSON.stringify(tableToClone.products)), // Deep copy
            isPublic: false
        };
        
        const tables = DB.getTables();
        tables.push(newTable);
        DB.saveTables(tables);
        
        showNotification('Tabla copiada a tu colección');
        document.getElementById('viewTableModal').style.display = 'none';
    }
});

// Crear nueva tabla
document.getElementById('createNewTableBtn').addEventListener('click', () => {
    document.getElementById('tableCard').classList.add('hidden');
    
    // Limpiar selecciones
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Scroll al selector de productos
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
});

// Cerrar modalidades
document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        close.closest('.modal').style.display = 'none';
    });
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Inicializar datos de ejemplo si es la primera vez
(function initApp() {
    if (!localStorage.getItem('users')) {
        const users = {
            'demo': 'demo123',
            'chechu': 'trap2025',
            'grower': 'password'
        };
        DB.saveUsers(users);
    }
})();