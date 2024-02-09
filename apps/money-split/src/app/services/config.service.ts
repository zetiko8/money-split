import { Injectable } from '@angular/core';
import { AppConfig } from '../types';

@Injectable()
export class ConfigService {

  private config: AppConfig | null = null;

  setConfig (
    config: AppConfig,
  ) {
    this.config = config;
  }

  getConfig () {
    if (this.config == null)
      throw Error('Config not loaded jet');
    else {
      return this.config;
    }
  }
}
