import { ERROR_CODE, SettlementPayload, SettlementPreview } from '@angular-monorepo/entities';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { RoutingService } from '../../../services/routing/routing.service';

@Injectable()
export class SettlementStateService
implements CanActivate, CanActivateChild, CanDeactivate<SettlementComponent> {

  private readonly routingService = inject(RoutingService);

  private readonly LSKey = 'settlementData';

  setPreview (preview: { preview: SettlementPreview, payload: SettlementPayload }) {
    localStorage.setItem(this.LSKey, JSON.stringify(preview));
  }

  getPreview (): Observable<{ preview: SettlementPreview, payload: SettlementPayload }> {
    const previewLs = localStorage.getItem(this.LSKey);
    if (!previewLs) {
      throw new Error(ERROR_CODE.SETTLEMENT_PREVIEW_NOT_FOUND);
    }
    try {
      const preview = JSON.parse(previewLs);
      return of(preview as { preview: SettlementPreview, payload: SettlementPayload });
    } catch (error) {
      throw new Error(ERROR_CODE.SETTLEMENT_PREVIEW_NOT_FOUND);
    }
  }

  clearPreview () {
    localStorage.removeItem(this.LSKey);
  }

  canActivate () {
    return this.canActivateFn();
  }

  canActivateChild () {
    return this.canActivateFn();
  }

  private canActivateFn () {
    return this.getPreview().pipe(
      map(preview => {
        if (preview === null) {
          this.routingService.goToOwnerRealmView();
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.routingService.goToOwnerRealmView();
        return of(false);
      }),
    );
  }

  canDeactivate (
    component: SettlementComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
  ) {
    if (!this.routingService.isSettleLink(nextState.url)) {
      this.clearPreview();
    }
    return true;
  }
}

export abstract class SettlementComponent {}