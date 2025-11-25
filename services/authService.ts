
import { User } from '../types';
import { sendVerificationEmail } from './emailService';

const USERS_STORAGE_KEY = 'omnipost_users_db';
const SESSION_STORAGE_KEY = 'omnipost_session';

interface StoredUser extends User {
  password?: string;
  activationCode?: string;
  activationExpiresAt?: number; // Timestamp for code expiration
}

// Initialize DB with a default admin if empty
const initDB = () => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  if (!users) {
    const defaultAdmin: StoredUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@omnipost.ai',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      joinedAt: Date.now(),
      isVerified: true, // Admin is auto-verified
      isSuspended: false,
      password: 'admin123'
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const getAllUsers = (): User[] => {
  initDB();
  // Return users without sensitive data
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  return users.map(({ password, activationCode, ...user }) => user as User);
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ user: User; activationCode: string; emailSent: boolean }> => {
  initDB();
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists with this email.');
  }

  // Generate a 6-digit activation code
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiration to 5 minutes from now
  const expiresAt = Date.now() + (5 * 60 * 1000);

  const newUser: StoredUser = {
    id: Date.now().toString(),
    name,
    email,
    role: 'user', 
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    joinedAt: Date.now(),
    isVerified: false,
    isSuspended: false, 
    activationCode: activationCode,
    activationExpiresAt: expiresAt,
    password: password
  };

  // Attempt to send verification email
  const emailSent = await sendVerificationEmail(name, email, activationCode);

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  const { password: _, ...safeUser } = newUser;
  return { user: safeUser as User, activationCode, emailSent };
};

export const resendVerificationCode = async (email: string): Promise<{ code: string; emailSent: boolean }> => {
  initDB();
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    throw new Error('User not found.');
  }

  const user = users[userIndex];
  if (user.isVerified) {
    throw new Error('User is already verified.');
  }

  // Generate NEW code and NEW expiration
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiration = Date.now() + (5 * 60 * 1000);

  users[userIndex].activationCode = newCode;
  users[userIndex].activationExpiresAt = newExpiration;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const emailSent = await sendVerificationEmail(user.name, user.email, newCode);
  
  return { code: newCode, emailSent };
};

export const activateAccount = (email: string, code: string): User => {
  initDB();
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    throw new Error('User not found.');
  }

  const user = users[userIndex];

  if (user.isVerified) {
    const { password: _, activationCode: __, ...safeUser } = user;
    return safeUser as User;
  }

  if (user.activationExpiresAt && Date.now() > user.activationExpiresAt) {
    throw new Error('Activation code has expired. Please resend a new code.');
  }

  if (user.activationCode !== code) {
    throw new Error('Invalid activation code.');
  }

  users[userIndex].isVerified = true;
  users[userIndex].activationCode = undefined; 
  users[userIndex].activationExpiresAt = undefined;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const { password: _, activationCode: __, ...safeUser } = users[userIndex];
  return safeUser as User;
};

export const loginUser = (email: string, password: string): User => {
  initDB();
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  
  const user = users.find((u) => u.email === email);
  
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  if (user.isVerified === false) {
    throw new Error('Account not activated. Please verify your email.');
  }

  if (user.isSuspended) {
    throw new Error('Account suspended. Contact support.');
  }

  const { password: _, activationCode: __, ...safeUser } = user;
  return safeUser as User;
};

// Admin Functions

export const deleteUser = (userId: string): void => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const newUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
};

export const updateUserStatus = (userId: string, isSuspended: boolean): void => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].isSuspended = isSuspended;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

export const updateUserRole = (userId: string, role: 'user' | 'admin'): void => {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].role = role;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

export const getCurrentSession = (): User | null => {
  const session = localStorage.getItem(SESSION_STORAGE_KEY);
  return session ? JSON.parse(session) : null;
};

export const setSession = (user: User) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};
