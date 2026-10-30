# TutorIA · Frontend (Angular)

Aplicación web responsive de TutorIA: diagnóstico, plan de estudio, tutor conversacional (Vex),
privacidad (Ley 1581 de 2012) y pantallas públicas del acudiente. Solo habla con la API del
backend (`/api/v1`). El README completo del proyecto está en la raíz del repositorio.

## Requisitos

- **Node.js 22 LTS** (≥ 22.22.3) o 24 LTS. Angular 22 no funciona con Node 20.
- npm 10 o superior.

### Instalar Node

| Sistema | Comando |
|---|---|
| Windows | `winget install CoreyButler.NVMforWindows` → `nvm install 22` → `nvm use 22` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh \| bash` → `nvm install 22` |
| macOS | `brew install node@22` (o `nvm install 22`) |

## Comandos

```bash
npm ci               # instalar dependencias exactas
npm start            # desarrollo en http://localhost:4200 (reenvía /api a http://localhost:8000)
npm run build        # compilación
npm run build:prod   # producción (dist/tutoria-frontend/browser)
npm test             # pruebas unitarias en modo watch (Vitest)
npm run test:ci      # pruebas unitarias una sola vez (CI)
npm run lint         # ESLint (angular-eslint), sin warnings
npm run format       # Prettier
npm run e2e:instalar # una vez: descarga Chromium para Playwright
npm run e2e          # pruebas responsive 320/375/768/1280 px con la API simulada
```

Con el backend en `http://localhost:8000` (`LLM_PROVIDER=fake`), `npm start` permite recorrer todo
el flujo. El proxy (`proxy.conf.json`) hace que front y API compartan origen: la cookie `httpOnly`
de sesión funciona sin CORS.

### Producción y AWS

`npm run build:prod` genera `src/environments/environment.prod.ts` a partir de variables de CI
(`scripts/generar-entorno-prod.mjs`) sin tocar el código:

```bash
API_BASE_URL=https://api.midominio.co/api/v1 npm run build:prod
```

Sin la variable se usa `/api/v1` (mismo origen detrás de Nginx). `dist/tutoria-frontend/browser`
se sube a S3 detrás de CloudFront, con *fallback* de SPA a `index.html` para 403/404.

### Docker

```bash
docker build -t tutoria-frontend --build-arg API_BASE_URL=/api/v1 .
```

`nginx.conf` sirve la SPA (`try_files … /index.html`), reenvía `/api/` a `backend:8000`, añade
cabeceras de seguridad (CSP incluida) y caché larga para los archivos con *hash*.

## Estructura

```
src/app/
├── core/        api/ (un servicio HTTP por recurso) · auth/ (sesión, guards, capacidades)
│                http/ (interceptores) · models/ (contrato de la API) · notificaciones/ · errores/
├── shared/      ui/ (componentes presentacionales) · validators/ · pipes/ · utils/
├── layout/      shell (barra superior + pie) · acceso (panel de marca) · no-encontrado
└── features/    auth · autorizacion · diagnostico · plan · historial · planes · perfil
                 privacidad · legal · tutor
src/styles/      _tokens.scss · _tema.scss · _tipografia.scss · _base.scss · _utilidades.scss
src/testing/     datos y proveedores de prueba
e2e/             pruebas responsive con Playwright
```

## Cambiar el logo y los colores

- **Logo**: los archivos de `src/assets/brand/` son **PNG recortados** de
  `docs/brand/identidad-visual.png` (sin redibujar). Cuando tengas los SVG oficiales, guárdalos como
  `logo-horizontal.svg`, `logo-horizontal-invertido.svg` e `icono-app.svg` y cambia las rutas en
  `RUTAS_LOGO` (`src/app/shared/ui/logo/logo.component.ts`) y en `PROPORCION` si cambia la relación
  ancho/alto. Regenera `favicon.ico` e `icon-180/192/512.png` desde el icono.
- **Colores**: todos los valores están en `src/styles/_tokens.scss` (se estimaron muestreando la
  imagen de marca). Los componentes usan solo los alias de `src/styles/_tema.scss`, así que basta
  con cambiar los tokens. Revisa el contraste AA en modo claro y oscuro tras cambiarlos.
- **Fuentes**: Anton (titulares) e Inter (cuerpo), locales en `src/assets/fonts` (licencia OFL).

## Reglas del proyecto

Standalone + `inject()` + señales + `OnPush`; HTTP solo en `core/api`; errores centralizados en
`errorInterceptor` (sin `try/catch`); sin `innerHTML` salvo `FormulaKatexPipe` y
`YoutubeEmbedUrlPipe` (únicas excepciones documentadas); nada en `localStorage`/`sessionStorage`.
ESLint hace cumplir varias de estas reglas.
