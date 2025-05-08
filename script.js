document.addEventListener('DOMContentLoaded', () => {
  // Constantes y variables globales
  const LS_PREFIX = 'chechu_';
  const XP_PER_LEVEL = 100;
  const LEAGUES = [
    { name: 'Bronce', icon: 'seedling', minLevel: 1, maxLevel: 2 },
    { name: 'Plata', icon: 'leaf', minLevel: 3, maxLevel: 4 },
    { name: 'Oro', icon: 'cannabis', minLevel: 5, maxLevel: 6 },
    { name: 'Platino', icon: 'gem', minLevel: 7, maxLevel: 8 },
    { name: 'Diamante', icon: 'crown', minLevel: 9, maxLevel: 10 }
  ];
  
  let user = loadUser() || { name: '', level: 1, xp: 0, tables: [], completedTables: [] };
  let editingTableIndex = -1;
  
  // Elementos DOM
  const dom = {
    welcome: document.getElementById('welcomeScreen'),
    app: document.getElementById('appContent'),
    username: {
      input: document.getElementById('usernameInput'),
      display: document.getElementById('usernameDisplay'),
      profile: document.getElementById('profileUsernameInput')
    },
    level: {
      display: document.getElementById('userLevelDisplay'),
      profile: document.getElementById('profileLevel'),
      xpBar: document.getElementById('profileXpBar'),
      xp: document.getElementById('profileXp')
    },
    league: {
      icon: document.getElementById('userLeagueIcon'),
      profileIcon: document.getElementById('profileLeagueIcon'),
      name: document.getElementById('profileLeague')
    },
    stats: {
      completed: document.getElementById('profileCompletedCultivos')
    },
    tables: {
      active: document.getElementById('activeTablesList'),
      completed: document.getElementById('completedTablesList'),
      modalActive: document.getElementById('modalActiveTablesList'),
      modalCompleted: document.getElementById('modalCompletedTablesList')
    },
    modals: {
      addCategory: document.getElementById('addCategoryModal'),
      customProduct: document.getElementById('customProductModal'),
      table: document.getElementById('tableCard'),
      viewTable: document.getElementById('viewTableModal'),
      viewCompleted: document.getElementById('viewCompletedTableModal'),
      editTable: document.getElementById('editTableModal'),
      profile: document.getElementById('userProfileModal'),
      myTables: document.getElementById('myTablesModal'),
      levelUp: document.getElementById('levelUpModal')
    },
    creators: {
      weeksInput: document.getElementById('weeksNumber'),
      categoryOptions: document.querySelectorAll('.product-options'),
      newCategoryName: document.getElementById('newCategoryName'),
      customProductName: document.getElementById('customProductName'),
      customProductCategory: document.getElementById('customProductCategory'),
      customProductUnit: document.getElementById('customProductUnit'),
      tableName: document.getElementById('tableNameInput'),
      tableHeader: document.getElementById('tableHeader'),
      tableBody: document.getElementById('tableBody')
    },
    viewers: {
      tableName: document.getElementById('viewTableName'),
      tableHeader: document.getElementById('viewTableHeader'),
      tableBody: document.getElementById('viewTableBody'),
      completedName: document.getElementById('viewCompletedTableName'),
      completedHeader: document.getElementById('viewCompletedTableHeader'),
      completedBody: document.getElementById('viewCompletedTableBody')
    },
    editors: {
      tableName: document.getElementById('editTableNameInput'),
      tableHeader: document.getElementById('editTableHeader'),
      tableBody: document.getElementById('editTableBody')
    },
    levelUp: {
      icon: document.getElementById('levelUpIcon'),
      level: document.getElementById('newLevel'),
      leagueMsg: document.getElementById('newLeagueMessage'),
      league: document.getElementById('newLeague')
    },
    loader: document.getElementById('loader'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText')
  };
  
  // Inicialización
  initApp();
  
  function initApp() {
    if (user.name) {
      showApp();
      updateUI();
    } else {
      dom.welcome.classList.remove('hidden');
    }
    setupEventListeners();
  }
  
  // Funciones principales
  function setupEventListeners() {
    // Eventos de bienvenida
    document.getElementById('startAppBtn').addEventListener('click', startApp);
    
    // Botones principales
    document.getElementById('showProfileBtn').addEventListener('click', () => openModal(dom.modals.profile));
    document.getElementById('showTablesBtn').addEventListener('click', () => {
      updateTablesLists();
      openModal(dom.modals.myTables);
    });
    
    // Eventos de creación de tablas
    document.querySelectorAll('.btn-add-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.creators.customProductCategory.value = btn.dataset.category;
        openModal(dom.modals.customProduct);
      });
    });
    
    document.getElementById('addCategoryBtn').addEventListener('click', () => openModal(dom.modals.addCategory));
    document.getElementById('createTableBtn').addEventListener('click', generateTable);
    document.getElementById('saveTableBtn').addEventListener('click', saveTable);
    document.getElementById('closeTableBtn').addEventListener('click', () => closeModal(dom.modals.table));
    
    // Modales: Gestión de categorías y productos
    document.getElementById('saveCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('saveCustomProductBtn').addEventListener('click', addCustomProduct);
    
    // Modales: Ver tabla
    document.getElementById('editTableBtn').addEventListener('click', editTable);
    document.getElementById('completeTableBtn').addEventListener('click', completeTable);
    document.getElementById('deleteTableBtn').addEventListener('click', deleteTable);
    
    // Modales: Editar tabla
    document.getElementById('updateTableBtn').addEventListener('click', updateTable);
    document.getElementById('cancelEditBtn').addEventListener('click', () => closeModal(dom.modals.editTable));
    
    // Modales: Tabla completada
    document.getElementById('closeCompletedTableBtn').addEventListener('click', () => closeModal(dom.modals.viewCompleted));
    
    // Modal de perfil
    document.getElementById('saveUsernameBtn').addEventListener('click', saveUsername);
    
    // Modal de tablas
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Modal de nivel subido
    document.getElementById('closeLevelUpBtn').addEventListener('click', () => closeModal(dom.modals.levelUp));
    
    // Cerrar todos los modales con el botón X
    document.querySelectorAll('.close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });
  }
  
  function startApp() {
    const username = dom.username.input.value.trim();
    if (!username) {
      showNotification('Por favor, introduce un nombre');
      return;
    }
    
    user.name = username;
    saveUser();
    showApp();
    updateUI();
  }
  
  function showApp() {
    dom.welcome.classList.add('hidden');
    dom.app.classList.remove('hidden');
  }
  
  function updateUI() {
    // Actualizar información de usuario
    dom.username.display.textContent = user.name;
    dom.username.profile.value = user.name;
    dom.level.display.textContent = `Nivel ${user.level}`;
    dom.level.profile.textContent = user.level;
    
    // Calcular y mostrar XP
    const xpForNextLevel = user.level * XP_PER_LEVEL;
    const progress = (user.xp / xpForNextLevel) * 100;
    dom.level.xpBar.style.width = `${progress}%`;
    dom.level.xp.textContent = `${user.xp}/${xpForNextLevel} XP`;
    
    // Actualizar liga
    const currentLeague = getCurrentLeague();
    dom.league.name.textContent = currentLeague.name;
    updateLeagueIcon(dom.league.icon, currentLeague.icon);
    updateLeagueIcon(dom.league.profileIcon, currentLeague.icon);
    
    // Actualizar ligas en perfil
    document.querySelectorAll('.league-item').forEach((item, index) => {
      item.classList.toggle('active', index === currentLeague.index);
    });
    
    // Actualizar estadísticas
    dom.stats.completed.textContent = user.completedTables.length;
    
    // Actualizar listas de tablas
    updateTablesLists();
  }
  
  function updateTablesLists() {
    updateTablesList(dom.tables.active, dom.tables.modalActive, user.tables, showTableView);
    updateTablesList(dom.tables.completed, dom.tables.modalCompleted, user.completedTables, showCompletedTableView);
  }
  
  function updateTablesList(mainContainer, modalContainer, tablesList, clickHandler) {
    // Limpiar contenedores
    mainContainer.innerHTML = '';
    modalContainer.innerHTML = '';
    
    if (tablesList.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      
      const icon = document.createElement('i');
      icon.className = tablesList === user.tables ? 'fas fa-leaf' : 'fas fa-award';
      
      const text = document.createElement('p');
      text.textContent = tablesList === user.tables 
        ? 'No tienes tablas en progreso' 
        : 'No tienes cultivos completados aún';
      
      emptyState.appendChild(icon);
      emptyState.appendChild(text);
      
      mainContainer.appendChild(emptyState.cloneNode(true));
      modalContainer.appendChild(emptyState);
      return;
    }
    
    // Crear tarjetas para cada tabla
    tablesList.forEach((table, index) => {
      const card = createTableCard(table, index, clickHandler);
      mainContainer.appendChild(card.cloneNode(true));
      modalContainer.appendChild(card);
    });
    
    // Añadir eventos a las tarjetas
    document.querySelectorAll('.table-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        const isCompleted = card.dataset.completed === 'true';
        
        if (isCompleted) {
          showCompletedTableView(index);
        } else {
          showTableView(index);
        }
      });
    });
  }
  
  function createTableCard(table, index, clickHandler) {
    const card = document.createElement('div');
    card.className = 'table-card';
    card.dataset.index = index;
    card.dataset.completed = table.completed ? 'true' : 'false';
    
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('h3');
    title.textContent = table.name || 'Tabla sin nombre';
    
    const icon = document.createElement('i');
    icon.className = table.completed ? 'fas fa-check-circle' : 'fas fa-seedling';
    
    header.appendChild(icon);
    header.appendChild(title);
    card.appendChild(header);
    
    if (table.completed) {
      const badge = document.createElement('div');
      badge.className = 'completed-badge-small';
      badge.innerHTML = '<i class="fas fa-check"></i> Completado';
      card.appendChild(badge);
    }
    
    return card;
  }
  
  // Funciones para tablas
  function generateTable() {
    const weeks = parseInt(dom.creators.weeksInput.value) || 10;
    const selectedProducts = [];
    
    // Recoger productos seleccionados
    dom.creators.categoryOptions.forEach(category => {
      const categoryName = category.dataset.category;
      const checkboxes = category.querySelectorAll('input[type="checkbox"]:checked');
      
      checkboxes.forEach(checkbox => {
        selectedProducts.push({
          name: checkbox.value,
          category: categoryName,
          unit: categoryName === 'tamano' && checkbox.value === 'Monster Bloom' ? 'g/L' : 'ml/L',
          values: Array(weeks).fill(0)
        });
      });
    });
    
    // Verificar si hay productos seleccionados
    if (selectedProducts.length === 0) {
      showNotification('Selecciona al menos un producto');
      return;
    }
    
    // Generar encabezados de tabla
    let headerRow = '<tr><th>Producto</th>';
    for (let i = 1; i <= weeks; i++) {
      headerRow += `<th>Sem ${i}</th>`;
    }
    headerRow += '</tr>';
    dom.creators.tableHeader.innerHTML = headerRow;
    
    // Generar filas de tabla
    let tableContent = '';
    selectedProducts.forEach((product, index) => {
      tableContent += `<tr data-product-index="${index}">
        <td>${product.name} (${product.unit})</td>`;
      
      for (let i = 0; i < weeks; i++) {
        tableContent += `<td><input type="number" min="0" max="100" step="0.1" value="0"></td>`;
      }
      
      tableContent += '</tr>';
    });
    
    dom.creators.tableBody.innerHTML = tableContent;
    dom.creators.tableName.value = '';
    
    openModal(dom.modals.table);
  }
  
  function saveTable() {
    const tableName = dom.creators.tableName.value.trim() || `Tabla ${user.tables.length + 1}`;
    const products = [];
    
    // Recoger productos y valores
    const rows = dom.creators.tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const productText = cells[0].textContent;
      
      const name = productText.substring(0, productText.lastIndexOf('(')).trim();
      const unit = productText.substring(productText.lastIndexOf('(') + 1, productText.lastIndexOf(')')).trim();
      
      const values = [];
      for (let i = 1; i < cells.length; i++) {
        const input = cells[i].querySelector('input');
        values.push(parseFloat(input.value) || 0);
      }
      
      products.push({ name, unit, values });
    });
    
    // Crear nueva tabla
    const newTable = {
      name: tableName,
      weeks: products[0].values.length,
      products,
      completed: false,
      date: new Date().toISOString()
    };
    
    // Guardar tabla
    user.tables.push(newTable);
    saveUser();
    updateTablesLists();
    closeModal(dom.modals.table);
    showNotification('Tabla guardada correctamente');
    
    // Añadir XP
    addXP(10);
  }
  
  function showTableView(index) {
    const table = user.tables[index];
    if (!table) return;
    
    editingTableIndex = index;
    dom.viewers.tableName.textContent = table.name;
    
    // Generar encabezados
    let headerRow = '<tr><th>Producto</th>';
    for (let i = 1; i <= table.weeks; i++) {
      headerRow += `<th>Sem ${i}</th>`;
    }
    headerRow += '</tr>';
    dom.viewers.tableHeader.innerHTML = headerRow;
    
    // Generar filas
    let tableContent = '';
    table.products.forEach(product => {
      tableContent += `<tr>
        <td>${product.name} (${product.unit})</td>`;
      
      product.values.forEach(value => {
        tableContent += `<td>${value}</td>`;
      });
      
      tableContent += '</tr>';
    });
    
    dom.viewers.tableBody.innerHTML = tableContent;
    openModal(dom.modals.viewTable);
  }
  
  function showCompletedTableView(index) {
    const table = user.completedTables[index];
    if (!table) return;
    
    dom.viewers.completedName.textContent = table.name;
    
    // Generar encabezados
    let headerRow = '<tr><th>Producto</th>';
    for (let i = 1; i <= table.weeks; i++) {
      headerRow += `<th>Sem ${i}</th>`;
    }
    headerRow += '</tr>';
    dom.viewers.completedHeader.innerHTML = headerRow;
    
    // Generar filas
    let tableContent = '';
    table.products.forEach(product => {
      tableContent += `<tr>
        <td>${product.name} (${product.unit})</td>`;
      
      product.values.forEach(value => {
        tableContent += `<td>${value}</td>`;
      });
      
      tableContent += '</tr>';
    });
    
    dom.viewers.completedBody.innerHTML = tableContent;
    openModal(dom.modals.viewCompleted);
  }
  
  function editTable() {
    const table = user.tables[editingTableIndex];
    if (!table) return;
    
    dom.editors.tableName.value = table.name;
    
    // Generar encabezados
    let headerRow = '<tr><th>Producto</th>';
    for (let i = 1; i <= table.weeks; i++) {
      headerRow += `<th>Sem ${i}</th>`;
    }
    headerRow += '</tr>';
    dom.editors.tableHeader.innerHTML = headerRow;
    
    // Generar filas
    let tableContent = '';
    table.products.forEach((product, productIndex) => {
      tableContent += `<tr data-product-index="${productIndex}">
        <td>${product.name} (${product.unit})</td>`;
      
      product.values.forEach((value, weekIndex) => {
        tableContent += `<td><input type="number" min="0" max="100" step="0.1" value="${value}"></td>`;
      });
      
      tableContent += '</tr>';
    });
    
    dom.editors.tableBody.innerHTML = tableContent;
    closeModal(dom.modals.viewTable);
    openModal(dom.modals.editTable);
  }
  
  function updateTable() {
    const table = user.tables[editingTableIndex];
    if (!table) return;
    
    table.name = dom.editors.tableName.value.trim() || table.name;
    
    // Actualizar valores
    const rows = dom.editors.tableBody.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const product = table.products[rowIndex];
      const inputs = row.querySelectorAll('input');
      
      inputs.forEach((input, weekIndex) => {
        product.values[weekIndex] = parseFloat(input.value) || 0;
      });
    });
    
    saveUser();
    updateTablesLists();
    closeModal(dom.modals.editTable);
    showNotification('Tabla actualizada correctamente');
  }
  
  function completeTable() {
    const table = user.tables[editingTableIndex];
    if (!table) return;
    
    // Mover a completadas
    table.completed = true;
    table.completionDate = new Date().toISOString();
    user.completedTables.push(table);
    user.tables.splice(editingTableIndex, 1);
    
    saveUser();
    updateTablesLists();
    closeModal(dom.modals.viewTable);
    showNotification('¡Cultivo completado! Has ganado 50 XP');
    
    // Añadir XP
    addXP(50);
  }
  
  function deleteTable() {
    if (confirm('¿Estás seguro de eliminar esta tabla?')) {
      user.tables.splice(editingTableIndex, 1);
      saveUser();
      updateTablesLists();
      closeModal(dom.modals.viewTable);
      showNotification('Tabla eliminada');
    }
  }
  
  // Funciones para categorías y productos
  function addCategory() {
    const categoryName = dom.creators.newCategoryName.value.trim();
    if (!categoryName) {
      showNotification('Introduce un nombre para la categoría');
      return;
    }
    
    // Crear nueva categoría
    const productSelector = document.querySelector('.product-selector');
    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '');
    
    const category = document.createElement('div');
    category.className = 'product-category';
    category.innerHTML = `
      <h3><i class="fas fa-folder"></i> ${categoryName}</h3>
      <div class="product-options" data-category="${categoryId}"></div>
      <button class="btn-add-custom" data-category="${categoryId}">
          <i class="fas fa-plus-circle"></i> Añadir personalizado
      </button>
    `;
    
    productSelector.appendChild(category);
    
    // Añadir evento al botón
    const addButton = category.querySelector('.btn-add-custom');
    addButton.addEventListener('click', () => {
      dom.creators.customProductCategory.value = categoryId;
      openModal(dom.modals.customProduct);
    });
    
    closeModal(dom.modals.addCategory);
    dom.creators.newCategoryName.value = '';
    showNotification(`Categoría ${categoryName} añadida`);
  }
  
  function addCustomProduct() {
    const productName = dom.creators.customProductName.value.trim();
    const category = dom.creators.customProductCategory.value;
    const unit = dom.creators.customProductUnit.value;
    
    if (!productName || !category) {
      showNotification('Introduce un nombre para el producto');
      return;
    }
    
    // Buscar contenedor de categoría
    const categoryContainer = document.querySelector(`.product-options[data-category="${category}"]`);
    if (!categoryContainer) return;
    
    // Crear nuevo producto
    const productOption = document.createElement('label');
    productOption.className = 'product-option';
    productOption.innerHTML = `
      <input type="checkbox" name="${category}" value="${productName}">
      <span class="product-icon"><i class="fas fa-flask"></i></span>
      <span>${productName}</span>
    `;
    
    categoryContainer.appendChild(productOption);
    closeModal(dom.modals.customProduct);
    dom.creators.customProductName.value = '';
    showNotification(`Producto ${productName} añadido`);
  }
  
  // Funciones para el perfil de usuario
  function saveUsername() {
    const newName = dom.username.profile.value.trim();
    if (!newName) {
      showNotification('El nombre no puede estar vacío');
      return;
    }
    
    user.name = newName;
    saveUser();
    updateUI();
    showNotification('Nombre actualizado');
  }
  
  function addXP(amount) {
    const oldLevel = user.level;
    user.xp += amount;
    
    // Comprobar si sube de nivel
    const xpForNextLevel = user.level * XP_PER_LEVEL;
    if (user.xp >= xpForNextLevel) {
      user.xp -= xpForNextLevel;
      user.level++;
      
      // Mostrar modal de subida de nivel
      showLevelUpModal(oldLevel);
    }
    
    saveUser();
    updateUI();
  }
  
  function showLevelUpModal(oldLevel) {
    const oldLeague = getLeagueByLevel(oldLevel);
    const newLeague = getCurrentLeague();
    
    dom.levelUp.level.textContent = `Nivel ${user.level}`;
    
    // Comprobar si ha cambiado de liga
    if (oldLeague.index !== newLeague.index) {
      dom.levelUp.leagueMsg.classList.remove('hidden');
      dom.levelUp.league.textContent = newLeague.name;
      updateLeagueIcon(dom.levelUp.icon, newLeague.icon);
    } else {
      dom.levelUp.leagueMsg.classList.add('hidden');
      updateLeagueIcon(dom.levelUp.icon, newLeague.icon);
    }
    
    openModal(dom.modals.levelUp);
  }
  
  // Funciones auxiliares
  function getCurrentLeague() {
    return getLeagueByLevel(user.level);
  }
  
  function getLeagueByLevel(level) {
    for (let i = 0; i < LEAGUES.length; i++) {
      if (level >= LEAGUES[i].minLevel && level <= LEAGUES[i].maxLevel) {
        return { ...LEAGUES[i], index: i };
      }
    }
    return { ...LEAGUES[LEAGUES.length - 1], index: LEAGUES.length - 1 };
  }
  
  function updateLeagueIcon(element, iconClass) {
    element.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
  }
  
  function switchTab(tabId) {
    // Activar pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Mostrar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }
  
  function openModal(modal) {
    closeAllModals();
    modal.classList.add('active');
  }
  
  function closeModal(modal) {
    modal.classList.remove('active');
  }
  
  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  function showNotification(message) {
    dom.notificationText.textContent = message;
    dom.notification.classList.add('show');
    
    setTimeout(() => {
      dom.notification.classList.remove('show');
    }, 3000);
  }
  
  function showLoader() {
    dom.loader.classList.remove('hidden');
  }
  
  function hideLoader() {
    dom.loader.classList.add('hidden');
  }
  
  // Funciones de almacenamiento
  function saveUser() {
    localStorage.setItem(`${LS_PREFIX}user`, JSON.stringify(user));
  }
  
  function loadUser() {
    const data = localStorage.getItem(`${LS_PREFIX}user`);
    return data ? JSON.parse(data) : null;
  }
});