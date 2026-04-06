import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

import ScheduleScreen from '../screens/doctor/ScheduleScreen';
import ProfileScreen from '../screens/doctor/ProfileScreen';

const Tab = createBottomTabNavigator();
const ScheduleStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const ScheduleNavigator = () => (
    <ScheduleStack.Navigator>
        <ScheduleStack.Screen name="ScheduleMain" component={ScheduleScreen} options={{ title: 'Schedule' }} />
    </ScheduleStack.Navigator>
);

const ProfileNavigator = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
);

const DoctorTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'ScheduleTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            })}
        >
            <Tab.Screen name="ScheduleTab" component={ScheduleNavigator} options={{ tabBarLabel: 'Schedule' }} />
            <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default DoctorTabs;
