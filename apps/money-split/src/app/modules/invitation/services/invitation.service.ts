import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, mergeMap } from 'rxjs';
import { Invitation, InvitationViewData } from '@angular-monorepo/entities';
import { RoutingService } from '../../../services/routing/routing.service';
import { DataService } from '../../data.service';

@Injectable()
export class InvitationService {

  private readonly dataService = inject(DataService);
  private readonly routingService = inject(RoutingService);

  public getInvitationView (): Observable<InvitationViewData> {
    return combineLatest([
      this.routingService.getInvitationId(),
    ])
      .pipe(
        mergeMap(([invitationId]) => this.dataService.getInvitationView(invitationId)),
      );
  }

  public acceptInvitation (name: string): Observable<Invitation> {
    return combineLatest([
      this.routingService.getInvitationId(),
    ])
      .pipe(
        mergeMap(([invitationId]) => this.dataService.acceptInvitation(invitationId, name)),
      );
  }

  public rejectInvitation (): Observable<Invitation> {
    return combineLatest([
      this.routingService.getInvitationId(),
    ])
      .pipe(
        mergeMap(([invitationId]) => this.dataService.rejectInvitation(invitationId)),
      );
  }
}