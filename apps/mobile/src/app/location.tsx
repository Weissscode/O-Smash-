import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { geocodeManualEntry, requestDeviceLocation } from '@/features/location/location-service';
import { userMessage } from '@/lib/errors';
import { haptics } from '@/lib/haptics';
import { RADIUS_OPTIONS_KM, useLocationStore } from '@/store/location-store';
import { useTheme } from '@/theme/theme';
import { inputReset } from '@/theme/typography';

/** Feuille de position : position actuelle, saisie manuelle et rayon. */
export default function LocationSheet() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location, radiusKm, setLocation, setRadius } = useLocationStore();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<'device' | 'manual' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onDevice = async () => {
    setBusy('device');
    setError(null);
    const result = await requestDeviceLocation();
    setBusy(null);
    if (result.status === 'granted') {
      haptics.success();
      setLocation(result.location);
      close();
    } else if (result.status === 'denied') {
      setError(
        result.canAskAgain
          ? 'Accès à la position refusé. Saisis une ville ou un code postal.'
          : "L'accès à la position est désactivé dans les Réglages. Saisis une ville ou un code postal.",
      );
    } else {
      setError(result.message);
    }
  };

  const onManual = async () => {
    setBusy('manual');
    setError(null);
    try {
      const result = await geocodeManualEntry(query);
      haptics.success();
      setLocation(result);
      close();
    } catch (e) {
      haptics.error();
      setError(userMessage(e).description);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ padding: theme.layout.gutter, paddingTop: theme.space.xxl, paddingBottom: insets.bottom + theme.space.xl, gap: theme.space.lg }}
      keyboardShouldPersistTaps="handled">
      <Text variant="display">Ta position</Text>
      {location && (
        <View style={[styles.row, { gap: theme.space.sm }]}>
          <Icon name={location.source === 'device' ? 'location' : 'pin'} size={16} color={theme.colors.accent} />
          <Text variant="body" tone="muted">
            Actuellement : <Text variant="bodyStrong">{location.label}</Text>
          </Text>
        </View>
      )}

      <Button label="Utiliser ma position actuelle" icon="location" variant="secondary" loading={busy === 'device'} onPress={onDevice} testID="location-device" />

      <View style={[styles.row, { gap: theme.space.md }]}>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        <Text variant="caption" tone="subtle">
          OU
        </Text>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

      <View style={[styles.inputRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.pill, gap: theme.space.sm }]}>
        <Icon name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ville ou code postal (ex. Longwy, 54400)"
          placeholderTextColor={theme.colors.textSubtle}
          returnKeyType="search"
          onSubmitEditing={onManual}
          autoCorrect={false}
          accessibilityLabel="Ville ou code postal"
          testID="location-input"
          style={[styles.input, theme.text.body, inputReset, { color: theme.colors.text }]}
        />
      </View>
      <Button label="Valider" variant="primary" disabled={query.trim().length < 2} loading={busy === 'manual'} onPress={onManual} testID="location-submit" />

      {error && (
        <View style={[styles.row, { gap: theme.space.sm, backgroundColor: theme.colors.dangerSoft, padding: theme.space.md, borderRadius: theme.radius.md }]} accessibilityRole="alert">
          <Icon name="warning" size={16} color={theme.colors.danger} />
          <Text variant="callout" tone="danger" style={styles.flex}>
            {error}
          </Text>
        </View>
      )}

      <View style={{ gap: theme.space.sm, marginTop: theme.space.sm }}>
        <Text variant="headline">Rayon de recherche</Text>
        <View style={[styles.row, { gap: theme.space.sm, flexWrap: 'wrap' }]}>
          {RADIUS_OPTIONS_KM.map((r) => (
            <Chip key={r} label={`${r} km`} selected={radiusKm === r} onPress={() => setRadius(r)} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 18, minHeight: 54 },
  input: { flex: 1, paddingVertical: 12 },
});
