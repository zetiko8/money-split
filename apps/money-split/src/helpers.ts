import { Observable, ReplaySubject, combineLatest, map } from "rxjs";

export function combineLoaders (
    loaders: Observable<boolean>[]
): Observable<boolean> {
    return combineLatest(loaders).pipe(map(all => all.some(l => l)));
}

export class ImprovedProcess <Argument, ReturnType> {
    private mmResourceLoadingCache: number[] = [];
    private loadFn: (data: Argument) => Observable<ReturnType>;
    public inProgress$ = new ReplaySubject<boolean>(1);
    public error$ = new ReplaySubject<Error | null>(1);
    public data$ = new ReplaySubject<ReturnType>(1);
    public load = (
        data: Argument,
    ) => {
        this.mmResourceLoadingCache.push(0);
        this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
        this.loadFn(data)
            .subscribe({
                next: value => {
                    this.mmResourceLoadingCache.pop();
                    this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
                    this.error$.next(null);
                    this.data$.next(value);
                },
                error: e => {
                    this.mmResourceLoadingCache.pop();
                    this.inProgress$.next(!!(this.mmResourceLoadingCache.length));
                    this.error$.next(e);
                },
            });
    }

    constructor (
        loadFn: (data: Argument) => Observable<ReturnType>
    ) {
        this.loadFn = loadFn;
    }

}