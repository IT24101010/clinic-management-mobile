import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const ErrorAlert = ({ message }) => {
    if (!message) return null;

    return (
        <View style={styles.container}>
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderColor: colors.danger,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
    },
    text: {
        color: colors.danger,
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
});

export default ErrorAlert;
