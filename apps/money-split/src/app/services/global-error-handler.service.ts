import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export abstract class DisplayErrorService {
    abstract display(error: Error): void;
}

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: any): void {
    console.error(error.appMessage, error.message);
    if (error instanceof HttpErrorResponse) {
      if (error.error.message) {
        this.display(Error(error.error.message));
      } else {
        this.display(error);
      }
    }
    else if (error instanceof Error) {
      if (error.message.startsWith('NG0100: ExpressionChangedAfterItHasBeenCheckedError')) return;
      this.display(error);
    }
    // throw new Error('Method not implemented.');
  }

  private display (
    error: Error,
  ) {
    this.ngZone.run(() => {
      this.displayErrorService.display(error);
    });
  }

  constructor (
        private readonly displayErrorService: DisplayErrorService,
        private readonly ngZone: NgZone,
  ) {}
}
