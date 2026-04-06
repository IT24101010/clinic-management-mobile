import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';
import AdminTabs from './AdminTabs';

const AppNavigator = () => {
    const { isAuthenticated, isLoading, isPatient, isDoctor, isAdmin } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const renderAuthenticatedTabs = () => {
        if (isAdmin) return <AdminTabs />;
        if (isDoctor) return <DoctorTabs />;
        // default to patient
        return <PatientTabs />;
    };

    return (
        <NavigationContainer>
            {isAuthenticated ? renderAuthenticatedTabs() : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
