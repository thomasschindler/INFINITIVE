import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'expo-router';

type UserProgressInfo = {
  id: string;
  email: string;
  progressCount: number;
};

export default function AdminScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usersInfo, setUsersInfo] = useState<UserProgressInfo[]>([]);

  useEffect(() => {
    // Basic frontend check just in case, though backend RLS also protects
    if (session?.user?.email !== 't@delodi.net') {
      router.replace('/');
      return;
    }
    
    fetchUsersProgress();
  }, []);

  const fetchUsersProgress = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');
        
      if (profilesError) throw profilesError;

      // Fetch all progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id');
        
      if (progressError) throw progressError;

      // Group progress by user
      const progressCounts: Record<string, number> = {};
      (progress || []).forEach(p => {
        progressCounts[p.user_id] = (progressCounts[p.user_id] || 0) + 1;
      });

      const info: UserProgressInfo[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'Unknown Email',
        progressCount: progressCounts[profile.id] || 0
      }));

      // Sort by progress descending
      info.sort((a, b) => b.progressCount - a.progressCount);

      setUsersInfo(info);
    } catch (e: any) {
      console.error('Error fetching admin data:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UserProgressInfo }) => (
    <View style={styles.card}>
      <Text style={styles.emailText}>{item.email}</Text>
      <Text style={styles.progressText}>Progress: {item.progressCount} / 38</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Panel</Text>
      <Text style={styles.subHeader}>User Progress Overview</Text>
      
      <FlatList
        data={usersInfo}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});
