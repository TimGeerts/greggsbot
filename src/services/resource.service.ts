import { request } from 'graphql-request';
import { ClientError, Variables } from 'graphql-request/dist/src/types';
import fetch from 'node-fetch';
import logger from '../logger';
import { IReplies, IReply } from '../types';

export class ResourceService {
  private apiUrl: string;
  private gqlUrl: string;

  constructor() {
    const maybeFirebaseUrl = process.env.API;
    if (maybeFirebaseUrl === undefined) {
      logger.error('API url not sent in process envs');
      throw new Error('API url not sent in process envs');
    }
    this.apiUrl = maybeFirebaseUrl;

    this.gqlUrl = process.env.GQL || '';
    if (!this.gqlUrl || !this.gqlUrl.length) {
      logger.error('GQL url not sent in process envs');
      throw new Error('GQL environment value was not set');
    }
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

  public getBotResponses(): Promise<IReply[]> {
    const query = `{
      replies
      {
        weight,
        content
      }
    }`;
    return this.execGraphQl<IReplies>(query).then((r) => r.replies);
  }

  private async getResource(url: string) {
    const r = await fetch(url);
    if (r.ok) {
      return r.json();
    }
    throw new Error(r.statusText);
  }

  private execGraphQl<T>(query: string, variables?: Variables | undefined): Promise<T> {
    return request<T>(this.gqlUrl, query, variables).catch(this.handleError);
  }

  private handleError(error: ClientError): Promise<never> {
    let errorMessage = error.message;
    const errParts = errorMessage.split(': {');
    if (errParts.length && errParts.length > 0) {
      errorMessage = errParts[0];
    }
    logger.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
}
