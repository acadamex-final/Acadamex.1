/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

let initPromise: Promise<{ app: FirebaseApp, auth: Auth, db: Firestore } | { app: null, auth: null, db: null }> | null = null;

export async function getFirebase() {
  if (appInstance && authInstance && dbInstance) {
    return { app: appInstance, auth: authInstance, db: dbInstance };
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const configModule = await import('../../firebase-applet-config.json');
      const firebaseConfig = configModule.default;
      
      if (!getApps().length) {
        appInstance = initializeApp(firebaseConfig);
      } else {
        appInstance = getApps()[0];
      }
      
      authInstance = getAuth(appInstance);
      const dbId = firebaseConfig.firestoreDatabaseId;
      if (dbId && dbId !== "(default)") {
        dbInstance = getFirestore(appInstance, dbId);
      } else {
        dbInstance = getFirestore(appInstance);
      }

      return { app: appInstance, auth: authInstance, db: dbInstance };
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      initPromise = null; // Allow retry on failure
      return { app: null, auth: null, db: null };
    }
  })();

  return initPromise;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: Auth | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);

  // Dispatch custom event for quota errors
  if (typeof window !== 'undefined' && errInfo.error.toLowerCase().includes('quota')) {
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { detail: errInfo.error }));
  }

  throw new Error(errorJson);
}

export { OperationType };
