import { Injectable, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, map, of, take } from "rxjs";
import { UserService } from "../auth/token/auth.token.user.service";

@Injectable()
export class RoutingService {

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(UserService);
    
    public getOwnerKey () {
        return this.userService.loadUserProfile()
            .pipe(map(up => up.key as string));
        // i dont know why route params are not working - TODO
        return of(window.location.href.split('/')[3])
        return this.route
            .params.pipe(
                map(params => {
                    console.log(params);
                    return params['ownerKey'] as string
                }),
                take(1),
            );
    }

    public getNamespaceId () {
        // i dont know why route params are not working - TODO
        return of(window.location.href.split('/')[5])
            .pipe(map(stringId => Number(stringId)))
    }

    public getInvitationId () {
        // i dont know why route params are not working - TODO
        return of(window.location.href.split('/')[4])
        return this.route
            .params.pipe(
                map(params => {
                    console.log(params);
                    return params['namespaceId'] as string
                }),
                take(1),
            );
    }

    public goToOwnerRealmView (
        ownerKey?: string
    ) {
        if (ownerKey) {
            this.router.navigate(['/', ownerKey, 'realm']);
        } else {
            this.getOwnerKey()
                .subscribe(
                    ownerKey => this.goToOwnerRealmView(ownerKey)
                )
        }
    }

    public goToNewNamespaceView () {
        this.getOwnerKey()
            .subscribe(
                ownerKey => this.router.navigate(['/', ownerKey, 'new'])
            )
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
                        this.namespaceViewLink(ownerKeyG, namespaceId))
                )
        }
        else {
            combineLatest(
                this.getOwnerKey(),
                this.getNamespaceId(),
            )
                .subscribe(
                    ([ownerKeyG, namespaceIdG]) => this.router.navigate(
                        this.namespaceViewLink(ownerKeyG, namespaceIdG))
                )
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
                        this.addExpenseLink(ownerKeyG, namespaceId))
                )
        }
        else {
            combineLatest(
                this.getOwnerKey(),
                this.getNamespaceId(),
            )
                .subscribe(
                    ([ownerKeyG, namespaceIdG]) => this.router.navigate(
                        this.addExpenseLink(ownerKeyG, namespaceIdG))
                )
        }
    }

    public namespaceViewLink (
        ownerKey: string,
        namespaceId: number,
    ) {
        return ['/', ownerKey, 'namespace', namespaceId];
    }

    public addExpenseLink (
        ownerKey: string,
        namespaceId: number,
    ) {
        return ['/', ownerKey, 'namespace', namespaceId, 'add'];
    }
}