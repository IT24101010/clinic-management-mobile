import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

import HomeScreen from '../screens/patient/HomeScreen';
import DoctorsScreen from '../screens/patient/DoctorsScreen';
import AppointmentsScreen from '../screens/patient/AppointmentsScreen';
import ServicesScreen from '../screens/patient/ServicesScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const DoctorsStack = createStackNavigator();
const AppointmentsStack = createStackNavigator();
const ServicesStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeNavigator = () => (
    <HomeStack.Navigator>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
    </HomeStack.Navigator>
);

const DoctorsNavigator = () => (
    <DoctorsStack.Navigator>
        <DoctorsStack.Screen name="DoctorsMain" component={DoctorsScreen} options={{ title: 'Doctors' }} />
    </DoctorsStack.Navigator>
);

const AppointmentsNavigator = () => (
    <AppointmentsStack.Navigator>
        <AppointmentsStack.Screen name="AppointmentsMain" component={AppointmentsScreen} options={{ title: 'Appointments' }} />
    </AppointmentsStack.Navigator>
);

const ServicesNavigator = () => (
    <ServicesStack.Navigator>
        <ServicesStack.Screen name="ServicesMain" component={ServicesScreen} options={{ title: 'Services' }} />
    </ServicesStack.Navigator>
);

const ProfileNavigator = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
);

const PatientTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'DoctorsTab') {
                        iconName = focused ? 'medkit' : 'medkit-outline';
                    } else if (route.name === 'AppointmentsTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'ServicesTab') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="DoctorsTab" component={DoctorsNavigator} options={{ tabBarLabel: 'Doctors' }} />
            <Tab.Screen name="AppointmentsTab" component={AppointmentsNavigator} options={{ tabBarLabel: 'Appointments' }} />
            <Tab.Screen name="ServicesTab" component={ServicesNavigator} options={{ tabBarLabel: 'Services' }} />
            <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default PatientTabs;
