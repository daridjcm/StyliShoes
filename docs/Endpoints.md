# APIS, Endpoits y Módulos
**- APIS:**
Base URL: http://localhost:3000
Formato de datos: JSON

**- Módulos:**
  1. Módulo de autenticación (`/api/auth`)
  Gestiona el registro, inicio y administra los usuarios
  - 1.1 Registrar Usuario: Crea un nuevo usuario en el sistema
      ```json
      Endpoint: `/api/register`
      Método: POST
      Controlador: auth.registerUser(req)
      Body Request (JSON):
      {
        "nombre": "Juan Pérez",
        "email": "juan@ejemplo.com",
        "password": "contraseña_segura"
      }
    ```
    - Respuesta Exitosa: 201 Created (Usuario creado)
    - Respuesta Error: 400 Bad Request (Datos inválidos) o 409 Conflict (Email ya existe)

  - 1.2 Iniciar Sesión: Autentica al usuario y devuelve un token o sesión.
  ```json
    Endpoint: /api/login
    Método: POST
    Controlador: auth.loginUser(req)
    Body Request (JSON):
    {
      "email": "juan@ejemplo.com",
      "password": "contraseña_segura"
    }
  ```
    - Respuesta Exitosa: 200 OK (Token de acceso o datos de sesión).
    - Respuesta Error: 401 Unauthorized (Credenciales incorrectas).
  - 1.3 Listar Usuarios: Obtiene la lista de todos los usuarios registrados (uso administrativo).
  ```json
  Endpoint: /api/users
  Método: GET
  Controlador: auth.getUsers()
  Respuesta Exitosa: 200 OK
  [
    { "id": 1, "nombre": "Juan Pérez", "email": "juan@ejemplo.com" },
    { "id": 2, "nombre": "Ana Gómez", "email": "ana@ejemplo.com" }
  ]
  ```
Aquí tienes la continuación de la documentación siguiendo estrictamente el formato solicitado para los módulos restantes:

  - 1.4 Guardar Usuario (Administrativo): Crea un usuario manualmente desde el panel de administración.
      ```json
      Endpoint: /api/users
      Método: POST
      Controlador: auth.saveUser(req)
      Body Request (JSON):
      {
        "nombre": "Admin Sistema",
        "email": "admin@stylishoes.com",
        "password": "clave_admin",
        "rol": "admin"
      }
      ```
    - Respuesta Exitosa: 201 Created (Usuario administrativo creado).
    - Respuesta Error: 400 Bad Request (Datos incompletos).

  2. Módulo de Productos (`/api/products`)
  Gestiona el catálogo, inventario y detalles de los zapatos.

  - 2.1 Crear Producto: Añade un nuevo artículo al inventario.
      ```json
      Endpoint: /api/products
      Método: POST
      Controlador: products.createProduct(req)
      Body Request (JSON):
      {
        "nombre": "Zapato Deportivo X",
        "precio": 59.99,
        "stock": 100,
        "descripcion": "Zapato ligero para correr",
        "categoria": "deportivo"
      }
      ```
    - Respuesta Exitosa: 201 Created (Producto creado con ID).
    - Respuesta Error: 400 Bad Request (Datos inválidos).

  - 2.2 Obtener Producto(s): Recupera un producto por ID o lista el catálogo.
      ```json
      Endpoint: /api/products
      Método: GET
      Controlador: products.getProductById(url)
      Parámetros Query (Opcional): ?id=123
      Respuesta Exitosa: 200 OK
      [
        { "id": 1, "nombre": "Zapato Deportivo X", "precio": 59.99, "stock": 100 },
        { "id": 2, "nombre": "Botín Urbano", "precio": 89.50, "stock": 45 }
      ]
      ```
    - Respuesta Error: 404 Not Found (Si se busca un ID inexistente).

  - 2.3 Actualizar Producto: Modifica la información de un producto existente.
      ```json
      Endpoint: /api/products
      Método: PUT
      Controlador: products.updateProduct(req)
      Body Request (JSON):
      {
        "id": 1,
        "precio": 49.99,
        "stock": 95
      }
      ```
    - Respuesta Exitosa: 200 OK (Producto actualizado).
    - Respuesta Error: 404 Not Found (Producto no encontrado).

  - 2.4 Eliminar Producto: Borra permanentemente un producto del catálogo.
      ```json
      Endpoint: /api/products
      Método: DELETE
      Controlador: products.deleteProduct(req)
      Body Request (JSON) o Query:
      {
        "id": 1
      }
      ```
    - Respuesta Exitosa: 200 OK o 204 No Content (Eliminación exitosa).
    - Respuesta Error: 404 Not Found.

  3. Módulo de Compras (`/api/purchases`)
  Gestiona transacciones, historial de pedidos y facturación.

  - 3.1 Realizar Compra: Registra una nueva transacción de compra.
      ```json
      Endpoint: /api/purchases
      Método: POST
      Controlador: products.createPurchase(req)
      Body Request (JSON):
      {
        "usuarioId": 1,
        "productos": [
          { "productoId": 5, "cantidad": 2 },
          { "productoId": 8, "cantidad": 1 }
        ],
        "total": 159.48,
        "fecha": "2026-06-30T10:00:00Z"
      }
      ```
    - Respuesta Exitosa: 201 Created (Compra registrada con ID de transacción).
    - Respuesta Error: 400 Bad Request (Stock insuficiente o datos inválidos).

  - 3.2 Listar Compras: Obtiene el historial de compras (filtrable por usuario).
      ```json
      Endpoint: /api/purchases
      Método: GET
      Controlador: products.getPurchases(url)
      Parámetros Query (Opcional): ?usuarioId=1
      [
        { "id": 101, "usuarioId": 1, "total": 159.48, "fecha": "2026-06-30" },
        { "id": 98, "usuarioId": 1, "total": 59.99, "fecha": "2026-06-28" }
      ]
      ```
      - Respuesta Exitosa: 200 OK

  - 3.3 Generar Factura PDF: Descarga el comprobante de una compra específica.
      ```json
      Endpoint: /api/purchases/invoice
      Método: GET
      Controlador: products.getInvoicePDF(req, url)
      Parámetros Query (Requerido): ?purchaseId=101
      ```
    - Respuesta Exitosa: 200 OK (Content-Type: application/pdf)
    - Respuesta Error: 404 Not Found (Compra no encontrada).

  - 3.4 Obtener Última Compra ID: Recupera el ID de la transacción más reciente.
      ```json
      Endpoint: /api/purchases/latest
      Método: GET
      Controlador: products.getLatestPurchaseId(url)
      Respuesta Exitosa: 200 OK
      {
        "latestId": 1054
      }
      ```
