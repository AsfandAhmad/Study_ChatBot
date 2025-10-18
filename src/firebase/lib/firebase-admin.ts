import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: When deployed to an App Hosting backend, the SERVICE_ACCOUNT env var
// will be automatically populated, and the SDK will be initialized without arguments.
const serviceAccount = process.env.SERVICE_ACCOUNT 
  ? JSON.parse(process.env.SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // In local dev or an environment with implicit credentials (like App Hosting),
    // initialize without arguments.
    initializeApp();
  }
}

export const firestore = getFirestore();
export const auth = getAuth();
