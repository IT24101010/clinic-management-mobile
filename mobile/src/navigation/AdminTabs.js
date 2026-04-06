import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

import UsersScreen from '../screens/admin/UsersScreen';
import ManageDashboardScreen from '../screens/admin/ManageDashboardScreen';
import ManageDoctorsScreen from '../screens/admin/ManageDoctorsScreen';
import ManageServicesScreen from '../screens/admin/ManageServicesScreen';
import ManageAppointmentsScreen from '../screens/admin/ManageAppointmentsScreen';
import ManageFeedbackScreen from '../screens/admin/ManageFeedbackScreen';
import ManageAnnouncementsScreen from '../screens/admin/ManageAnnouncementsScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';

const Tab = createBottomTabNavigator();
const UsersStack = createStackNavigator();
const ManageStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const UsersNavigator = () => (
    <UsersStack.Navigator>
        <UsersStack.Screen name="UsersMain" component={UsersScreen} options={{ title: 'Users' }} />
    </UsersStack.Navigator>
);

const ManageNavigator = () => (
    <ManageStack.Navigator>
        <ManageStack.Screen name="ManageDashboard" component={ManageDashboardScreen} options={{ title: 'Manage' }} />
        <ManageStack.Screen name="ManageDoctors" component={ManageDoctorsScreen} options={{ title: 'Doctors' }} />
        <ManageStack.Screen name="ManageServices" component={ManageServicesScreen} options={{ title: 'Services' }} />
        <ManageStack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} options={{ title: 'Appointments' }} />
        <ManageStack.Screen name="ManageFeedback" component={ManageFeedbackScreen} options={{ title: 'Feedback' }} />
        <ManageStack.Screen name="ManageAnnouncements" component={ManageAnnouncementsScreen} options={{ title: 'Announcements' }} />
    </ManageStack.Navigator>
);

const ProfileNavigator = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
);

const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'UsersTab') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'ManageTab') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            })}
        >
            <Tab.Screen name="UsersTab" component={UsersNavigator} options={{ tabBarLabel: 'Users' }} />
            <Tab.Screen name="ManageTab" component={ManageNavigator} options={{ tabBarLabel: 'Manage' }} />
            <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default AdminTabs;
