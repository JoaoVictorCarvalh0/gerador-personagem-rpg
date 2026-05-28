import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bgCard },
          headerTintColor: COLORS.gold,
          headerTitleStyle: { color: COLORS.text, fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="status"
          options={{ title: 'Forjando Personagem...', headerBackTitle: 'Voltar' }}
        />
        <Stack.Screen
          name="character"
          options={{ title: 'Personagem', headerBackTitle: 'Voltar' }}
        />
      </Stack>
    </>
  );
}
