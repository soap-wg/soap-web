import { compare } from 'bcryptjs';
import { compactVerify, decodeJwt, decodeProtectedHeader } from 'jose';
import GitLab from './GitLab';
import Microsoft from './Microsoft';

function getUnix() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Compares a fingerprint against a hashed and salted fingerprint
 * @param {string} alg Algorithm used
 * @param {number} rounds Number of rounds
 * @param {string} salt Salt to check against
 * @param {string} hash Hash to compare
 * @param {string} fingerprint Actual fingerprint
 * @returns Async true if equal
 */
export function compareFingerprint(alg, rounds, salt, hash, fingerprint) {
  compare(fingerprint, `$${alg}$${rounds}$${salt}${hash}`).then((valid) => {
    if (!valid) {
      throw new Error('Fingerprint comparison failed.');
    }
  })
}

export function providerByIssuer(issuer) {
  if (issuer === Microsoft.issuer) {
    return Microsoft;
  } else if (issuer === GitLab.issuer) {
    return GitLab;
  }
}

const SPLIT_NONCE = /^(.+)&(.+)$/;

export async function checkToken(id_token, issuer, cmpNonce) {
  const header = decodeProtectedHeader(id_token);
  const payload = decodeJwt(id_token);
  const provider = providerByIssuer(payload.iss);

  if (provider === undefined) {
    throw new Error('Unknown issuer');
  }

  const key = await provider.getKeys(header.alg).then((keys) => {
    return keys.find((k) => k.kid === header.kid);
  });

  if (key === undefined) {
    throw new Error('key not found');
  }

  // compactVerify throws on illegal signature
  await compactVerify(id_token, key.cryptoKey);

  if (issuer !== undefined && provider.issuer !== issuer) {
    throw new Error('Token not issued by requested issuer.');
  }

  if (payload.aud !== provider.client_id) {
    throw new Error('Token not issued for this application.');
  }

  const m = SPLIT_NONCE.exec(payload.nonce);
  if (!m) {
    throw new Error('Invalid token structure.');
  }

  const nonce = m[1];
  if (cmpNonce && nonce !== cmpNonce) {
    throw new Error('Request outdated.');
  }

  if (getUnix() >= payload.exp) {
    throw new Error('The token expired.');
  }

  const hash = m[2];
  return { id_token, payload, nonce, hash, provider };
}
