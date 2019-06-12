import { graphql } from 'graphql';
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
    return this.getResourceFromGraphQl();
    // this.testGraphQl();
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

  private async getResourceFromGraphQl() {
    return fetch('https://us-central1-greggs-d6c7a.cloudfunctions.net/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ replies { weight, content } }' })
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }
}
