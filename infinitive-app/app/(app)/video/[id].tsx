import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../providers/AuthProvider';

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVideo(data);

      // Check if already completed
      if (session?.user?.id) {
        const { data: progData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('video_id', id)
          .single();
        
        if (progData) {
          setIsCompleted(true);
        }
      }
    } catch (error: any) {
      Alert.alert('Error loading video', error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended' && !isCompleted && !saving) {
      handleVideoCompletion();
    }
  }, [isCompleted, saving]);

  const handleVideoCompletion = async () => {
    if (!session?.user?.id || !video) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert([
          { user_id: session.user.id, video_id: video.id }
        ]);
        
      if (error) throw error;
      
      setIsCompleted(true);
      Alert.alert('Congratulations!', 'You have completed this video.');
      
      // If it's the 38th video, we could navigate to community, but we handle that in dashboard
      router.back();
    } catch (error: any) {
      Alert.alert('Error saving progress', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Video not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{video.title}</Text>
      {video.description ? (
        <Text style={styles.description}>{video.description}</Text>
      ) : null}
      
      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={220}
          play={false}
          videoId={video.youtube_id}
          onChangeState={onStateChange}
        />
      </View>
      
      {isCompleted ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓ Watched</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.primaryButton, saving && styles.disabledButton]} 
          onPress={handleVideoCompletion}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>Mark as Watched</Text>
        </TouchableOpacity>
      )}

      {saving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.savingText}>Saving progress...</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  playerContainer: {
    marginVertical: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  completedText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  savingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  savingText: {
    marginLeft: 10,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
