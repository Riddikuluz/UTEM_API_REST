# Implementación de Autenticación con Passport.js y JWT en Node.js

Este repositorio contiene una implementación básica de autenticación utilizando Passport.js y JWT (JSON Web Tokens) en una aplicación Node.js. La autenticación se realiza mediante la estrategia de autenticación de Google OAuth2. Los usuarios pueden iniciar sesión con sus cuentas de Google y se les proporciona un token JWT para autorizar las solicitudes posteriores a la API.

## Características

- Utiliza el módulo `passport-google-oauth20` para la autenticación con Google OAuth2.
- Genera un token JWT utilizando el algoritmo de firma HS256.
- Utiliza una clave privada  para firmar y verificar el token JWT HS256.
- Protege rutas específicas con autenticación utilizando el middleware Passport.js.
- Implementa endpoints para iniciar sesión con Google, obtener un token JWT y verificar el token JWT.
- Utiliza el paquete `dotenv` para gestionar las variables de entorno.
- Utiliza el paquete `axios` para realizar solicitudes HTTP a la API de Google.

## Requisitos

- Node.js instalado en el sistema.
- Credenciales de la API de Google (client ID y client secret) obtenidas desde el [Google Developer Console](https://console.developers.google.com/).

## Configuración

1. Clonar este repositorio en tu máquina local.
2. Navegar al directorio del proyecto en la terminal.
3. Ejecutar `npm install` o `yarn install` para instalar las dependencias.
4. Crear un archivo `.env` en la raíz del proyecto y configurar las siguientes variables de entorno:
   - `GOOGLE_CLIENT_ID` - El client ID de tu proyecto de Google.
   - `GOOGLE_CLIENT_SECRET` - El client secret de tu proyecto de Google.
   - `HTTP_DOMAIN` - El dominio o URL de tu aplicación.
5. Configurar las rutas y lógica de negocio adicionales según tus necesidades.
6. Ejecutar `npm start` o `yarn start` para iniciar la aplicación.

## Uso

Una vez que la aplicación esté en funcionamiento, puedes acceder a las siguientes rutas:

- `/auth/google` - Iniciar sesión con una cuenta de Google. Esta ruta redirigirá al usuario a la página de inicio de sesión de Google.
- `/auth/google/callback` - La ruta de callback después de que el usuario inicie sesión con Google. Esta ruta manejará la respuesta de Google y generará un token JWT para el usuario.
- `/auth/jwt` - Obtener un token JWT válido. Esta ruta requiere que el usuario haya iniciado sesión previamente.
- `/token` - Verificar un token JWT. Esta ruta requiere que el usuario haya iniciado sesión previamente y proporcione un token JWT válido.

Asegúrate de personalizar las rutas y la lógica de negocio según tus necesidades específicas.

## Contribuciones

Si deseas contribuir a este proyecto, puedes realizar los siguientes pasos:

1. Realiza un fork de este repositorio.
2. Crea una rama con tu nueva funcionalidad o corrección de errores.
3. Realiza los cambios necesarios y realiza commits con mensajes descriptivos.
4. Envía un pull request a la rama principal de este repositorio.

Agradecemos de antemano tus contribuciones. Juntos podemos mejorar esta implementación de autenticación con Passport.js y JWT en Node.js.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Puedes consultar el archivo [ISC](https://en.wikipedia.org/wiki/ISC_license) para obtener más información.

## Contacto

Si tienes alguna pregunta, sugerencia o comentario, no dudes en ponerte en contacto conmigo. Puedes encontrar mis datos de contacto en mi perfil de GitHub.

¡Gracias por tu interés en este proyecto!
