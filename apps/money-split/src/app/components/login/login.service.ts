import { Observable } from "rxjs";

export abstract class LoginService {
    public abstract onSuccess: (
        ownerKey: string
    ) => void;
    public abstract registerLink$: Observable<string[]>;
}