# RESPIG - Sistema de Gestión de Responsivas 📦🔒

Sistema corporativo integral para la gestión y control de responsivas de equipo de cómputo, celulares y activos tecnológicos, desarrollado específicamente para la empresa **Grupo IG**.

---

## 👨‍💻 Autor
**Ing. Javier Romo**

---

## ✨ Características Principales
- **Módulo de Responsivas:** Creación, visualización y gestión de responsivas de entrega de equipo.
- **Gestión de Archivos:** Subida de responsivas firmadas en formato PDF (`multer`).
- **Módulo de Seguridad:** Gestor de contraseñas empresariales encriptadas de forma segura (`AES-256-CBC`).
- **Control de Acceso:** Sistema de usuarios con roles y permisos dinámicos (JWT y encriptación con `bcrypt`).
- **Exportación:** Exportación automatizada de datos a archivos Excel divididos por categorías (`xlsx`).
- **Diseño Responsivo:** Interfaz gráfica premium (Glassmorphism), adaptada a dispositivos móviles con un diseño de tarjetas dinámico.

---

## 🛠️ Tecnologías y Recursos Utilizados

### Frontend
- **React + Vite** (JavaScript)
- **Tailwind CSS** (Estilos y responsividad)
- **Headless UI & Heroicons** (Componentes e íconos interactivos)
- **React Router** (Navegación protegida)
- **React Hot Toast** (Notificaciones)
- **jsPDF** (Generación de documentos PDF)

### Backend
- **Node.js + Express** (API RESTful)
- **PostgreSQL** (Base de datos relacional)
- **Docker & Docker Compose** (Infraestructura y contenedores)

---

## 🚀 Instrucciones de Despliegue (Producción)

### 1. Base de Datos (Docker)
Asegúrate de configurar correctamente tu archivo `.env` en la carpeta `backend`. Para levantar la base de datos PostgreSQL, ejecuta el siguiente comando desde la raíz del proyecto para indicarle a Docker dónde leer las variables de entorno:

```bash
docker-compose --env-file backend/.env up -d
```
*(Esto creará y arrancará el contenedor `responsivas-db` en segundo plano).*

### 2. Backend
Abre una terminal, ingresa a la carpeta del backend y ejecuta la aplicación:
```bash
cd backend
npm install
node app.js
```
*(El servidor de desarrollo correrá en el puerto configurado).*

### 3. Frontend
En otra terminal, corre la aplicación de React:
```bash
npm install
npm run dev
```

---

## 🔒 Variables de Entorno (Ejemplo)
El sistema requiere un archivo `.env` en la carpeta `backend/` con la siguiente estructura:

```env
PGHOST=localhost
PGUSER=tu_usuario
PGPASSWORD=tu_contraseña
PGDATABASE=responsivas
PGPORT=5432

ENCRYPTION_KEY=tu_llave_de_32_bytes
JWT_SECRET=tu_secreto_jwt

ADMIN_USER=admin
ADMIN_PASSWORD_HASH=hash_generado_con_bcrypt
```
