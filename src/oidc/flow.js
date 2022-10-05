import { hash } from 'bcryptjs';
import { base64url } from 'jose';
import Persist from '../util/storage';

/**
 * Generates a b64 encoded nonce.
 * @param {number} sec Bit-security level
 * @returns Nonce
 */
function genNonce(sec = 256) {
  const arr = new Uint8Array(sec / 8);
  crypto.getRandomValues(arr);
  const nonce = window.btoa(arr);
  if (Persist.knowsNonce(nonce)) {
    return genNonce(sec);
  } else {
    return nonce;
  }
}

async function genVerifierChallenge(sec = 256) {
  const arr = new Uint8Array(sec / 8);
  crypto.getRandomValues(arr);
  const code_verifier = base64url.encode(arr);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code_verifier),
  );
  const code_challenge = base64url.encode(new Uint8Array(digest));
  return { code_verifier, code_challenge };
}

const ROUNDS = 10;
// .{2} is algorithm identifier, first group is number of rounds, second group is
// salt, and third group is hash.
const HASH_REG = /\$(.{2})\$(\d+)\$(.{22})(.+)/;

/**
 * Hashes and salts a value.
 * @param {string} fingerprint Value to hash
 * @returns Algorithm used, number of rounds used, generated salt and the hash
 */
function hashFingerprint(fp) {
  return hash(fp, ROUNDS).then((hashed) => {
    const m = HASH_REG.exec(hashed);
    const alg = m[1];
    const rounds = Number(m[2]);
    const salt = m[3];
    const hash = m[4];
    return { alg, rounds, salt, hash, fp };
  });
}

export default function getIdToken(provider, fp) {
  return Promise.all([
    provider.authorization_endpoint,
    hashFingerprint(fp),
    genVerifierChallenge(),
  ]).then(async ([endpoint, hashInfo, { code_verifier, code_challenge }]) => {
    // Store nonce for response; parallel requests are not possible
    const nonce = genNonce();
    Persist.latestRequest = {
      nonce,
      code_verifier,
      hashInfo,
      iss: provider.issuer,
    };

    const params = new URLSearchParams({
      'client_id': provider.client_id,
      'redirect_uri': provider.redirect_uri,
      'response_type': 'code',
      'code_challenge_method': 'S256',
      'code_challenge': code_challenge,
      'nonce': `${nonce}&${hashInfo.hash}`,
      'state': nonce,
      'scope': 'openid email',
    });

    window.open(`${endpoint}?${params.toString()}`, '_self');
  });
}
