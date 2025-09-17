import { ERROR_CODE, SettlementPreview } from '@angular-monorepo/entities';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { RoutingService } from '../../../services/routing/routing.service';

@Injectable()
export class SettlementStateService
implements CanActivate, CanActivateChild, CanDeactivate<SettlementComponent> {

  private readonly routingService = inject(RoutingService);

  setPreview (preview: SettlementPreview) {
    localStorage.setItem('settlementPreview', JSON.stringify(preview));
  }

  getPreview (): Observable<SettlementPreview> {
    const previewLs = localStorage.getItem('settlementPreview');
    if (!previewLs) {
      throw new Error(ERROR_CODE.SETTLEMENT_PREVIEW_NOT_FOUND);
    }
    try {
      const preview = JSON.parse(previewLs);
      return of(preview as SettlementPreview);
    } catch (error) {
      throw new Error(ERROR_CODE.SETTLEMENT_PREVIEW_NOT_FOUND);
    }
  }

  clearPreview () {
    localStorage.removeItem('settlementPreview');
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