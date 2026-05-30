import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { getFirebase } from '../services/firebase';

interface FirebaseContextType {
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth: null,
  db: null,
  user: null,
  loading: true,
  initialized: false,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { auth: authInstance, db: dbInstance } = await getFirebase();
      if (authInstance && dbInstance) {
        setAuth(authInstance);
        setDb(dbInstance);
        const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          setInitialized(true);
        });
        return unsubscribe;
      } else {
        setLoading(false);
        setInitialized(true);
      }
    };
    init();
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, db, user, loading, initialized }}>
      {children}
    </FirebaseContext.Provider>
  );
};
