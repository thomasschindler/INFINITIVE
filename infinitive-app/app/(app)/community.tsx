import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function CommunityScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Congratulations! 🎉</Text>
      
      <View style={styles.card}>
        <Text style={styles.text}>
          You have completed all 38 videos of the INFINITIVE course!
        </Text>
        <Text style={styles.subtext}>
          Welcome to the INFINITIVE Community. 
          We're so glad you've made it this far. Stay tuned for exciting community features coming soon.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.buttonText}>Review Your Journey</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 30,
    borderRadius: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtext: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    padding: 15,
    alignItems: 'center',
  },
  signOutText: {
    color: '#666',
    fontSize: 16,
  },
});
