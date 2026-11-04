import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

// Designated default owner email from current project metadata
export const DEFAULT_ADMIN_EMAIL = 'mdsaifmeer9@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginCustomer: (email: string, pass: string) => Promise<void>;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  registerAdmin: (email: string, pass: string, name?: string) => Promise<void>;
  registerCustomer: (fullName: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  makeUserAdmin: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Firestore profile and verify claims
  const syncUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Check ID token result for custom claims if configured
      const idTokenResult = await user.getIdTokenResult(true);
      const hasCustomAdminClaim = !!idTokenResult.claims.admin;

      // Primary owner email always receives administrative clearance
      const isOwnerEmail = user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

      let profile: UserProfile;

      if (userDoc.exists()) {
        profile = { uid: user.uid, ...userDoc.data() } as UserProfile;
        
        // If owner email, guarantee admin role in profile
        if (isOwnerEmail && profile.role !== 'admin') {
          profile.role = 'admin';
          await updateDoc(userDocRef, { role: 'admin' });
        }
      } else {
        // Create initial profile
        profile = {
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'Valued Customer',
          role: isOwnerEmail ? 'admin' : 'customer',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile);
      }

      setUserProfile(profile);
      setIsAdmin(hasCustomAdminClaim || isOwnerEmail || profile.role === 'admin');

      // Keep backup in localStorage
      const usersList: UserProfile[] = JSON.parse(localStorage.getItem('kicks_all_users') || '[]');
      const existingIdx = usersList.findIndex(u => u.uid === profile.uid);
      if (existingIdx >= 0) {
        usersList[existingIdx] = profile;
      } else {
        usersList.push(profile);
      }
      localStorage.setItem('kicks_all_users', JSON.stringify(usersList));
    } catch (err) {
      console.warn('Could not sync user profile from Firestore:', err);
      // Fallback profile
      const isOwnerEmail = user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        fullName: user.displayName || 'Customer',
        role: isOwnerEmail ? 'admin' : 'customer'
      };
      setUserProfile(fallback);
      setIsAdmin(isOwnerEmail);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginCustomer = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      // If the owner logs in for the first time before account creation in Firebase Auth:
      if (
        (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') &&
        email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
      ) {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateFirebaseProfile(createCred.user, { displayName: 'KICKS Administrator' });
          await syncUserProfile(createCred.user);
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw new Error('Incorrect password for this account. Please verify your password or use Forgot Password.');
          }
          throw createErr;
        }
      }
      throw err;
    }
  };

  const loginAdmin = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      
      // Check credentials and authorization
      const isOwner = user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
      const tokenResult = await user.getIdTokenResult();
      const hasClaim = !!tokenResult.claims.admin;
      
      // Check firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const roleInDb = userDoc.exists() ? userDoc.data()?.role : null;

      if (!isOwner && !hasClaim && roleInDb !== 'admin') {
        await signOut(auth);
        throw new Error('Access Denied: This account does not possess administrator privileges.');
      }

      await syncUserProfile(user);
    } catch (err: any) {
      // If credentials failed and this is the designated owner email,
      // automatically bootstrap initial account creation if account doesn't exist yet!
      if (
        (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') &&
        email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
      ) {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateFirebaseProfile(createCred.user, { displayName: 'KICKS Administrator' });
          await syncUserProfile(createCred.user);
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw new Error('Incorrect password for registered administrator. Please check your password or use Forgot Password.');
          }
          throw createErr;
        }
      }
      throw err;
    }
  };

  const registerAdmin = async (email: string, pass: string, name: string = 'KICKS Administrator') => {
    const isOwner = email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (!isOwner) {
      throw new Error(`Only designated administrator (${DEFAULT_ADMIN_EMAIL}) can initialize admin accounts.`);
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateFirebaseProfile(cred.user, { displayName: name });
    await syncUserProfile(cred.user);
  };

  const registerCustomer = async (fullName: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;
    
    await updateFirebaseProfile(user, { displayName: fullName });

    const isOwner = email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
    const newProfile: UserProfile = {
      uid: user.uid,
      email: email.trim(),
      fullName: fullName.trim(),
      role: isOwner ? 'admin' : 'customer',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (e) {
      console.warn('Register setDoc profile warning:', e);
    }

    setUserProfile(newProfile);
    setIsAdmin(isOwner);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...data };
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), data);
    } catch (e) {
      console.warn('Update customer profile Firestore warning:', e);
    }
    setUserProfile(updated);
  };

  const makeUserAdmin = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: 'admin' });
      if (currentUser?.uid === uid) {
        setIsAdmin(true);
      }
    } catch (e) {
      console.warn('makeUserAdmin warning:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      isAdmin,
      loading,
      loginCustomer,
      loginAdmin,
      registerAdmin,
      registerCustomer,
      logout,
      resetPassword,
      updateCustomerProfile,
      makeUserAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
