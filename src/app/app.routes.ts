import { Routes } from '@angular/router';
import { autenticadoGuard, cuentaActivaGuard, invitadoGuard } from './core/auth/auth.guard';

/*
 * Todas las rutas son lazy. Las públicas (sin guard) son espejo de la lista cerrada del backend,
 * que es quien realmente protege los datos.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tema' },

  // Pantallas de acceso: panel de marca + formulario.
  {
    path: '',
    loadComponent: () =>
      import('./layout/acceso/acceso-layout.component').then((m) => m.AccesoLayoutComponent),
    children: [
      {
        path: 'login',
        title: 'Ingresar',
        canActivate: [invitadoGuard],
        loadComponent: () =>
          import('./features/auth/login-page/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'registro',
        title: 'Crear cuenta',
        canActivate: [invitadoGuard],
        loadComponent: () =>
          import('./features/auth/registro-page/registro-page.component').then(
            (m) => m.RegistroPageComponent,
          ),
      },
      {
        path: 'pendiente-autorizacion',
        title: 'Cuenta pendiente de autorización',
        canActivate: [autenticadoGuard],
        loadComponent: () =>
          import('./features/auth/pendiente-autorizacion-page/pendiente-autorizacion-page.component').then(
            (m) => m.PendienteAutorizacionPageComponent,
          ),
      },
      // El formulario público de dos correos ya no existe: el enlace viejo lleva a la portada.
      { path: 'autorizacion', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'autorizacion/confirmar',
        title: 'Confirmar autorización',
        loadComponent: () =>
          import('./features/autorizacion/confirmar-autorizacion-page/confirmar-autorizacion-page.component').then(
            (m) => m.ConfirmarAutorizacionPageComponent,
          ),
      },
    ],
  },

  // Aplicación: barra superior + contenido + pie.
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'politica',
        title: 'Política de tratamiento de datos',
        loadComponent: () =>
          import('./features/legal/politica-page/politica-page.component').then(
            (m) => m.PoliticaPageComponent,
          ),
      },
      {
        path: 'legal/cumplimiento',
        title: 'Cumplimiento y uso de IA',
        loadComponent: () =>
          import('./features/legal/cumplimiento-page/cumplimiento-page.component').then(
            (m) => m.CumplimientoPageComponent,
          ),
      },
      {
        path: '',
        canActivate: [autenticadoGuard, cuentaActivaGuard],
        children: [
          {
            path: 'tema',
            title: '¿Qué quieres aprender hoy?',
            loadComponent: () =>
              import('./features/diagnostico/tema-page/tema-page.component').then(
                (m) => m.TemaPageComponent,
              ),
          },
          {
            path: 'diagnostico/:idSesion',
            title: 'Diagnóstico',
            loadComponent: () =>
              import('./features/diagnostico/cuestionario-page/cuestionario-page.component').then(
                (m) => m.CuestionarioPageComponent,
              ),
          },
          {
            path: 'diagnostico/:idSesion/resultado',
            title: 'Resultado del diagnóstico',
            loadComponent: () =>
              import('./features/diagnostico/resultado-page/resultado-page.component').then(
                (m) => m.ResultadoPageComponent,
              ),
          },
          {
            path: 'plan/:idPlan',
            title: 'Plan de aprendizaje',
            loadComponent: () =>
              import('./features/plan/plan-page/plan-page.component').then(
                (m) => m.PlanPageComponent,
              ),
          },
          {
            path: 'historial',
            title: 'Historial',
            loadComponent: () =>
              import('./features/historial/historial-page/historial-page.component').then(
                (m) => m.HistorialPageComponent,
              ),
          },
          {
            path: 'planes',
            title: 'Planes',
            loadComponent: () =>
              import('./features/planes/planes-page/planes-page.component').then(
                (m) => m.PlanesPageComponent,
              ),
          },
          {
            path: 'perfil',
            title: 'Perfil',
            loadComponent: () =>
              import('./features/perfil/perfil-page/perfil-page.component').then(
                (m) => m.PerfilPageComponent,
              ),
          },
          {
            path: 'perfil/aprendizaje',
            title: 'Cómo aprendo',
            loadComponent: () =>
              import('./features/perfil/perfil-aprendizaje-page/perfil-aprendizaje-page.component').then(
                (m) => m.PerfilAprendizajePageComponent,
              ),
          },
          {
            path: 'privacidad',
            title: 'Mis datos y privacidad',
            loadComponent: () =>
              import('./features/privacidad/privacidad-page/privacidad-page.component').then(
                (m) => m.PrivacidadPageComponent,
              ),
          },
          {
            path: 'aceptar-politica',
            title: 'Nueva política de datos',
            loadComponent: () =>
              import('./features/privacidad/aceptar-politica-page/aceptar-politica-page.component').then(
                (m) => m.AceptarPoliticaPageComponent,
              ),
          },
          {
            path: 'tutor',
            title: 'Tutor',
            loadComponent: () =>
              import('./features/tutor/tutor-page/tutor-page.component').then(
                (m) => m.TutorPageComponent,
              ),
          },
          {
            path: 'tutor/:idConversacion',
            title: 'Chat con el tutor',
            loadComponent: () =>
              import('./features/tutor/chat-page/chat-page.component').then(
                (m) => m.ChatPageComponent,
              ),
          },
          {
            path: 'tutor/:idConversacion/resumen',
            title: 'Resumen de la sesión',
            loadComponent: () =>
              import('./features/tutor/resumen-sesion-page/resumen-sesion-page.component').then(
                (m) => m.ResumenSesionPageComponent,
              ),
          },
        ],
      },
    ],
  },

  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./layout/no-encontrado/no-encontrado.component').then((m) => m.NoEncontradoComponent),
  },
];
