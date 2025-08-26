import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { estudianteProviders } from '../shared/providers/estudiante.providers';
import { conceptoProviders } from '../shared/providers/concepto.providers';
import { adeudoProviders } from '../shared/providers/adeudo.providers';
import { pagoProviders } from '../shared/providers/pago.providers';
import { authInterceptor } from '../shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        }
      },
    }),
    ...estudianteProviders,
    ...conceptoProviders,
    ...adeudoProviders,
    ...pagoProviders,
  ],
};
