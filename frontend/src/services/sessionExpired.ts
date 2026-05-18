import { Alert } from 'react-native';

let clearLocalAuth: (() => Promise<void>) | null = null;
let dialogOpen = false;

/** Call from AuthProvider mount — clears storage + React state without hitting the API. */
export function registerSessionExpiredClear(handler: (() => Promise<void>) | null): void {
  clearLocalAuth = handler;
}

export function showSessionExpiredDialog(): void {
  if (dialogOpen) return;
  const clear = clearLocalAuth;
  if (!clear) return;

  dialogOpen = true;
  Alert.alert(
    'Session expired',
    'Your session has ended. Please sign in again to continue.',
    [
      {
        text: 'Sign in',
        style: 'default',
        onPress: () => {
          void (async () => {
            try {
              await clear();
            } finally {
              dialogOpen = false;
            }
          })();
        },
      },
    ],
    { cancelable: false },
  );
}
