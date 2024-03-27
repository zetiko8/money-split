import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigService } from "./config.service";

@Injectable()
export class FileUploadService {

    private readonly http = inject(HttpClient);
    private readonly config = inject(ConfigService);

    public upload = (
        file: File,
    ): Observable<{
        url: string,
    }> => {
        const formData = new FormData();
        formData.append("file", file, file.name);
        return this.http.post<{
            url: string
        }>(
            this.config.getConfig().middlewareUrl + '/upload',
            formData,
      );
    }
}