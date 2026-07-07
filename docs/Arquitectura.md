# Arquitectura
- Stacks tecnológicos: 
Lenguajes: HTML, CSS, JavaScript
Librerias y otros: JWT, MariaDB, MySQL2,  
Entorno de Dev: Bun 1.3.14

Se prefirió una arquitectura minimalista sin frameworks (React, Angular, Vite) para enfocarse en la comprensión pura del desarrollo web.
```
Cliente (HTML/CSS/JS)
        │
        ▼
     server.js
        │
        ▼
   Controllers
        │
        ▼
       MySQL
```

## Diseño de Bases de Datos
Diagrama hecho con el Software Dbeaver para la facilitar el analisis de llaves foraneas y relaciones entre tablas

![Diagrama MariaDB exportado en Dbeaver](./img/diagramaDB.png)
