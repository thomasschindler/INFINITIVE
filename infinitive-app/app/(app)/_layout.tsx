import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Infinitive' }} />
      <Stack.Screen name="video/[id]" options={{ title: 'Watch Video' }} />
      <Stack.Screen name="history" options={{ title: 'Watched Videos' }} />
      <Stack.Screen name="community" options={{ title: 'Welcome', headerShown: false }} />
      <Stack.Screen name="account" options={{ title: 'Account Settings', presentation: 'modal' }} />
      <Stack.Screen name="admin" options={{ title: 'Admin Panel' }} />
    </Stack>
  );
}