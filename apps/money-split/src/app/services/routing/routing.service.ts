import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, of } from 'rxjs';
import { UserService } from '../auth/token/auth.token.user.service';
import { APP_BASE_HREF } from '@angular/common';

@Injectable()
export class RoutingService {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly baseHref = inject(APP_BASE_HREF);

  public getOwnerKey () {
    return this.userService.loadUserProfile()
      .pipe(map(up => up.key as string));
  }

  public getNamespaceId () {
    // i dont know why route params are not working - TODO
    return of(
      window.location.href
        .split(this.baseHref)[1]
        .split('/')[2],
    ).pipe(map(stringId => Number(stringId)));
  }

  public getInvitationId () {
    // i dont know why route params are not working - TODO
    return of(
      window.location.href
        .split(this.baseHref)[1]
        .split('/')[1],
    );
  }

  public goToOwnerRealmView (
    ownerKey?: string,
  ) {
    if (ownerKey) {
      this.router.navigate(['/', ownerKey, 'realm']);
    } else {
      this.getOwnerKey()
        .subscribe(
          ownerKey => this.goToOwnerRealmView(ownerKey),
        );
    }
  }

  public goToNewNamespaceView () {
    this.getOwnerKey()
      .subscribe(
        ownerKey => this.router.navigate(['/', ownerKey, 'new']),
      );
  }

  public goToNamespaceView (
    namespaceId?: number,
    ownerKey?: string,
  ) {
    if (ownerKey && namespaceId) {
      this.router.navigate(
        this.namespaceViewLink(ownerKey, namespaceId));
    }
    else if (namespaceId) {
      this.getOwnerKey()
        .subscribe(
          ownerKeyG => this.router.navigate(
            this.namespaceViewLink(ownerKeyG, namespaceId)),
        );
    }
    else {
      combineLatest(
        this.getOwnerKey(),
        this.getNamespaceId(),
      )
        .subscribe(
          ([ownerKeyG, namespaceIdG]) => this.router.navigate(
            this.namespaceViewLink(ownerKeyG, namespaceIdG)),
        );
    }
  }

  public goToSettleView (
    namespaceId?: number,
    ownerKey?: string,
  ) {
    if (ownerKey && namespaceId) {
      this.router.navigate(
        this.settleLink(ownerKey, namespaceId));
    }
    else if (namespaceId) {
      this.getOwnerKey()
        .subscribe(
          ownerKeyG => this.router.navigate(
            this.settleLink(ownerKeyG, namespaceId)),
        );
    }
    else {
      combineLatest(
        this.getOwnerKey(),
        this.getNamespaceId(),
      )
        .subscribe(
          ([ownerKeyG, namespaceIdG]) => this.router.navigate(
            this.settleLink(ownerKeyG, namespaceIdG)),
        );
    }
  }

  public goToAddExpenseView (
    namespaceId?: number,
    ownerKey?: string,
  ) {
    if (ownerKey && namespaceId) {
      this.router.navigate(
        this.addExpenseLink(ownerKey, namespaceId));
    }
    else if (namespaceId) {
      this.getOwnerKey()
        .subscribe(
          ownerKeyG => this.router.navigate(
            this.addExpenseLink(ownerKeyG, namespaceId)),
        );
    }
    else {
      combineLatest(
        this.getOwnerKey(),
        this.getNamespaceId(),
      )
        .subscribe(
          ([ownerKeyG, namespaceIdG]) => this.router.navigate(
            this.addExpenseLink(ownerKeyG, namespaceIdG)),
        );
    }
  }

  public goToEditRecordView (
    recordId: number,
    namespaceId?: number,
    ownerKey?: string,
  ) {
    if (ownerKey && namespaceId) {
      this.router.navigate(
        this.editRecordLink(
          recordId, ownerKey, namespaceId));
    }
    else if (namespaceId) {
      this.getOwnerKey()
        .subscribe(
          ownerKeyG => this.router.navigate(
            this.editRecordLink(
              recordId, ownerKeyG, namespaceId)),
        );
    }
    else {
      combineLatest(
        this.getOwnerKey(),
        this.getNamespaceId(),
      )
        .subscribe(
          ([ownerKeyG, namespaceIdG]) => this.router.navigate(
            this.editRecordLink(
              recordId, ownerKeyG, namespaceIdG)),
        );
    }
  }

