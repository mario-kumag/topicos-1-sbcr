import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

// Componentes temáticos - Corregidos para evitar el error de "Cannot find module"
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Configuración de Firebase
import { auth, db } from '../../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [enTurno, setEnTurno] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  
  // Extraemos solo el nombre de usuario (antes del @)
  const rawEmail = auth.currentUser?.email || "";
  const guardiaNombre = rawEmail.split('@')[0] || "Invitado";

  useEffect(() => {
    // Protección de ruta: Si no hay usuario, esperar un momento y mandar al login
    const checkAuth = setTimeout(() => {
      if (!auth.currentUser) {
        router.replace('/login');
      }
    }, 1500); // 1.5 segundos para asegurar que el Root Layout esté listo

    return () => clearTimeout(checkAuth);
  }, []);

  const registrarAsistencia = async () => {
    setCargando(true);
    try {
      const nuevoEstado = !enTurno;
      await addDoc(collection(db, "asistencias"), {
        evento: nuevoEstado ? "ENTRADA" : "SALIDA",
        fechaServidor: serverTimestamp(),
        guardia: guardiaNombre,
        proyecto: "SBCR-UMAG"
      });
      setEnTurno(nuevoEstado);
      Alert.alert("Éxito", `Registro de ${nuevoEstado ? 'Entrada' : 'Salida'} guardado.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar con Firebase.");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>SBCR - Panel de Control</ThemedText>
      
      <ThemedView style={styles.infoCard}>
        <ThemedText style={styles.infoLabel}>Vigilante:</ThemedText>
        <ThemedText style={styles.infoText}>{guardiaNombre.toUpperCase()}</ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText style={styles.statusLabel}>Estado Actual:</ThemedText>
        <ThemedText 
          type="defaultSemiBold" 
          style={[styles.statusText, { color: enTurno ? '#4CAF50' : '#F44336' }]}
        >
          {enTurno ? "EN JORNADA LABORAL" : "FUERA DE TURNO"}
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: enTurno ? '#F44336' : '#2196F3' }]} 
        onPress={registrarAsistencia}
        disabled={cargando}
      >
        {cargando ? <ActivityIndicator color="#fff" /> : (
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            {enTurno ? "FINALIZAR TURNO" : "INICIAR TURNO"}
          </ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { marginBottom: 30 },
  infoCard: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, width: '100%', marginBottom: 15 },
  infoLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase' as const },
  infoText: { fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 25, elevation: 4 },
  statusLabel: { fontSize: 14, color: '#888' },
  statusText: { fontSize: 22, fontWeight: 'bold' as const, marginTop: 10 },
  button: { width: '100%', height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' as const },
  logoutButton: { marginTop: 40, padding: 10 },
  logoutText: { color: '#F44336', fontWeight: 'bold' as const }
});