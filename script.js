// PROYECTO CHECHU - TRAP EDITION
document.addEventListener('DOMContentLoaded', init);

// Estado global de la aplicación
const state = {
    currentUser: null,
    selectedProducts: {},
    currentTable: { id: null, name: '', products: [], isPublic: false, notes: {} },
    userTables: [],
    customProducts: {}
};

// Inicialización de la aplicación
function init() {
    // Verificar si hay una sesión activa
    const user = localStorage.getItem('currentUser');
    if (user) {
        state.currentUser = JSON.parse(user);
        showApp();
        loadUserTables();
    }

    // Inicializar escuchadores de eventos
    initEventListeners();
}

// Configurar todos los escuchadores de eventos
function initEventListeners() {
    // Auth events
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    document.getElementById('registerButton').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Product selection events
    document.querySelectorAll('.product-option').forEach(option => {
        option.addEventListener('click', () => {
            const input = option.querySelector('input');
            if (input) {
                input.checked = true;
                selectProduct(input.name, input.value);
            }
        });
    });

    // Custom product events
    document.querySelectorAll('.btn-add-custom').forEach(btn => {
        btn.addEventListener('click', () => showCustomProductModal(btn.dataset.category));
    });
    document.getElementById('saveCustomProductBtn').addEventListener('click', addCustomProduct);

    // Table actions
    document.getElementById('createTableBtn').addEventListener('click', createTable);
    document.getElementById('saveTableBtn').addEventListener('click', saveTable);
    document.getElementById('createNewTableBtn').addEventListener('click', resetTableCreation);
    document.getElementById('showSavedTablesBtn').addEventListener('click', showSavedTablesModal);

    // Community events
    document.getElementById('communityBtn').addEventListener('click', showCommunityModal);
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => switchModalTab(tab.dataset.tab));
    });
    document.getElementById('userSearchInput').addEventListener('input', filterUsers);
    document.getElementById('tableSearchInput').addEventListener('input', filterPublicTables);

    // Notes modal
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);

    // Tables view events
    document.getElementById('copyTableBtn').addEventListener('click', copyTableToMine);
    document.getElementById('rateTableBtn').addEventListener('click', showRatingModal);
    document.getElementById('submitRatingBtn').addEventListener('click', submitRating);

    // Star rating events
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', () => setRating(star.dataset.rating));
        star.addEventListener('mouseover', () => previewRating(star.dataset.rating));
        star.addEventListener('mouseout', resetRatingPreview);
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Close modals on click outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });
}

// ========== AUTENTICACIÓN ==========

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    // Simular inicio de sesión (en una app real esto sería una llamada API)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = { username: user.username, id: user.id };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        showApp();
        loadUserTables();
        showNotification('Inicio de sesión exitoso', 'success');
    } else {
        showNotification('Usuario o contraseña incorrectos', 'error');
    }
}

function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Validar usuario único
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        showNotification('El nombre de usuario ya está en uso', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        tables: [],
        customProducts: {}
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    state.currentUser = { username: newUser.username, id: newUser.id };
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    showApp();
    showNotification('Registro exitoso, bienvenido', 'success');
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    state.currentUser = null;
    document.getElementById('appContent').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    resetState();
    showNotification('Sesión cerrada correctamente', 'success');
}

function showApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = state.currentUser.username;
}

// ========== GESTIÓN DE PRODUCTOS ==========

function selectProduct(category, value) {
    state.selectedProducts[category] = value;
    
    // Actualizar UI
    const options = document.querySelectorAll(`.product-options[data-category="${category}"] .product-option`);
    options.forEach(option => {
        const input = option.querySelector('input');
        option.classList.toggle('selected', input && input.value === value);
    });
}

function showCustomProductModal(category) {
    document.getElementById('customProductCategory').value = category;
    document.getElementById('customProductName').value = '';
    document.getElementById('customProductModal').style.display = 'block';
}

function addCustomProduct() {
    const name = document.getElementById('customProductName').value.trim();
    const category = document.getElementById('customProductCategory').value;
    
    if (!name || !category) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Guardar producto personalizado
    if (!state.customProducts[category]) {
        state.customProducts[category] = [];
    }
    state.customProducts[category].push(name);
    
    // Actualizar UI
    const container = document.querySelector(`.product-options[data-category="${category}"]`);
    const newOption = document.createElement('label');
    newOption.className = 'product-option';
    newOption.innerHTML = `
        <input type="radio" name="${category}" value="${name}">
        <span class="product-icon"><i class="fas fa-flask"></i></span>
        <span>${name}</span>
    `;
    container.appendChild(newOption);
    
    // Agregar evento
    newOption.addEventListener('click', () => {
        newOption.querySelector('input').checked = true;
        selectProduct(category, name);
    });
    
    // Guardar en localStorage
    saveCustomProducts();
    
    // Cerrar modal
    document.getElementById('customProductModal').style.display = 'none';
    showNotification('Producto personalizado añadido', 'success');
}

