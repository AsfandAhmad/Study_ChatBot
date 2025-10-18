import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: When deployed to an App Hosting backend, the SERVICE_ACCOUNT env var
// will be automatically populated, and the SDK will be initialized without arguments.
const serviceAccount = process.env.SERVICE_ACCOUNT 
  ? JSON.parse(process.env.SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

export const firestore = getFirestore();
export const auth = getAuth();
