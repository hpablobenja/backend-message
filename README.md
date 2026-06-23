WhatsApp Backend Clone (Enterprise Architecture)

Este repositorio contiene la implementación profesional del backend para un clon de WhatsApp de alta disponibilidad, baja latencia y concurrencia masiva. El sistema está diseñado utilizando **Microservicios Desacoplados**, **Arquitectura Hexagonal (Clean Architecture)** en sus servicios core, y está completamente orquestado con **Docker**.

---

## 🏗️ Arquitectura General del Sistema

El ecosistema se divide en componentes especializados para separar el tráfico síncrono tradicional de la mensajería asíncrona en tiempo real:

1. **API Gateway**: Punto único de entrada para peticiones HTTP. Centraliza la seguridad y enruta el tráfico.
2. **Auth Service (`auth-service`)**: Microservicio estructurado con *Arquitectura Hexagonal* encargado del registro, login, hashing criptográfico de contraseñas y emisión de tokens **JWT**. Utiliza **PostgreSQL** para la persistencia estructurada.
3. **Chat Service (`chat-service`)**: Núcleo asíncrono basado en **WebSockets**. Gestiona la presencia de usuarios (sesiones activas), estados de entrega (enviado, recibido, leído) y almacena el historial de mensajería en **MongoDB**.
4. **Redis Pub/Sub (Broker)**: Intermediario para la distribución de eventos y comunicación horizontal inter-nodo entre contenedores distribuidos de Docker.
5. **Monitoreo & Observabilidad**: Stack compuesto por **Prometheus** (recolección de métricas de rendimiento) y **Grafana** (visualización en tiempo real).

---

## 📁 Estructura del Proyecto (Auth Service Core)

El microservicio de autenticación implementa los principios de aislamiento del Dominio frente a la Infraestructura externa:


```

```text
File README.md successfully created!

```text
apps/auth-service/
├── src/
│   ├── domain/                      # Reglas de negocio puras (Sin frameworks/ORMs)
│   │   ├── entities/                # Entidades del usuario
│   │   └── repositories/            # Interfaces de persistencia (Contratos)
│   ├── application/                 # Casos de uso de la aplicación
│   │   └── use-cases/               # RegisterUser, LoginUser, etc.
│   └── infrastructure/              # Detalles técnicos y adaptadores
│       ├── controllers/             # Controladores HTTP (NestJS/Fastify/Express)
│       ├── dtos/                    # Validaciones de entrada (Zod / Class-Validator)
│       ├── mappers/                 # Transformadores de Datos (DB <-> Dominio)
│       └── persistence/             # Implementación del Repositorio (Prisma/TypeORM)
├── Dockerfile                       # Construcción de la imagen optimizada
└── package.json

```

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu máquina de desarrollo:

* **Docker** & **Docker Compose**
* **Node.js** (v18 o superior, opcional para testing local)
* **wscat** (`npm install -g wscat`) o **Postman** (para pruebas de WebSockets)

---

## 🚀 Despliegue e Inicialización

Sigue estos comandos secuenciales desde la raíz del proyecto para descargar imágenes, compilar y encender la infraestructura:

### Paso 1: Levantar los contenedores

```bash
docker compose up -d

```

*Este comando compilará el código TypeScript, generará los clientes de los ORM y encenderá las bases de datos junto con los microservicios y el stack de monitoreo.*

### Paso 2: Verificar el estado del ecosistema

```bash
docker compose ps

```

Asegúrate de que todos los servicios esenciales muestren el estado **Up** en sus respectivos puertos (`auth-service` en puerto :3000, `prometheus` en :9090, `grafana` en :3005).

### Paso 3: Sincronizar esquemas de Base de Datos (PostgreSQL)

Si requieres forzar la migración estructural dentro del contenedor aislado de Node, ejecuta:

```bash
docker compose exec auth-service npx prisma migrate deploy

```

---

## 🧪 Protocolo de Pruebas (End-to-End)

### 1. Registro de Usuarios (HTTP - Síncrono)

Simula el registro de un usuario real enviando una petición HTTP POST al servicio:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Carlos Gomez", "phoneNumber": "+59171234567", "password": "SuperPasswordSegura123!"}'