function saveCustomProducts() {
    if (!state.currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === state.currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].customProducts = state.customProducts;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function loadCustomProducts() {
    if (!state.currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === state.currentUser.id);
    
    if (user && user.customProducts) {
        state.customProducts = user.customProducts;
        
        // Actualizar UI
        Object.entries(user.customProducts).forEach(([category, products]) => {
            const container = document.querySelector(`.product-options[data-category="${category}"]`);
            if (container) {
                products.forEach(product => {
                    const newOption = document.createElement('label');
                    newOption.className = 'product-option';
                    newOption.innerHTML = `
                        <input type="radio" name="${category}" value="${product}">
                        <span class="product-icon"><i class="fas fa-flask"></i></span>
                        <span>${product}</span>
                    `;
                    container.appendChild(newOption);
                    
                    // Agregar evento
                    newOption.addEventListener('click', () => {
                        newOption.querySelector('input').checked = true;
                        selectProduct(category, product);
                    });
                });
            }
        });
    }
}

// ========== GESTIÓN DE TABLAS ==========

function createTable() {
    const selectedCount = Object.keys(state.selectedProducts).length;
    if (selectedCount === 0) {
        showNotification('Selecciona al menos un producto', 'warning');
        return;
    }
    
    // Crear tabla
    state.currentTable = {
        id: null,
        name: '',
        products: [],
        isPublic: false,
        notes: {}
    };
    
    // Agregar productos seleccionados
    Object.entries(state.selectedProducts).forEach(([category, name]) => {
        state.currentTable.products.push({
            name,
            category,
            dosage: Array(10).fill('') // 10 semanas
        });
    });
    
    // Mostrar tabla
    renderCurrentTable();
    document.getElementById('tableCard').classList.remove('hidden');
    document.getElementById('tableNameInput').focus();
}

function renderCurrentTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    state.currentTable.products.forEach((product, productIndex) => {
        const row = document.createElement('tr');
        
        // Celda de nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        row.appendChild(nameCell);
        
        // Celdas de dosificación
        for (let week = 0; week < 10; week++) {
            const cell = document.createElement('td');
            const controls = document.createElement('div');
            controls.className = 'controls';
            
            // Input de dosificación
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-dosage';
            input.value = product.dosage[week] || '';
            input.placeholder = 'ml/L';
            input.dataset.product = productIndex;
            input.dataset.week = week;
            input.addEventListener('input', updateDosage);
            
            // Botón de notas
            const notesBtn = document.createElement('button');
            notesBtn.className = 'btn-notes';
            notesBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
            notesBtn.dataset.week = week + 1; // Para mostrar semana 1-10 en lugar de 0-9
            notesBtn.addEventListener('click', () => showNotesModal(week + 1));
            
            controls.appendChild(input);
            controls.appendChild(notesBtn);
            cell.appendChild(controls);
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    });
    
    // Actualizar estado público/privado
    document.getElementById('tablePublicToggle').checked = state.currentTable.isPublic;
}

function updateDosage(e) {
    const productIndex = parseInt(e.target.dataset.product);
    const week = parseInt(e.target.dataset.week);
    state.currentTable.products[productIndex].dosage[week] = e.target.value;
}

function saveTable() {
    const tableName = document.getElementById('tableNameInput').value.trim();
    if (!tableName) {
        showNotification('Por favor ingresa un nombre para la tabla', 'warning');
        return;
    }
    
    // Actualizar información de la tabla
    state.currentTable.name = tableName;
    state.currentTable.isPublic = document.getElementById('tablePublicToggle').checked;
    
    if (!state.currentTable.id) {
        // Nueva tabla
        state.currentTable.id = Date.now().toString();
        state.currentTable.author = state.currentUser.username;
        state.currentTable.createdAt = new Date().toISOString();
        state.userTables.push(state.currentTable);
    } else {
        // Actualizar tabla existente
        const index = state.userTables.findIndex(t => t.id === state.currentTable.id);
        if (index !== -1) {
            state.userTables[index] = state.currentTable;
        }
    }
    
    // Guardar en localStorage
    saveUserTables();
    showNotification('Tabla guardada correctamente', 'success');
}

function saveUserTables() {
    if (!state.currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === state.currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].tables = state.userTables;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function loadUserTables() {
    if (!state.currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === state.currentUser.id);
    
    if (user) {
        state.userTables = user.tables || [];
        
        // Cargar productos personalizados
        state.customProducts = user.customProducts || {};
        loadCustomProducts();
    }
}

function resetTableCreation() {
    state.selectedProducts = {};
    state.currentTable = { id: null, name: '', products: [], isPublic: false, notes: {} };
    
    // Resetear selección de productos
    document.querySelectorAll('.product-option').forEach(option => {
        option.classList.remove('selected');
        if (option.querySelector('input')) {
            option.querySelector('input').checked = false;
        }
    });
    
    // Ocultar tabla
    document.getElementById('tableCard').classList.add('hidden');
}

function showSavedTablesModal() {
    const container = document.getElementById('savedTablesList');
    container.innerHTML = '';
    
    if (state.userTables.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; text-align: center;">No tienes tablas guardadas.</p>';
    } else {
        state.userTables.forEach(table => {
            const tableEl = document.createElement('div');
            tableEl.className = 'saved-table';
            tableEl.innerHTML = `
                <div class="saved-table-title">${table.name}</div>
                <div class="saved-table-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Evento para editar
            tableEl.querySelector('.edit-btn').addEventListener('click', () => loadTableForEdit(table.id));
            
            // Evento para eliminar
            tableEl.querySelector('.delete-btn').addEventListener('click', () => deleteTable(table.id));
            
            // Evento para cargar al hacer clic en la tabla
            tableEl.addEventListener('click', (e) => {
                if (!e.target.closest('.saved-table-actions')) {
                    loadTableForEdit(table.id);
                }
            });
            
            container.appendChild(tableEl);
        });
    }
    
    document.getElementById('savedTablesModal').style.display = 'block';
}

function loadTableForEdit(tableId) {
    const table = state.userTables.find(t => t.id === tableId);
    if (table) {
        state.currentTable = JSON.parse(JSON.stringify(table)); // Copia profunda
        renderCurrentTable();
        document.getElementById('tableNameInput').value = table.name;
        document.getElementById('tableCard').classList.remove('hidden');
        document.getElementById('savedTablesModal').style.display = 'none';
    }
}

function deleteTable(tableId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tabla?')) {
        state.userTables = state.userTables.filter(t => t.id !== tableId);
        saveUserTables();
        showSavedTablesModal(); // Recargar modal
        showNotification('Tabla eliminada correctamente', 'success');
    }
}

// ========== NOTAS ==========

function showNotesModal(week) {
    document.getElementById('weekNumber').textContent = week;
    document.getElementById('weekNotes').value = state.currentTable.notes[week] || '';
    document.getElementById('notesModal').style.display = 'block';
}

function saveNotes() {
    const week = document.getElementById('weekNumber').textContent;
    const notes = document.getElementById('weekNotes').value.trim();
    
    if (notes) {
        state.currentTable.notes[week] = notes;
    } else {
        delete state.currentTable.notes[week];
    }
    
    document.getElementById('notesModal').style.display = 'none';
    showNotification('Notas guardadas', 'success');
}

// ========== COMUNIDAD ==========

function showCommunityModal() {
    loadCommunityData();
    document.getElementById('communityModal').style.display = 'block';
}

function switchModalTab(tab) {
    const modal = event.target.closest('.modal');
    modal.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
    modal.querySelector(`.modal-tab[data-tab="${tab}"]`).classList.add('active');
    modal.querySelector(`#${tab}Tab`).classList.add('active');
}

function loadCommunityData() {
    // Cargar usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        if (user.id !== state.currentUser.id) {
            const userEl = document.createElement('div');
            userEl.className = 'saved-table';
            userEl.innerHTML = `
                <div class="saved-table-title">${user.username}</div>
                <div class="saved-table-actions">
                    <span>${(user.tables || []).filter(t => t.isPublic).length} tablas</span>
                </div>
            `;
            
            userEl.addEventListener('click', () => showUserProfile(user.id));
            usersList.appendChild(userEl);
        }
    });
    
    // Cargar tablas públicas
    const publicTables = [];
    users.forEach(user => {
        if (user.tables) {
            user.tables.filter(t => t.isPublic).forEach(table => {
                publicTables.push({...table, authorId: user.id});
            });
        }
    });
    
    const publicTablesList = document.getElementById('publicTablesList');
    publicTablesList.innerHTML = '';
    
    if (publicTables.length === 0) {
        publicTablesList.innerHTML = '<p style="padding: 1rem; text-align: center;">No hay tablas públicas disponibles.</p>';
    } else {
        publicTables.forEach(table => {
            const tableEl = document.createElement('div');
            tableEl.className = 'saved-table';
            tableEl.innerHTML = `
                <div class="saved-table-title">${table.name}</div>
                <div class="saved-table-actions">
                    <span>por ${table.author}</span>
                </div>
            `;
            
            tableEl.addEventListener('click', () => viewTable(table));
            publicTablesList.appendChild(tableEl);
        });
    }
}

function showUserProfile(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('userTablesCount').textContent = (user.tables || []).length;
        
        // Calcular rating (simulado)
        const rating = Math.floor(Math.random() * 5) + 1;
        document.getElementById('userRating').textContent = rating;
        
        // Mostrar tablas públicas
        const publicTablesContainer = document.getElementById('userPublicTables');
        publicTablesContainer.innerHTML = '';
        
        const publicTables = (user.tables || []).filter(t => t.isPublic);
        
        if (publicTables.length === 0) {
            publicTablesContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Este usuario no tiene tablas públicas.</p>';
        } else {
            publicTables.forEach(table => {
                const tableEl = document.createElement('div');
                tableEl.className = 'saved-table';
                tableEl.innerHTML = `
                    <div class="saved-table-title">${table.name}</div>
                    <div class="saved-table-actions">
                        <span>${table.products.length} productos</span>
                    </div>
                `;
                
                tableEl.addEventListener('click', () => viewTable({...table, authorId: user.id}));
                publicTablesContainer.appendChild(tableEl);
            });
        }
        
        document.getElementById('communityModal').style.display = 'none';
        document.getElementById('userProfileModal').style.display = 'block';
    }
}

function viewTable(table) {
    document.getElementById('viewTableName').textContent = table.name;
    document.getElementById('viewTableAuthor').textContent = table.author;
    
    // Renderizar tabla
    const tbody = document.getElementById('viewTableBody');
    tbody.innerHTML = '';
    
    table.products.forEach(product => {
        const row = document.createElement('tr');
        
        // Celda de nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        row.appendChild(nameCell);
        
        // Celdas de dosificación
        for (let week = 0; week < 10; week++) {
            const cell = document.createElement('td');
            cell.textContent = product.dosage[week] || '-';
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    });
    
    // Guardar referencia para copiar o calificar
    state.viewingTable = table;
    
    // Cerrar modales anteriores
    document.getElementById('communityModal').style.display = 'none';
    document.getElementById('userProfileModal').style.display = 'none';
    
    // Mostrar modal
    document.getElementById('viewTableModal').style.display = 'block';
}

function copyTableToMine() {
    if (state.viewingTable) {
        const tableCopy = JSON.parse(JSON.stringify(state.viewingTable));
        delete tableCopy.authorId;
        tableCopy.id = Date.now().toString();
        tableCopy.name = `Copia de ${tableCopy.name}`;
        tableCopy.author = state.currentUser.username;
        tableCopy.isPublic = false;
        
        state.userTables.push(tableCopy);
        saveUserTables();
        
        document.getElementById('viewTableModal').style.display = 'none';
        showNotification('Tabla copiada a tus tablas', 'success');
    }
}

function filterUsers() {
    const query = document.getElementById('userSearchInput').value.toLowerCase();
    const users = document.querySelectorAll('#usersList .saved-table');
    
    users.forEach(user => {
        const name = user.querySelector('.saved-table-title').textContent.toLowerCase();
        user.style.display = name.includes(query) ? '' : 'none';
    });
}

function filterPublicTables() {
    const query = document.getElementById('tableSearchInput').value.toLowerCase();
    const tables = document.querySelectorAll('#publicTablesList .saved-table');
    
    tables.forEach(table => {
        const name = table.querySelector('.saved-table-title').textContent.toLowerCase();
        table.style.display = name.includes(query) ? '' : 'none';
    });
}

// ========== CALIFICACIONES ==========

function showRatingModal() {
    resetRating();
    document.getElementById('ratingComment').value = '';
    document.getElementById('viewTableModal').style.display = 'none';
    document.getElementById('rateTableModal').style.display = 'block';
}

let currentRating = 0;

function setRating(rating) {
    currentRating = parseInt(rating);
    document.getElementById('ratingValue').textContent = currentRating;
    updateStars(currentRating);
}

function previewRating(rating) {
    updateStars(parseInt(rating));
}

function resetRatingPreview() {
    updateStars(currentRating);
}

function updateStars(rating) {
    document.querySelectorAll('.star-rating i').forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function resetRating() {
    currentRating = 0;
    document.getElementById('ratingValue').textContent = '0';
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('active');
    });
}

function submitRating() {
    if (!currentRating) {
        showNotification('Por favor selecciona una calificación', 'warning');
        return;
    }
    
    // En una app real, esto enviaría la calificación a un servidor
    const comment = document.getElementById('ratingComment').value;
    
    // Simular guardado
    setTimeout(() => {
        document.getElementById('rateTableModal').style.display = 'none';
        showNotification('¡Gracias por tu calificación!', 'success');
    }, 500);
}

// ========== UTILIDADES ==========

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('active');
    
    notificationText.textContent = message;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function resetState() {
    state.selectedProducts = {};
    state.currentTable = { id: null, name: '', products: [], isPublic: false, notes: {} };
    state.userTables = [];
    state.customProducts = {};
    document.getElementById('tableCard').classList.add('hidden');
}

// Iniciar la app
init();