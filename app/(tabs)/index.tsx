import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function HomeScreen() {
  const [enTurno, setEnTurno] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);

  const registrarAsistencia = async () => {
    setCargando(true);
    try {
      const nuevoEstado = !enTurno;
      
      // Guardar en la nube (Firestore)
      await addDoc(collection(db, "asistencias"), {
        evento: nuevoEstado ? "ENTRADA" : "SALIDA",
        fechaServidor: serverTimestamp(),
        guardia: "Mario Alexander",
        proyecto: "SBCR-UMAG"
      });

      setEnTurno(nuevoEstado);
      Alert.alert("Éxito", `Registro de ${nuevoEstado ? 'Entrada' : 'Salida'} guardado en Firebase.`);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar con la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Seguridad SBCR</Text>
      
      <View style={styles.card}>
        <Text style={styles.statusLabel}>Estado Actual del Guardia:</Text>
        <Text style={[styles.statusText, { color: enTurno ? '#4CAF50' : '#F44336' }]}>
          {enTurno ? "TRABAJANDO (EN TURNO)" : "FUERA DE TURNO"}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: enTurno ? '#F44336' : '#2196F3' }]} 
        onPress={registrarAsistencia}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {enTurno ? "REGISTRAR SALIDA" : "REGISTRAR ENTRADA"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20, elevation: 3 },
  statusLabel: { fontSize: 14, color: '#666', textTransform: 'uppercase' },
  statusText: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  button: { width: '100%', padding: 18, borderRadius: 10, alignItems: 'center', height: 60, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
;