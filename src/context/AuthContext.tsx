import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Role = 'fisherman' | 'buyer' | 'admin' | 'customer';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    role: Role | 'guest';
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<Role | 'guest'>('guest');

    useEffect(() => {
        // Check localStorage on mount
        const storedToken = localStorage.getItem('fisherDirectToken');
        const storedUser = localStorage.getItem('fisherDirectUser');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setRole(parsedUser.role === 'customer' ? 'buyer' : parsedUser.role);
            } catch (err) {
                console.error("Failed to parse user from local storage");
            }
        }
    }, []);

    const login = (userData: User, jwtToken: string) => {
        setUser(userData);
        setToken(jwtToken);

        // Normalize role between customer/buyer terminology
        const activeRole = userData.role === 'customer' ? 'buyer' : userData.role;
        setRole(activeRole);

        localStorage.setItem('fisherDirectToken', jwtToken);
        localStorage.setItem('fisherDirectUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole('guest');
        localStorage.removeItem('fisherDirectToken');
        localStorage.removeItem('fisherDirectUser');
    };

    return (
        <AuthContext.Provider value={{ user, role, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
