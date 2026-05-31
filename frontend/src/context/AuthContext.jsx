import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "gatherly-auth-user";
const REGISTERED_USERS_STORAGE_KEY = "gatherly-registered-users";
const ADMIN_EMAIL = "anuj12@gmail.com";
const ADMIN_PASSWORD = "test@123";

const AuthContext = createContext(null);

function readStorageValue(key) {
  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function readStoredUser() {
  return readStorageValue(AUTH_STORAGE_KEY);
}

function readRegisteredUsers() {
  const users = readStorageValue(REGISTERED_USERS_STORAGE_KEY);
  return Array.isArray(users) ? users : [];
}

function persistRegisteredUsers(users) {
  window.localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [registeredUsers, setRegisteredUsers] = useState(() => readRegisteredUsers());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    persistRegisteredUsers(registeredUsers);
  }, [registeredUsers]);

  function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error("Invalid email or password.");
    }

    if (normalizedEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        throw new Error("Invalid email or password.");
      }

      const adminUser = {
        name: "Anuj Admin",
        email: ADMIN_EMAIL,
        role: "admin",
      };
      setUser(adminUser);
      return adminUser;
    }

    const existingUser = registeredUsers.find((registeredUser) => registeredUser.email === normalizedEmail);

    if (!existingUser) {
      throw new Error("User not found. Please sign up first.");
    }

    if (existingUser.password !== password) {
      throw new Error("Invalid email or password.");
    }

    const loggedInUser = {
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    };
    setUser(loggedInUser);
    return loggedInUser;
  }

  function signUp({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !normalizedEmail || !password) {
      throw new Error("Please complete all fields.");
    }

    if (normalizedEmail === ADMIN_EMAIL) {
      throw new Error("Admin email is reserved and cannot be used for sign up.");
    }

    const alreadyExists = registeredUsers.some((registeredUser) => registeredUser.email === normalizedEmail);
    if (alreadyExists) {
      throw new Error("User already exists. Please login.");
    }

    const nextUser = {
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: "user",
    };

    setRegisteredUsers((current) => [...current, nextUser]);
    setUser({
      name: nextUser.name,
      email: nextUser.email,
      role: nextUser.role,
    });

    return nextUser;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      signUp,
      logout,
      adminEmail: ADMIN_EMAIL,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
