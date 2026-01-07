// Funcionalidad del Panel de Administración

// Función para cargar el sidebar
function loadSidebar() {
    // Esta función se puede usar para cargar dinámicamente el sidebar si es necesario
    console.log('Sidebar loaded');
}

// Función para manejar el toggle de secciones del sidebar
function setupSidebarToggle() {
    document.querySelectorAll('.nav-section > a').forEach(section => {
        section.addEventListener('click', function(e) {
            e.preventDefault();
            this.parentElement.classList.toggle('active');
        });
    });
}

// Función para manejar el tema claro/oscuro
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (themeToggle && themeIcon) {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}

// Función para establecer la página activa en el sidebar
function setActivePage() {
    const currentPage = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-nav a[data-page]');
    
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '/index.html' && link.getAttribute('data-page') === 'dashboard')) {
            link.classList.add('active');
            
            // Expandir sección padre si es necesario
            const parentSection = link.closest('.nav-section');
            if (parentSection) {
                parentSection.classList.add('active');
            }
        }
    });
}

// Funciones específicas para la gestión de productos
function setupProductActions() {
    // Botón para agregar producto
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            // Mostrar un formulario simple para agregar producto
            const productName = prompt('Ingrese el nombre del nuevo producto:');
            if (productName) {
                alert(`Producto "${productName}" agregado correctamente`);
                // Aquí se implementaría la lógica real para agregar el producto
            }
        });
    }
    
    // Botones de ver producto
    const productTable = document.querySelector('table');
    if (productTable && productTable.querySelector('th:nth-child(2)')?.textContent === 'Nombre') {
        const viewButtons = productTable.querySelectorAll('.view-product');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productId = row.cells[0].textContent;
                const productName = row.cells[1].textContent;
                const productDescription = row.cells[2].textContent;
                const productPrice = row.cells[3].textContent;
                const productCategory = row.cells[4].textContent;
                
                // Mostrar detalles del producto en un alert
                const productDetails = `
DETALLES DEL PRODUCTO

ID: ${productId}
Nombre: ${productName}
Descripción: ${productDescription}
Precio: ${productPrice}
Categoría: ${productCategory}
                `.trim();
                
                alert(productDetails);
            });
        });
        
        // Botones de editar producto
        const editButtons = productTable.querySelectorAll('.edit-product');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productId = row.cells[0].textContent;
                const productName = row.cells[1].textContent;
                const productDescription = row.cells[2].textContent;
                const productPrice = row.cells[3].textContent;
                const productCategory = row.cells[4].textContent;
                
                // Mostrar un formulario simple para editar producto
                const newProductName = prompt('Editar nombre del producto:', productName);
                if (newProductName !== null) {
                    const newProductDescription = prompt('Editar descripción del producto:', productDescription);
                    if (newProductDescription !== null) {
                        const newProductPrice = prompt('Editar precio del producto:', productPrice);
                        if (newProductPrice !== null) {
                            const newProductCategory = prompt('Editar categoría del producto:', productCategory);
                            if (newProductCategory !== null) {
                                alert(`Producto ${productId} actualizado correctamente`);
                                // Aquí se implementaría la lógica real para actualizar el producto
                                // Actualizar la fila con los nuevos valores
                                row.cells[1].textContent = newProductName || productName;
                                row.cells[2].textContent = newProductDescription || productDescription;
                                row.cells[3].textContent = newProductPrice || productPrice;
                                row.cells[4].textContent = newProductCategory || productCategory;
                            }
                        }
                    }
                }
            });
        });
        
        // Botones de eliminar producto
        const deleteButtons = productTable.querySelectorAll('.delete-product');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productId = row.cells[0].textContent;
                const productName = row.cells[1].textContent;
                
                if (confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?`)) {
                    // Aquí se implementaría la lógica para eliminar el producto
                    row.remove();
                    alert(`Producto ${productId} eliminado correctamente`);
                }
            });
        });
    }
}

// Funciones específicas para la gestión de categorías
function setupCategoryActions() {
    // Botón para agregar categoría
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            // Mostrar un formulario simple para agregar categoría
            const categoryName = prompt('Ingrese el nombre de la nueva categoría:');
            if (categoryName) {
                alert(`Categoría "${categoryName}" agregada correctamente`);
                // Aquí se implementaría la lógica real para agregar la categoría
            }
        });
    }
    
    // Botones de editar categoría
    const categoryTable = document.querySelector('table');
    if (categoryTable && categoryTable.querySelector('th:nth-child(2)')?.textContent === 'Nombre') {
        const editButtons = categoryTable.querySelectorAll('.btn-secondary');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const categoryId = row.cells[0].textContent;
                const categoryName = row.cells[1].textContent;
                const categoryDescription = row.cells[2].textContent;
                
                // Mostrar un formulario simple para editar categoría
                const newCategoryName = prompt('Editar nombre de la categoría:', categoryName);
                if (newCategoryName !== null) {
                    alert(`Categoría ${categoryId} actualizada correctamente`);
                    // Aquí se implementaría la lógica real para actualizar la categoría
                    // Actualizar la fila con los nuevos valores
                    row.cells[1].textContent = newCategoryName || categoryName;
                }
            });
        });
    }
    
    // Botones de eliminar categoría
    const categoryTableDelete = document.querySelector('table');
    if (categoryTableDelete && categoryTableDelete.querySelector('th:nth-child(2)')?.textContent === 'Nombre') {
        const deleteButtons = categoryTableDelete.querySelectorAll('.btn-danger');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const categoryId = row.cells[0].textContent;
                const categoryName = row.cells[1].textContent;
                
                if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoryName}"?`)) {
                    // Aquí se implementaría la lógica para eliminar la categoría
                    row.remove();
                    alert(`Categoría ${categoryId} eliminada correctamente`);
                }
            });
        });
    }
}

