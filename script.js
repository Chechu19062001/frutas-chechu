// PROYECTO CHECHU - TRAP EDITION JS
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM principales
    const authScreen = document.getElementById('authScreen');
    const appContent = document.getElementById('appContent');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const loginTab = document.querySelector('[data-tab="login"]');
    const registerTab = document.querySelector('[data-tab="register"]');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const createTableBtn = document.getElementById('createTableBtn');
    const tableCard = document.getElementById('tableCard');
    const saveTableBtn = document.getElementById('saveTableBtn');
    const createNewTableBtn = document.getElementById('createNewTableBtn');
    const showSavedTablesBtn = document.getElementById('showSavedTablesBtn');
    const savedTablesModal = document.getElementById('savedTablesModal');
    const savedTablesList = document.getElementById('savedTablesList');
    const notesModal = document.getElementById('notesModal');
    const customProductModal = document.getElementById('customProductModal');
    const addCustomButtons = document.querySelectorAll('.btn-add-custom');
    const saveCustomProductBtn = document.getElementById('saveCustomProductBtn');
    const tableNameInput = document.getElementById('tableNameInput');

    // Variables globales
    let currentUser = null;
    let currentTableId = null;
    let currentNoteWeek = null;
    let currentNoteProduct = null;
    let currentCustomCategory = null;

    // ==================== SISTEMA DE AUTENTICACIÓN ====================
    
    // Inicializar el sistema de autenticación
    function initAuth() {
        // Cargar usuario del localStorage si existe
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showApp();
        } else {
            showAuth();
        }

        // Event listeners para la autenticación
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });

        // Login
        loginButton.addEventListener('click', () => {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            if (!username || !password) {
                showNotification('Por favor, completa todos los campos', 'error');
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                showApp();
                showNotification(`¡Bienvenido de nuevo, ${username}!`, 'success');
            } else {
                showNotification('Usuario o contraseña incorrectos', 'error');
            }
        });

        // Registro
        registerButton.addEventListener('click', () => {
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            
            if (!username || !password || !confirmPassword) {
                showNotification('Por favor, completa todos los campos', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }

            const users = getUsers();
            if (users.some(u => u.username === username)) {
                showNotification('Este nombre de usuario ya existe', 'error');
                return;
            }

            // Crear nuevo usuario
            const newUser = {
                username,
                password,
                tables: [],
                customProducts: []
            };

            users.push(newUser);
            saveUsers(users);
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            showApp();
            showNotification(`¡Cuenta creada con éxito, ${username}!`, 'success');
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            currentUser = null;
            showAuth();
            showNotification('Has cerrado sesión correctamente', 'success');
        });
    }

    // Obtener usuarios del localStorage
    function getUsers() {
        const users = localStorage.getItem('proyectoChechu_users');
        return users ? JSON.parse(users) : [];
    }

    // Guardar usuarios en localStorage
    function saveUsers(users) {
        localStorage.setItem('proyectoChechu_users', JSON.stringify(users));
    }

    // Mostrar pantalla de autenticación
    function showAuth() {
        authScreen.classList.remove('hidden');
        appContent.classList.add('hidden');
        // Resetear campos
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    // Mostrar aplicación principal
    function showApp() {
        authScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
        tableCard.classList.add('hidden');
        usernameDisplay.textContent = currentUser.username;
        
        // Actualizar UI con los productos personalizados del usuario
        loadCustomProducts();
    }

    // ==================== PRODUCTOS PERSONALIZADOS ====================
    
    // Cargar productos personalizados
    function loadCustomProducts() {
        if (!currentUser.customProducts) {
            currentUser.customProducts = [];
        }

        // Limpiar productos personalizados anteriores
        document.querySelectorAll('.custom-product').forEach(el => el.remove());

        // Añadir productos personalizados para cada categoría
        currentUser.customProducts.forEach(product => {
            const categoryContainer = document.querySelector(`.product-options[data-category="${product.category}"]`);
            
            if (categoryContainer) {
                const productOption = document.createElement('label');
                productOption.className = 'product-option custom-product';
                
                productOption.innerHTML = `
                    <input type="radio" name="${product.category}" value="${product.name}">
                    <span class="product-icon"><i class="fas fa-flask"></i></span>
                    <span>${product.name}</span>
                `;
                
                categoryContainer.appendChild(productOption);
            }
        });

        // Volver a añadir event listeners a todas las opciones de productos
        document.querySelectorAll('.product-option').forEach(option => {
            option.addEventListener('click', function() {
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    
                    // Desmarcar otras opciones en la misma categoría
                    const categoryOptions = document.querySelectorAll(`input[name="${radio.name}"]`);
                    categoryOptions.forEach(opt => {
                        opt.closest('.product-option').classList.remove('selected');
                    });
                    
                    // Marcar esta opción como seleccionada
                    this.classList.add('selected');
                }
            });
        });
    }

    // Event listeners para añadir productos personalizados
    function initCustomProducts() {
        // Botones para añadir producto personalizado
        addCustomButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentCustomCategory = this.dataset.category;
                
                // Actualizar selector de categoría en el modal
                const categorySelect = document.getElementById('customProductCategory');
                categorySelect.value = currentCustomCategory;
                
                // Mostrar modal
                openModal(customProductModal);
            });
        });

        // Guardar producto personalizado
        saveCustomProductBtn.addEventListener('click', function() {
            const productName = document.getElementById('customProductName').value.trim();
            const productCategory = document.getElementById('customProductCategory').value;
            
            if (!productName || !productCategory) {
                showNotification('Por favor, completa todos los campos', 'error');
                return;
            }

            // Comprobar si ya existe
            if (!currentUser.customProducts) {
                currentUser.customProducts = [];
            }
            
            if (currentUser.customProducts.some(p => p.name === productName && p.category === productCategory)) {
                showNotification('Este producto ya existe', 'error');
                return;
            }

            // Añadir nuevo producto
            currentUser.customProducts.push({
                name: productName,
                category: productCategory
            });

            // Actualizar usuario en localStorage
            updateCurrentUser();
            
            // Actualizar UI
            loadCustomProducts();
            
            // Cerrar modal y mostrar notificación
            closeModal(customProductModal);
            document.getElementById('customProductName').value = '';
            showNotification(`Producto "${productName}" añadido correctamente`, 'success');
        });
    }

    // ==================== TABLAS DE ABONADO ====================
    
    // Inicializar manejo de tablas
    function initTables() {
        // Botón para crear tabla
        createTableBtn.addEventListener('click', function() {
            // Verificar si hay productos seleccionados
            const selectedProducts = getSelectedProducts();
            
            if (selectedProducts.length === 0) {
                showNotification('Selecciona al menos un producto', 'error');
                return;
            }

            // Mostrar tarjeta de tabla
            tableCard.classList.remove('hidden');
            
            // Generar tabla
            generateTable(selectedProducts);
            
            // Scroll hacia la tabla
            tableCard.scrollIntoView({ behavior: 'smooth' });
        });

        // Botón para guardar tabla
        saveTableBtn.addEventListener('click', function() {
            const tableName = tableNameInput.value.trim();
            
            if (!tableName) {
                showNotification('Introduce un nombre para la tabla', 'error');
                return;
            }

            // Obtener datos de la tabla
            const tableData = {
                id: currentTableId || Date.now().toString(),
                name: tableName,
                products: getTableData()
            };

            // Guardar tabla
            if (currentTableId) {
                // Actualizar tabla existente
                const tableIndex = currentUser.tables.findIndex(t => t.id === currentTableId);
                if (tableIndex !== -1) {
                    currentUser.tables[tableIndex] = tableData;
                    showNotification(`Tabla "${tableName}" actualizada correctamente`, 'success');
                }
            } else {
                // Crear nueva tabla
                if (!currentUser.tables) {
                    currentUser.tables = [];
                }
                currentUser.tables.push(tableData);
                showNotification(`Tabla "${tableName}" guardada correctamente`, 'success');
            }

            // Actualizar usuario en localStorage
            updateCurrentUser();
        });

        // Botón para crear nueva tabla
        createNewTableBtn.addEventListener('click', function() {
            resetTableForm();
            tableCard.classList.add('hidden');
            document.querySelector('.product-options').scrollIntoView({ behavior: 'smooth' });
        });

        // Botón para mostrar tablas guardadas
        showSavedTablesBtn.addEventListener('click', function() {
            loadSavedTables();
            openModal(savedTablesModal);
        });
    }

    // Obtener productos seleccionados
    function getSelectedProducts() {
        const selectedProducts = [];
        const categories = ['abono', 'azucar', 'estimulador', 'tamano'];
        
        categories.forEach(category => {
            const selectedRadio = document.querySelector(`input[name="${category}"]:checked`);
            if (selectedRadio) {
                selectedProducts.push({
                    name: selectedRadio.value,
                    category: category
                });
            }
        });
        
        return selectedProducts;
    }

    // Generar tabla de abonado
    function generateTable(products) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.dataset.product = product.name;
            
            // Celda del nombre del producto
            const nameCell = document.createElement('td');
            nameCell.textContent = product.name;
            row.appendChild(nameCell);
            
            // Celdas para cada semana (10 semanas)
            for (let i = 1; i <= 10; i++) {
                const cell = document.createElement('td');
                cell.className = 'dosage-cell';
                
                // Contenedor para el input y botón de notas
                const controls = document.createElement('div');
                controls.className = 'controls';
                
                // Input para la dosis
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'input-dosage';
                input.placeholder = '0 ml';
                input.dataset.week = i;
                input.dataset.product = product.name;
                
                // Botón para notas
                const notesBtn = document.createElement('button');
                notesBtn.className = 'btn-notes';
                notesBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
                notesBtn.dataset.week = i;
                notesBtn.dataset.product = product.name;
                
                notesBtn.addEventListener('click', function() {
                    openNotes(this.dataset.week, this.dataset.product);
                });
                
                controls.appendChild(input);
                controls.appendChild(notesBtn);
                cell.appendChild(controls);
                row.appendChild(cell);
            }
            
            tableBody.appendChild(row);
        });
    }

    // Obtener datos de la tabla actual
    function getTableData() {
        const products = [];
        const rows = document.querySelectorAll('#tableBody tr');
        
        rows.forEach(row => {
            const productName = row.dataset.product;
            const dosages = [];
            const notes = [];
            
            // Obtener dosis para cada semana
            const inputs = row.querySelectorAll('.input-dosage');
            inputs.forEach(input => {
                dosages.push({
                    week: parseInt(input.dataset.week),
                    value: input.value
                });
            });
            
            // Buscar notas guardadas para este producto
            if (currentTableId) {
                const tableData = currentUser.tables.find(t => t.id === currentTableId);
                if (tableData) {
                    const productData = tableData.products.find(p => p.name === productName);
                    if (productData && productData.notes) {
                        productData.notes.forEach(note => {
                            notes.push(note);
                        });
                    }
                }
            }
            
            products.push({
                name: productName,
                dosages: dosages,
                notes: notes
            });
        });
        
        return products;
    }

    // Cargar datos de una tabla existente
    function loadTable(tableId) {
        const table = currentUser.tables.find(t => t.id === tableId);
        
        if (!table) return;
        
        currentTableId = tableId;
        tableNameInput.value = table.name;
        
        // Desmarcar todos los productos
        document.querySelectorAll('.product-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('input[type="radio"]').checked = false;
        });
        
        // Marcar productos seleccionados en la tabla
        table.products.forEach(product => {
            const radio = document.querySelector(`input[value="${product.name}"]`);
            if (radio) {
                radio.checked = true;
                radio.closest('.product-option').classList.add('selected');
            }
        });
        
        // Generar tabla con los productos
        const products = table.products.map(p => ({
            name: p.name,
            category: getProductCategory(p.name)
        }));
        
        generateTable(products);
        
        // Llenar datos de dosis
        table.products.forEach(product => {
            product.dosages.forEach(dosage => {
                const input = document.querySelector(`.input-dosage[data-product="${product.name}"][data-week="${dosage.week}"]`);
                if (input) {
                    input.value = dosage.value;
                }
            });
        });
        
        // Mostrar tarjeta de tabla
        tableCard.classList.remove('hidden');
        tableCard.scrollIntoView({ behavior: 'smooth' });
    }

    // Obtener categoría de un producto
    function getProductCategory(productName) {
        // Buscar en productos predefinidos
        const categories = ['abono', 'azucar', 'estimulador', 'tamano'];
        for (const category of categories) {
            const radio = document.querySelector(`input[name="${category}"][value="${productName}"]`);
            if (radio) {
                return category;
            }
        }
        
        // Buscar en productos personalizados
        const customProduct = currentUser.customProducts.find(p => p.name === productName);
        return customProduct ? customProduct.category : '';
    }

    // Cargar lista de tablas guardadas
    function loadSavedTables() {
        const tablesList = document.getElementById('savedTablesList');
        tablesList.innerHTML = '';
        
        if (!currentUser.tables || currentUser.tables.length === 0) {
            tablesList.innerHTML = '<p>No tienes tablas guardadas</p>';
            return;
        }
        
        currentUser.tables.forEach(table => {
            const tableItem = document.createElement('div');
            tableItem.className = 'saved-table';
            
            tableItem.innerHTML = `
                <div class="saved-table-title">${table.name}</div>
                <div class="saved-table-actions">
                    <button class="edit-btn" data-id="${table.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${table.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Evento para cargar tabla
            tableItem.querySelector('.saved-table-title').addEventListener('click', function() {
                loadTable(table.id);
                closeModal(savedTablesModal);
            });
            
            // Evento para editar tabla
            tableItem.querySelector('.edit-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                loadTable(this.dataset.id);
                closeModal(savedTablesModal);
            });
            
            // Evento para eliminar tabla
            tableItem.querySelector('.delete-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`¿Seguro que quieres eliminar la tabla "${table.name}"?`)) {
                    deleteTable(this.dataset.id);
                }
            });
            
            tablesList.appendChild(tableItem);
        });
    }

    // Eliminar tabla
    function deleteTable(tableId) {
        currentUser.tables = currentUser.tables.filter(t => t.id !== tableId);
        updateCurrentUser();
        loadSavedTables();
        showNotification('Tabla eliminada correctamente', 'success');
    }

    // Resetear formulario de tabla
    function resetTableForm() {
        currentTableId = null;
        tableNameInput.value = '';
        
        // Desmarcar todos los productos
        document.querySelectorAll('.product-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('input[type="radio"]').checked = false;
        });
    }

    // ==================== NOTAS SEMANALES ====================
    
    // Abrir modal de notas
    function openNotes(week, product) {
        currentNoteWeek = week;
        currentNoteProduct = product;
        
        // Actualizar título del modal
        document.getElementById('weekNumber').textContent = week;
        
        // Cargar nota si existe
        let noteText = '';
        
        if (currentTableId) {
            const table = currentUser.tables.find(t => t.id === currentTableId);
            if (table) {
                const productData = table.products.find(p => p.name === product);
                if (productData && productData.notes) {
                    const note = productData.notes.find(n => n.week === parseInt(week));
                    if (note) {
                        noteText = note.text;
                    }
                }
            }
        }
        
        document.getElementById('weekNotes').value = noteText;
        
        // Mostrar modal
        openModal(notesModal);
    }

    // Guardar nota
    document.getElementById('saveNotesBtn').addEventListener('click', function() {
        const noteText = document.getElementById('weekNotes').value.trim();
        
        if (!currentTableId) {
            showNotification('Guarda la tabla primero para añadir notas', 'warning');
            closeModal(notesModal);
            return;
        }
        
        // Buscar tabla actual
        const tableIndex = currentUser.tables.findIndex(t => t.id === currentTableId);
        if (tableIndex === -1) {
            closeModal(notesModal);
            return;
        }
        
        // Buscar producto
        const productIndex = currentUser.tables[tableIndex].products.findIndex(p => p.name === currentNoteProduct);
        if (productIndex === -1) {
            closeModal(notesModal);
            return;
        }
        
        // Inicializar array de notas si no existe
        if (!currentUser.tables[tableIndex].products[productIndex].notes) {
            currentUser.tables[tableIndex].products[productIndex].notes = [];
        }
        
        // Buscar nota existente
        const noteIndex = currentUser.tables[tableIndex].products[productIndex].notes.findIndex(n => n.week === parseInt(currentNoteWeek));
        
        if (noteIndex !== -1) {
            // Actualizar nota existente
            currentUser.tables[tableIndex].products[productIndex].notes[noteIndex].text = noteText;
        } else {
            // Crear nueva nota
            currentUser.tables[tableIndex].products[productIndex].notes.push({
                week: parseInt(currentNoteWeek),
                text: noteText
            });
        }
        
        // Actualizar usuario en localStorage
        updateCurrentUser();
        
        closeModal(notesModal);
        showNotification('Nota guardada correctamente', 'success');
    });

    // ==================== UTILIDADES ====================
    
    // Actualizar usuario actual en localStorage
    function updateCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Actualizar lista de usuarios
        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            saveUsers(users);
        }
    }

    // Función para abrir modales
    function openModal(modal) {
        modal.style.display = 'block';
    }

    // Función para cerrar modales
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Event listeners para cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Mostrar notificaciones
    function showNotification(message, type = 'success') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'check-circle';
        if (type === 'error') icon = 'times-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Inicializar la aplicación
    initAuth();
    initCustomProducts();
    initTables();
});