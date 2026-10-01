import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, StateView } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { RestaurantCover } from '@/features/discovery/components/restaurant-cover';
import { useCatalogSearch, useDiscoveryCategories } from '@/hooks/use-catalog';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { formatPrice } from '@/lib/money';
import { useRecentSearchesStore } from '@/store/recent-searches-store';
import { useTheme } from '@/theme/theme';
import { inputReset } from '@/theme/typography';

function useDebounced<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useTabBarInset();
  const [text, setText] = useState('');
  const debounced = useDebounced(text);
  const search = useCatalogSearch(debounced);
  const categories = useDiscoveryCategories();
  const recent = useRecentSearchesStore();
  const active = debounced.trim().length >= 2;
  const results = search.data;
  const total = results ? results.restaurants.length + results.products.length + results.categories.length : 0;

  const remember = () => recent.push(text);
  const openRestaurant = (slug: string) => {
    remember();
    router.push({ pathname: '/restaurant/[slug]', params: { slug } });
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: insets.top + theme.space.md }]}>
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.md }}>
        <Text variant="display">Recherche</Text>
        <View style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.pill, gap: theme.space.sm }]}>
          <Icon name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Restaurant, plat, catégorie…"
            placeholderTextColor={theme.colors.textSubtle}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={remember}
            clearButtonMode="while-editing"
            accessibilityLabel="Rechercher"
            testID="search-input"
            style={[styles.textInput, theme.text.body, inputReset, { color: theme.colors.text }]}
          />
          {text.length > 0 && (
            <PressableScale haptic="selection" onPress={() => setText('')} accessibilityLabel="Effacer" hitSlop={10}>
              <Icon name="close" size={14} color={theme.colors.textMuted} />
            </PressableScale>
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ padding: theme.layout.gutter, paddingBottom: bottomInset + theme.space.xl, gap: theme.space.xl }}>
        {!active && (
          <Animated.View entering={FadeIn} style={{ gap: theme.space.xl }}>
            {recent.items.length > 0 && (
              <View style={{ gap: theme.space.sm }}>
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                  <Text variant="headline">Récemment</Text>
                  <PressableScale haptic="selection" onPress={recent.clear} hitSlop={10} accessibilityLabel="Effacer l'historique">
                    <Text variant="callout" tone="accent">
                      Effacer
                    </Text>
                  </PressableScale>
                </View>
                {recent.items.map((q) => (
                  <PressableScale key={q} haptic="selection" onPress={() => setText(q)} style={[styles.row, styles.recent, { gap: theme.space.md, borderBottomColor: theme.colors.border }]}>
                    <Icon name="history" size={16} color={theme.colors.textMuted} />
                    <Text variant="body" style={styles.flex}>
                      {q}
                    </Text>
                    <Icon name="chevronRight" size={12} color={theme.colors.textSubtle} />
                  </PressableScale>
                ))}
              </View>
            )}
            <View style={{ gap: theme.space.sm }}>
              <Text variant="headline">Envies du moment</Text>
              <View style={[styles.row, { flexWrap: 'wrap', gap: theme.space.sm }]}>
                {(categories.data ?? []).map((c) => (
                  <Chip key={c.id} label={c.label} icon={c.icon} onPress={() => setText(c.label)} />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {active && search.isPending && (
          <View style={{ gap: theme.space.lg }}>
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i} style={[styles.row, { gap: theme.space.md }]}>
                <Skeleton width={56} height={56} radius={theme.radius.md} />
                <View style={[styles.flex, { gap: 6 }]}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
            ))}
          </View>
        )}
        {active && search.isError && <ErrorState error={search.error} onRetry={() => search.refetch()} />}
        {active && results && total === 0 && <StateView icon="search" title="Aucun résultat" description={`Rien ne correspond à « ${debounced.trim()} ». Essaie un autre mot.`} />}

        {active && results && results.categories.length > 0 && (
          <View style={[styles.row, { flexWrap: 'wrap', gap: theme.space.sm }]}>
            {results.categories.map((c) => (
              <Chip key={c.id} label={c.label} icon={c.icon} selected />
            ))}
          </View>
        )}

        {active && results && results.restaurants.length > 0 && (
          <View style={{ gap: theme.space.md }}>
            <Text variant="title">Restaurants</Text>
            {results.restaurants.map((r) => (
              <PressableScale key={r.id} haptic="selection" onPress={() => openRestaurant(r.slug)} style={[styles.row, { gap: theme.space.md }]} accessibilityLabel={r.name}>
                <RestaurantCover restaurant={r} height={56} radius={theme.radius.md} style={{ width: 56 }} />
                <View style={styles.flex}>
                  <Text variant="headline">{r.name}</Text>
                  <Text variant="callout" tone="muted">
                    {r.cuisineLabel} · {r.address.city}
                  </Text>
                </View>
                <Icon name="chevronRight" size={12} color={theme.colors.textSubtle} />
              </PressableScale>
            ))}
          </View>
        )}

        {active && results && results.products.length > 0 && (
          <View style={{ gap: theme.space.md }}>
            <Text variant="title">Plats</Text>
            {results.products.map(({ product, restaurant }) => (
              <PressableScale
                key={product.id}
                haptic="selection"
                disabled={!product.isAvailable}
                onPress={() => {
                  remember();
                  router.push({ pathname: '/product/[id]', params: { id: product.id } });
                }}
                style={[styles.row, { gap: theme.space.md, opacity: product.isAvailable ? 1 : 0.5 }]}
                accessibilityLabel={`${product.name}, ${restaurant.name}`}>
                <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md }]}>
                  {product.image != null && <Image source={product.image} style={styles.thumbImg} contentFit="contain" />}
                </View>
                <View style={styles.flex}>
                  <Text variant="headline">{product.name}</Text>
                  <Text variant="callout" tone="muted">
                    {restaurant.name}
                  </Text>
                </View>
                <Text variant="price">{product.isAvailable ? formatPrice(product.basePrice) : 'Indispo.'}</Text>
              </PressableScale>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 18, minHeight: 54 },
  textInput: { flex: 1, paddingVertical: 12 },
  recent: { minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  thumbImg: { width: 50, height: 50 },
});
