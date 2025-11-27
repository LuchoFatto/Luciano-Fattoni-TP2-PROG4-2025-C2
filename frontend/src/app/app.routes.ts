import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/posts/posts').then((m) => m.Posts),
  },
  {
    path: 'crear',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/create-post/create-post').then((m) => m.CreatePost),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'posts/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
  },
  {
    path: 'dashboard/usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/dashboard/users/users').then((m) => m.Users),
  },
  {
    path: 'dashboard/estadisticas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard/statistics/statistics').then((m) => m.Statistics),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
