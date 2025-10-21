import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../modules/data.service';

@Injectable()
export class FileUploadService {

  private readonly dataService = inject(DataService);

  public upload = (
    file: File,
  ): Observable<{
        url: string,
    }> => {
    return this.dataService.uploadFile(file);
  };
}