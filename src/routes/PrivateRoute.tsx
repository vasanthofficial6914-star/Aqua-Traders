import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    allowedRole?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRole }) => {
    const { role, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Normalize allowed roles
    let allowedRoles: string[] = [];
    if (allowedRole) {
        allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
        // Map customer to buyer for routing compatibility if needed
        if (allowedRoles.includes('customer') && !allowedRoles.includes('buyer')) allowedRoles.push('buyer');
        if (allowedRoles.includes('buyer') && !allowedRoles.includes('customer')) allowedRoles.push('customer');
    }

    // Check if user has permission
    if (allowedRole && !allowedRoles.includes(role as string)) {
        // Redirect based on current role
        if (role === 'buyer' || role === 'customer') return <Navigate to="/customerdashboard" replace />;
        if (role === 'fisherman') return <Navigate to="/fishermandashboard" replace />;
        if (role === 'admin') return <Navigate to="/admindashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
