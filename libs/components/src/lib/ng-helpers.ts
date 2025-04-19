import { combineLatest, map, Observable } from "rxjs";

export function combineLoaders (
  loaders: Observable<boolean>[]
): Observable<boolean> {
  return combineLatest(loaders).pipe(map(all => all.some(l => l)));
}