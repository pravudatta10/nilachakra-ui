import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadChildren: () =>
            import('./features/features.module').then(m => m.FeaturesModule)
    },
    {
        path: '',
        loadChildren: () =>
            import('./features/features.module').then(m => m.FeaturesModule)
    },
    // ...other routes
];