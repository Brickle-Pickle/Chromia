# Chromia - Roadmap del Proyecto

Este documento describe las fases y tareas planificadas para el desarrollo de la aplicación web Chromia.

---

### Fase 1: Fundación y Configuración del Backend (Node.js)

*   [X] **Inicialización del Proyecto:**
    *   Configurar el entorno de Node.js con Express.
    *   Establecer la conexión con la base de datos MongoDB.
*   [X] **Modelo de Datos:**
    *   Definir el esquema (Schema) para las paletas de colores (nombre, colores, autor).
*   [X] **API RESTful (CRUD):**
    *   Implementar los endpoints para **C**rear, **L**eer, **A**ctualizar y **E**liminar (CRUD) paletas de colores.
    *   Probar los endpoints con una herramienta como Postman o Insomnia.

---

### Fase 2: Estructura y Visualización del Frontend (React)

*   [ ] **Inicialización del Proyecto:**
    *   Configurar un nuevo proyecto con Vite y React.
    *   Organizar la estructura de carpetas (componentes, páginas, servicios, etc.).
*   [ ] **Diseño Básico y Componentes:**
    *   Crear un layout principal (Header, Footer, Contenido).
    *   Diseñar un componente `PaletteCard` para mostrar una vista previa de cada paleta.
*   [ ] **Página Principal:**
    *   Crear la página de inicio que obtenga y muestre todas las paletas de la API.

---

### Fase 3: Funcionalidad Principal de Paletas

*   [ ] **Creación de Paletas:**
    *   Crear un formulario para que los usuarios puedan añadir nuevas paletas de colores.
*   [ ] **Vista de Detalle:**
    *   Desarrollar una página que muestre los detalles completos de una paleta al hacer clic en ella.
*   [ ] **Integración con The Color API:**
    *   Al hacer clic en un color específico, llamar a `The Color API` para mostrar información adicional (nombre, CMYK, etc.).

---

### Fase 4: Autenticación de Usuarios

*   [ ] **Backend de Autenticación:**
    *   Definir el esquema de Usuario (username, password).
    *   Implementar endpoints para registro e inicio de sesión (login).
    *   Generar tokens (JWT) para gestionar las sesiones.
*   [ ] **Frontend de Autenticación:**
    *   Crear las páginas de Registro y Login.
    *   Gestionar el estado de autenticación del usuario en la aplicación React.
*   [ ] **Asociación de Paletas:**
    *   Modificar la lógica para que al crear una paleta, se asigne al usuario que ha iniciado sesión.

---

### Fase 5: Funcionalidades de Usuario y Mejoras

*   [ ] **Perfil de Usuario:**
    *   Crear una página de perfil donde el usuario pueda ver todas las paletas que ha creado.
*   [ ] **Gestión de Paletas Propias:**
    *   Permitir que los usuarios editen y eliminen solo sus propias paletas.
*   [ ] **Paletas Populares:**
    *   Implementar una sección para mostrar las paletas más populares (se puede basar en un contador de "me gusta" o visualizaciones).

---

### Fase 6: Estilo y Refinamiento Final

*   [ ] **Diseño Minimalista:**
    *   Aplicar un diseño limpio, suave y coherente en toda la aplicación.
*   [ ] **Diseño Responsivo:**
    *   Asegurar que la web se vea y funcione bien en dispositivos móviles y de escritorio.
*   [ ] **Experiencia de Usuario (UX):**
    *   Añadir indicadores de carga, notificaciones y mensajes de error para mejorar la interacción.

---

### Fase 7: Despliegue

*   [ ] **Preparación para Producción:**
    *   Optimizar los assets del frontend.
    *   Configurar variables de entorno para producción.
*   [ ] **Puesta en Marcha:**
    *   Desplegar el backend en una plataforma (ej. Vercel, Heroku, Railway).
    *   Desplegar el frontend en una plataforma (ej. Vercel, Netlify).