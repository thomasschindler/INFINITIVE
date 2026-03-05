import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

type Video = {
  id: string;
  title: string;
  order_index: number;
};

type UserProgress = {
  video_id: string;
  completed_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  
  const [nextVideo, setNextVideo] = useState<Video | null>(null);
  const [canWatchToday, setCanWatchToday] = useState(false);

  const loadData = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      // Fetch all videos, ordered
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, title, order_index')
        .order('order_index', { ascending: true });

      if (videosError) throw videosError;

      // Fetch user's progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('video_id, completed_at')
        .eq('user_id', session.user.id);

      if (progressError) throw progressError;

      setVideos(videosData || []);
      setProgress(progressData || []);

      calculateState(videosData || [], progressData || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [session])
  );

  const calculateState = (vids: Video[], prog: UserProgress[]) => {
    const completedVideoIds = new Set(prog.map(p => p.video_id));
    
    // Find next video
    const uncompletedVideos = vids.filter(v => !completedVideoIds.has(v.id));
    const nextVid = uncompletedVideos.length > 0 ? uncompletedVideos[0] : null;
    
    setNextVideo(nextVid);

    // Check if watched today
    const today = new Date().toISOString().split('T')[0];
    const watchedToday = prog.some(p => p.completed_at.startsWith(today));
    
    setCanWatchToday(!watchedToday);

    // If no next video, it means all 38 are watched. Redirect to community?
    if (!nextVid && vids.length > 0) {
      router.replace('/community');
    }
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to INFINITIVE</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Journey</Text>
        
        {nextVideo ? (
          <View>
            <Text style={styles.videoText}>Next up: {nextVideo.title}</Text>
            {canWatchToday ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push(`/video/${nextVideo.id}`)}
              >
                <Text style={styles.buttonText}>Watch Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedContainer}>
                <Text style={styles.lockedText}>You've already watched a video today.</Text>
                <Text style={styles.lockedSubText}>Come back tomorrow for the next one!</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.videoText}>You have completed all videos!</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.secondaryButtonText}>View Watched Videos</Text>
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
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  videoText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lockedContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  lockedText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  lockedSubText: {
    color: '#c62828',
    fontSize: 12,
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 'auto',
    padding: 15,
    alignItems: 'center',
  },
  signOutText: {
    color: '#666',
    fontSize: 16,
  },
});
