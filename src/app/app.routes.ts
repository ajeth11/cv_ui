import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "user",
    loadChildren: () => import("./pages/user/user.routes").then((m) => m.routes)
  },
  {
    path: 'cv',
    loadChildren: () => import('./pages/cv/cv.routes').then((p) => p.routes)
  },
  {
    path: '**',
    redirectTo: "user"
  }
];
