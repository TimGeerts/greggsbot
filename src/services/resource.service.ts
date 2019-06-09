import fetch from 'node-fetch';
import logger from '../logger';

export class ResourceService {
  private apiUrl: string;

  constructor() {
    const maybeFirebaseUrl = process.env.API;
    if (maybeFirebaseUrl === undefined) {
      logger.error('API url not sent in process envs');
      throw new Error('');
    }
    this.apiUrl = maybeFirebaseUrl;
  }

  public getRaidGuides() {
    const URL = `${this.apiUrl}raids.json`;
    return this.getResource(URL);
  }

  public getQuickLinks() {
    const URL = `${this.apiUrl}links.json`;
    return this.getResource(URL);
  }

  public getAnswers() {
    const URL = `${this.apiUrl}answers.json`;
    return this.getResource(URL);
  }

  public getPastas() {
    const URL = `${this.apiUrl}pastas.json`;
    return this.getResource(URL);
  }

  public getReminders() {
    const URL = `${this.apiUrl}reminders.json`;
    return this.getResource(URL);
  }

  public getBotResponses() {
    const url = `${this.apiUrl}botreplies.json`;
    return this.getResource(url);
  }

  private async getResource(url: string) {
    const r = await fetch(url);
    if (r.ok) {
      return r.json();
    }
    throw new Error(r.statusText);
  }
}
