import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, Subject, debounceTime, map, of, takeWhile } from "rxjs";
import { AvatarData } from "@angular-monorepo/entities";
import { ConfigService } from "./config.service";

@Injectable()
export class AvatarService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);

    private readonly line$ = new BehaviorSubject<number[]>([]);

    private readonly cache: Record<number, AvatarData> = {};
    private readonly result$ 
        = new Subject<Record<number, AvatarData>>();

    public load (
        avatarId: number,
    ): Observable<AvatarData> {
        if (this.cache[avatarId]) return of(this.cache[avatarId]);
        else {
            if (!this.line$.value.includes(avatarId)) {
                this.line$.next([...this.line$.value, avatarId]);
            }
            return this.getAvatarFromLine(avatarId);
        } 
    }

    private loadAvatars (
        ids: number[],
    ): Observable<AvatarData[]> {
        return this.http.get<AvatarData[]>(
            this.config.getConfig().middlewareUrl + '/avatar',
            {
                params: new HttpParams({
                    fromObject: { avatarIds: ids }
                }),
            }
        );
    }

    private getAvatarFromLine (
        id: number
    ): Observable<AvatarData> {
        return this.result$
            .pipe(
                takeWhile(result => !result[id], true),
                map(result => result[id]),
            );
    }

    constructor () {
        this.line$
        .pipe(debounceTime(0))
        .subscribe(lines => {
            this.loadAvatars(lines).subscribe(result => {
                result.forEach(rp => {
                    this.cache[rp.id] = rp;
                });
                this.result$.next(this.cache);
            });
        });
    }
}