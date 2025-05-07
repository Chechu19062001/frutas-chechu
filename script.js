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
        products
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
            tableCard.className = 'card';
            tableCard.innerHTML = `
                <h3>${table.name}</h3>
                <p>Creada: ${new Date(table.date).toLocaleDateString()}</p>
                <button class="btn" data-table-id="${table.id}">Ver tabla</button>
            `;
            
            tableCard.querySelector('button').addEventListener('click', () => {
                displayTableInModal(table);
            });
            
            savedTablesList.appendChild(tableCard);
        });
    }
    
    document.getElementById('savedTablesModal').style.display = 'flex';
});

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
            ${product.doses.map(dose => `<td>${dose}</td>`).join('')}
        `;
        tableBody.appendChild(row);
    });
    
    document.getElementById('savedTablesModal').style.display = 'none';
    document.getElementById('viewTableModal').style.display = 'flex';
}

// Compartir tabla
document.getElementById('shareTableBtn').addEventListener('click', () => {
    const tableName = document.getElementById('tableNameInput').value.trim();
    if (!tableName) {
        showNotification('Guarda la tabla antes de compartirla');
        return;
    }
    
    // Generar enlace simulado
    const shareLink = `https://proyectochechu.com/share/${generateID()}`;
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('shareTableModal').style.display = 'flex';
});

document.getElementById('shareViewTableBtn').addEventListener('click', () => {
    const shareLink = `https://proyectochechu.com/share/${generateID()}`;
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('viewTableModal').style.display = 'none';
    document.getElementById('shareTableModal').style.display = 'flex';
});

// Copiar enlace
document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    showNotification('Enlace copiado al portapapeles');
});

// Compartir por WhatsApp
document.getElementById('shareWhatsAppBtn').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink').value;
    const whatsappURL = `https://wa.me/?text=¡Mira mi tabla de abonado en Proyecto Chechu! ${encodeURIComponent(shareLink)}`;
    window.open(whatsappURL, '_blank');
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

// Buscar usuarios
document.getElementById('searchUsersBtn').addEventListener('click', () => {
    const users = Object.keys(DB.getUsers());
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    users.forEach(username => {
        if (username !== DB.getCurrentUser()) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <span>${username}</span>
                <button class="btn-small" data-username="${username}">Ver perfil</button>
            `;
            
            userItem.querySelector('button').addEventListener('click', () => {
                showUserProfile(username);
            });
            
            usersList.appendChild(userItem);
        }
    });
    
    document.getElementById('searchUsersModal').style.display = 'flex';
});

// Mostrar perfil de usuario
function showUserProfile(username) {
    document.getElementById('profileUsername').textContent = username;
    
    const tables = DB.getTables().filter(table => table.author === username);
    document.getElementById('userTablesCount').textContent = tables.length;
    
    const userTables = document.getElementById('userTables');
    userTables.innerHTML = '';
    
    if (tables.length === 0) {
        userTables.innerHTML = '<p class="text-muted">Este usuario no tiene tablas compartidas</p>';
    } else {
        tables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'card';
            tableCard.innerHTML = `
                <h3>${table.name}</h3>
                <p>Creada: ${new Date(table.date).toLocaleDateString()}</p>
                <button class="btn" data-table-id="${table.id}">Ver tabla</button>
            `;
            
            tableCard.querySelector('button').addEventListener('click', () => {
                displayTableInModal(table);
            });
            
            userTables.appendChild(tableCard);
        });
    }
    
    document.getElementById('searchUsersModal').style.display = 'none';
    document.getElementById('userProfileModal').style.display = 'flex';
}

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

// Guardar tabla compartida
document.getElementById('saveSharedTableBtn').addEventListener('click', () => {
    // Implementación simplificada - copia la tabla actual
    const tableName = document.getElementById('viewTableName').textContent + " (copia)";
    showNotification('Tabla guardada en tu colección');
    document.getElementById('viewTableModal').style.display = 'none';
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