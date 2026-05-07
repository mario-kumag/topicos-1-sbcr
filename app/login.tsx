import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generamos el correo interno para Firebase (ej: malexander@sbcr-app.com)
  const internalEmail = `${username.trim().toLowerCase()}@sbcr-app.com`;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor, ingresa tu usuario y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, internalEmail, password);
      router.replace('/(tabs)');
    } catch (error) {
      let errorMessage = "Ocurrió un error desconocido al iniciar sesión.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = "Usuario o contraseña incorrectos.";
            break;
        }
      }
      Alert.alert("Error de Ingreso", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Completa todos los campos para crear una cuenta.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, internalEmail, password);
      Alert.alert("Éxito", "Cuenta creada correctamente.");
      router.replace('/(tabs)');
    } catch (error) {
      let errorMessage = "Ocurrió un error desconocido al registrar la cuenta.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Este nombre de usuario ya está en uso.";
            break;
          case 'auth/weak-password':
            errorMessage = "La contraseña debe tener al menos 6 caracteres.";
            break;
        }
      }
      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>SBCR Seguridad</ThemedText>
      <ThemedText style={styles.subtitle}>Panel de Control de Vigilancia</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario (ej: malexander)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp} disabled={loading}>
        <ThemedText style={styles.secondaryButtonText}>Registrar nuevo guardia</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25 },
  title: { textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 40, opacity: 0.6 },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2196F3', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { marginTop: 25, alignItems: 'center' },
  secondaryButtonText: { color: '#2196F3', fontWeight: '600' }
});