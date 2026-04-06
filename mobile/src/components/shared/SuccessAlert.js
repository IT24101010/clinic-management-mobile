import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const SuccessAlert = ({ message }) => {
    if (!message) return null;

    return (
        <View style={styles.container}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderColor: colors.success,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
    },
    text: {
        color: colors.success,
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
});

export default SuccessAlert;
