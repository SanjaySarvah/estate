import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';

type InternetStatus = 'checking' | 'connected' | 'slow' | 'disconnected';

const InternetCheck = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<InternetStatus>('checking');
  const [speed, setSpeed] = useState<number | null>(null); // in Mbps
  const [loading, setLoading] = useState(false);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setStatus('checking');

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setStatus('disconnected');
      setLoading(false);
      return;
    }

    try {
      const start = Date.now();
      const response = await fetch('https://httpbin.org/image/jpeg');
      const blob = await response.blob();
      const end = Date.now();

      const sizeInBits = blob.size * 8;
      const durationInSeconds = (end - start) / 1000;
      const speedMbps = sizeInBits / (1024 * 1024) / durationInSeconds;

      setSpeed(parseFloat(speedMbps.toFixed(2)));

      // Consider slow if less than 1 Mbps OR less than 100 KBps
      const speedKBps = speedMbps * 1024 / 8; // convert Mbps to KBps
      if (speedMbps < 1 && speedKBps < 100) {
        setStatus('slow');
      } else {
        setStatus('connected');
      }
    } catch (error) {
      setStatus('disconnected');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkConnection();
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setStatus('disconnected');
      }
    });
    return () => unsubscribe();
  }, [checkConnection]);

  const RefreshButton = () => (
    <TouchableOpacity style={styles.refreshButton} onPress={checkConnection} disabled={loading}>
      <Ionicons name="refresh" size={24} color="#fff" />
      <Text style={styles.refreshText}>{loading ? 'Checking...' : 'Refresh'}</Text>
    </TouchableOpacity>
  );

  const GradientContainer = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
      <RefreshButton />
    </LinearGradient>
  );

  if (status === 'checking') {
    return (
      <GradientContainer>
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.statusText}>Checking internet connection...</Text>
        </View>
      </GradientContainer>
    );
  }

  if (status === 'disconnected') {
    return (
      <GradientContainer>
        <View style={styles.statusContainer}>
          <Ionicons name="wifi-off" size={48} color="#fff" />
          <Text style={styles.statusText}>No Internet Connection</Text>
          <Text style={styles.subText}>Please check your network settings</Text>
        </View>
      </GradientContainer>
    );
  }

  if (status === 'slow') {
    return (
      <GradientContainer>
        <View style={styles.statusContainer}>
          <Ionicons name="alert-circle" size={48} color="#fff" />
          <Text style={styles.statusText}>Slow Internet Detected</Text>
          <Text style={styles.subText}>
            Speed: {speed} Mbps ({(speed! * 1024 / 8).toFixed(0)} KBps)
          </Text>
          <Text style={styles.subText}>Some features may not work properly</Text>
        </View>
      </GradientContainer>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 22,
    color: '#fff',
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  refreshText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default InternetCheck;
