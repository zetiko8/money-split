import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AuthService } from './auth.token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {

    return this.authService.getToken()
      .pipe(
        map(token => {
          if (token === null) return req;

          let cloneHeaders = req.headers;
          if(!cloneHeaders){
            cloneHeaders = new HttpHeaders();
          }

          const cloneReq = req.clone({
            headers: cloneHeaders
              .set('Authorization', 'Bearer ' + token),
          });

          return cloneReq;
        }),
        mergeMap(req => next.handle(req)),
      );
  }
}