  public goToInviteView (
    namespaceId?: number,
    ownerKey?: string,
  ) {
    if (ownerKey && namespaceId) {
      this.router.navigate(
        this.inviteLink(ownerKey, namespaceId));
    }
    else if (namespaceId) {
      this.getOwnerKey()
        .subscribe(
          ownerKeyG => this.router.navigate(
            this.inviteLink(ownerKeyG, namespaceId)),
        );
    }
    else {
      combineLatest(
        this.getOwnerKey(),
        this.getNamespaceId(),
      )
        .subscribe(
          ([ownerKeyG, namespaceIdG]) => this.router.navigate(
            this.inviteLink(ownerKeyG, namespaceIdG)),
        );
    }
  }

  public goToInvitationView (
    invitationId?: string,
  ) {
    if (invitationId) {
      this.router.navigate(
        [ ...this.invitationLink(invitationId), 'join']);
    }
    else {
      combineLatest(
        this.getInvitationId(),
      )
        .subscribe(
          ([invitationIdRef]) => this.router.navigate(
            [ ...this.invitationLink(invitationIdRef), 'join']),
        );
    }
  }

  public goToInvitationLoginView (
    invitationId?: string,
  ) {
    if (invitationId) {
      this.router.navigate(
        [ ...this.invitationLink(invitationId), 'login']);
    }
    else {
      combineLatest(
        this.getInvitationId(),
      )
        .subscribe(
          ([invitationIdRef]) => this.router.navigate(
            [ ...this.invitationLink(invitationIdRef), 'login']),
        );
    }
  }

  public goToInvitationRegisterView (
    invitationId?: string,
  ) {
    if (invitationId) {
      this.router.navigate(
        [ ...this.invitationLink(invitationId), 'login']);
    }
    else {
      combineLatest(
        this.getInvitationId(),
      )
        .subscribe(
          ([invitationIdRef]) => this.router.navigate(
            [ ...this.invitationLink(invitationIdRef), 'login']),
        );
    }
  }

  public goToEditProfileView (
    ownerKey?: string,
  ) {
    if (ownerKey) {
      this.router.navigate(
        this.editProfileLink(ownerKey));
    }
    else {
      combineLatest(
        this.getOwnerKey(),
      )
        .subscribe(
          ([ownerKeyG]) => this.router.navigate(
            this.editProfileLink(ownerKeyG)),
        );
    }
  }

  public namespaceViewLink (
    ownerKey: string,
    namespaceId: number,
  ) {
    return ['/', ownerKey, 'namespace', namespaceId];
  }

  public settleLink (
    ownerKey: string,
    namespaceId: number,
  ) {
    return ['/', ownerKey, 'namespace',
      namespaceId, 'settle'];
  }

  public addExpenseLink (
    ownerKey: string,
    namespaceId: number,
  ) {
    return ['/', ownerKey, 'namespace', namespaceId, 'add'];
  }

  public editRecordLink (
    recordId: number,
    ownerKey: string,
    namespaceId: number,
  ) {
    return ['/', ownerKey, 'namespace',
      namespaceId, 'edit', recordId];
  }

  public inviteLink (
    ownerKey: string,
    namespaceId: number,
  ) {
    return ['/', ownerKey, 'namespace', namespaceId, 'invite'];
  }

  public invitationLink (
    invitationId: string,
  ) {
    return ['/invitation', invitationId ];
  }

  public invitationRegisterLink (
    invitationId: string,
  ) {
    return ['/invitation', invitationId, 'register' ];
  }

  public editProfileLink (
    ownerKey: string,
  ) {
    return ['/', ownerKey, 'profile'];
  }

  public goToLoginView () {
    this.router.navigate(['/login']);
  }
}