// Funciones específicas para la gestión de descuentos
function setupDiscountActions() {
    // Botón para agregar descuento
    const addDiscountBtn = document.getElementById('addDiscountBtn');
    if (addDiscountBtn) {
        addDiscountBtn.addEventListener('click', function() {
            // Mostrar un formulario simple para agregar descuento
            const discountCode = prompt('Ingrese el código del nuevo descuento:');
            if (discountCode) {
                alert(`Descuento "${discountCode}" agregado correctamente`);
                // Aquí se implementaría la lógica real para agregar el descuento
            }
        });
    }
    
    // Botones de editar descuento
    const discountTable = document.querySelector('table');
    if (discountTable && discountTable.querySelector('th:nth-child(1)')?.textContent === 'Código') {
        const editButtons = discountTable.querySelectorAll('.btn-secondary');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const discountCode = row.cells[0].textContent;
                
                // Mostrar un formulario simple para editar descuento
                const newDiscountCode = prompt('Editar código del descuento:', discountCode);
                if (newDiscountCode !== null) {
                    alert(`Descuento ${discountCode} actualizado correctamente`);
                    // Aquí se implementaría la lógica real para actualizar el descuento
                    // Actualizar la fila con los nuevos valores
                    row.cells[0].textContent = newDiscountCode || discountCode;
                }
            });
        });
    }
    
    // Botones de eliminar descuento
    const discountTableDelete = document.querySelector('table');
    if (discountTableDelete && discountTableDelete.querySelector('th:nth-child(1)')?.textContent === 'Código') {
        const deleteButtons = discountTableDelete.querySelectorAll('.btn-danger');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const discountCode = row.cells[0].textContent;
                
                if (confirm(`¿Estás seguro de que deseas eliminar el descuento "${discountCode}"?`)) {
                    // Aquí se implementaría la lógica para eliminar el descuento
                    row.remove();
                    alert(`Descuento ${discountCode} eliminado correctamente`);
                }
            });
        });
    }
}

// Funciones específicas para la gestión de usuarios
function setupUserActions() {
    // Botón para agregar usuario
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            // Mostrar un formulario simple para agregar usuario
            const userName = prompt('Ingrese el nombre del nuevo usuario:');
            if (userName) {
                alert(`Usuario "${userName}" agregado correctamente`);
                // Aquí se implementaría la lógica real para agregar el usuario
            }
        });
    }
    
    // Botones de editar usuario
    const userTable = document.querySelector('table');
    if (userTable && userTable.querySelector('th:nth-child(2)')?.textContent === 'Nombre') {
        const editButtons = userTable.querySelectorAll('.btn-secondary');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const userId = row.cells[0].textContent;
                const userName = row.cells[1].textContent;
                const userEmail = row.cells[2].textContent;
                
                // Mostrar un formulario simple para editar usuario
                const newUserName = prompt('Editar nombre del usuario:', userName);
                if (newUserName !== null) {
                    alert(`Usuario ${userId} actualizado correctamente`);
                    // Aquí se implementaría la lógica real para actualizar el usuario
                    // Actualizar la fila con los nuevos valores
                    row.cells[1].textContent = newUserName || userName;
                }
            });
        });
    }
    
    // Botones de eliminar usuario
    const userTableDelete = document.querySelector('table');
    if (userTableDelete && userTableDelete.querySelector('th:nth-child(2)')?.textContent === 'Nombre') {
        const deleteButtons = userTableDelete.querySelectorAll('.btn-danger');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const userId = row.cells[0].textContent;
                const userName = row.cells[1].textContent;
                
                if (confirm(`¿Estás seguro de que deseas eliminar el usuario "${userName}"?`)) {
                    // Aquí se implementaría la lógica para eliminar el usuario
                    row.remove();
                    alert(`Usuario ${userId} eliminado correctamente`);
                }
            });
        });
    }
}

// Función para inicializar la aplicación
function initAdminPanel() {
    loadSidebar();
    setupSidebarToggle();
    setupThemeToggle();
    setActivePage();
    setupProductActions();
    setupCategoryActions();
    setupDiscountActions();
    setupUserActions();
    
    console.log('Panel de administración inicializado');
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
});