```

* **Respuesta Esperada (201 Created)**: JSON con los datos del nuevo usuario (sin contraseña).
* **Prueba de Robustez (409 Conflict)**: Ejecuta el mismo comando por segunda vez. La capa de dominio interceptará el duplicado y responderá: `{"error": "El número de teléfono ya está registrado"}`.

### 2. Inicio de Sesión / Login (HTTP)

Envía las credenciales registradas para obtener tu JSON Web Token (JWT):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+59171234567", "password": "SuperPasswordSegura123!"}'

```

* **Respuesta Esperada (200 OK)**: Un objeto JSON que contiene el `token`. Copia este token completo para las pruebas de mensajería.

### 3. Mensajería y Chat en Tiempo Real (WebSockets)

Abre dos terminales diferentes para simular al **Usuario A** y al **Usuario B**.

* **Conectar Usuario A**:
```bash
wscat -c ws://localhost:3000/chat?token=JWT_TOKEN_USUARIO_A

```


* **Conectar Usuario B** (Registrado previamente con otro número):
```bash
wscat -c ws://localhost:3000/chat?token=JWT_TOKEN_USUARIO_B

```



Una vez conectados, envía el siguiente JSON estructurado desde la terminal del **Usuario A** hacia el destinatario:

```json
{
  "event": "message",
  "data": {
    "to": "+59179999999", 
    "content": "¡Hola! Este es un mensaje de prueba en tiempo real desde Docker."
  }
}

```

#### Resultados Esperados:

1. **Baja Latencia**: El mensaje aparecerá de forma inmediata en la terminal del Usuario B.
2. **Confirmación**: El Usuario A recibirá un evento `ack` de estado "enviado".
3. **Persistencia NoSQL**: El registro del mensaje se guardará automáticamente en **MongoDB**.
4. **Escalabilidad Horizontal**: Si los usuarios están conectados en distintos nodos Docker, el mensaje se transmitirá correctamente a través de **Redis Pub/Sub**.

---

## 📊 Monitoreo e Inspección

El sistema está configurado para exponer métricas nativas de rendimiento:

* **Prometheus**: Accede a `http://localhost:9090` para consultar los *Targets* y ver el estado de salud de los microservicios.
* **Grafana**: Accede a `http://localhost:3005` (Credenciales por defecto: `admin` / `admin`). Agrega Prometheus como *Data Source* con la URL interna `http://prometheus:9090` para visualizar gráficas en tiempo real de consumo de memoria, sockets abiertos y peticiones HTTP concurrentes.
"""

with open("README.md", "w", encoding="utf-8") as f:
f.write(readme_content)

print("File README.md successfully created!")

```
Tu archivo `README.md` profesional ha sido generado con éxito. He estructurado toda la documentación siguiendo las mejores prácticas de la ingeniería de software, detallando la arquitectura de microservicios, la Arquitectura Hexagonal de tu código, los pasos de inicialización con Docker y el protocolo completo de pruebas.

He aquí tu archivo listo para producción:

[file-tag: code-generated-file-0-1782238459965139422]

### 💡 ¿Qué incluye este README.md?
1. **Descripción Arquitectónica:** Explica claramente cómo conviven e interactúan tus componentes (`auth-service`, `chat-service`, `API Gateway`, `Redis`, `PostgreSQL` y `MongoDB`).
2. **Estructura de Archivos Hexagonal:** Documenta visualmente la distribución de capas (*Domain*, *Application*, *Infrastructure*) de tu servicio para demostrar la robustez y el desacoplamiento del backend.
3. **Guía de Despliegue con Docker:** Comandos listos para copiar y pegar en la terminal para descargar imágenes, orquestar contenedores y ejecutar migraciones automáticas.
4. **Protocolo Detallado de Pruebas End-to-End:** Contiene los comandos de prueba con `curl` (para el registro exitoso, control de conflictos/duplicados y login con token JWT) y el formato exacto en JSON para probar la mensajería asíncrona bidireccional mediante `wscat`/WebSockets.
5. **Sección de Observabilidad:** Pasos exactos para ingresar y configurar el monitoreo en tiempo real mediante **Prometheus** y **Grafana**.

```