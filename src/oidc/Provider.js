import { importJWK } from 'jose';
import { BASE_URL } from '../util/consts';

export default class Provider {
  constructor(name, issuer, clientId, redirect_path) {
    this.name = name;
    this.issuer = issuer;
    this.url = `${issuer}/.well-known/openid-configuration`;
    this.client_id = clientId;
    this.redirect_path = redirect_path;
    this.doc = undefined;
    this.keys = undefined;
  }

  loadDiscoveryDoc() {
    if (this.doc === undefined) {
      return fetch(this.url)
        .then((response) => response.json())
        .then((doc) => {
          this.doc = doc;
          return doc;
        });
    } else {
      return Promise.resolve(this.doc);
    }
  }

  get authorization_endpoint() {
    return this.loadDiscoveryDoc().then((doc) => doc.authorization_endpoint);
  }

  get token_endpoint() {
    return this.loadDiscoveryDoc().then((doc) => doc.token_endpoint);
  }

  get redirect_uri() {
    return `${BASE_URL}${this.redirect_path}`;
  }

  getKeys(alg) {
    if (this.keys === undefined) {
      return this.loadDiscoveryDoc()
        .then((doc) => fetch(doc.jwks_uri))
        .then((response) => response.json())
        .then((json) => {
          return Promise.all(
            json.keys.map((k) => importJWK(k, alg).then((cryptoKey) => {
              return { kid: k.kid, cryptoKey };
            })),
          );
        })
        .then((keys) => {
          this.keys = keys;
          return keys;
        })
    } else {
      return Promise.resolve(this.keys);
    }
  }
}
