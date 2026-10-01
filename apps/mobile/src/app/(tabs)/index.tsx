import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ErrorState, StateView } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { CartBar } from '@/features/cart/components/cart-bar';
import { CategoryRail } from '@/features/discovery/components/category-rail';
import { HomeHeader } from '@/features/discovery/components/home-header';
import { RestaurantCard, RestaurantCardSkeleton } from '@/features/discovery/components/restaurant-card';
import { buildRestaurantList, SORT_LABELS, type SortKey } from '@/features/discovery/restaurant-view';
import { useDiscoveryCategories, useRestaurants } from '@/hooks/use-catalog';
import { useNow } from '@/hooks/use-now';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { RADIUS_OPTIONS_KM, useLocationStore } from '@/store/location-store';
import { useTheme } from '@/theme/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const now = useNow();
  const bottomInset = useTabBarInset();
  const categories = useDiscoveryCategories();
  const restaurants = useRestaurants();
  const location = useLocationStore((s) => s.location);
  const radiusKm = useLocationStore((s) => s.radiusKm);
  const setRadius = useLocationStore((s) => s.setRadius);
  const [sort, setSort] = useState<SortKey>('distance');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showRadius, setShowRadius] = useState(false);

  const origin = location?.coords ?? null;
  const list = useMemo(
    () => buildRestaurantList(restaurants.data ?? [], { origin, radiusKm, sort, categoryId, now }),
    [restaurants.data, origin, radiusKm, sort, categoryId, now],
  );
  const popular = useMemo(
    () => buildRestaurantList(restaurants.data ?? [], { origin, radiusKm: 50, sort: 'popularity', categoryId: null, now }).slice(0, 5),
    [restaurants.data, origin, now],
  );
  const openRestaurant = (slug: string) => router.push({ pathname: '/restaurant/[slug]', params: { slug } });
  const categoryLabel = categories.data?.find((c) => c.id === categoryId)?.label;

  const header = (
    <View>
      <HomeHeader now={now} />
      <CategoryRail categories={categories.data} selectedId={categoryId} onSelect={setCategoryId} />

      {!location && (
        <Animated.View entering={FadeIn} style={[styles.locationCard, { marginHorizontal: theme.layout.gutter, marginTop: theme.space.xl, backgroundColor: theme.colors.secondarySoft, borderRadius: theme.radius.xl, padding: theme.space.lg, gap: theme.space.sm }]}>
          <Text variant="headline">Où es-tu ?</Text>
          <Text variant="callout" tone="muted">
            Indique ta position pour voir les distances et les restaurants les plus proches.
          </Text>
          <Button label="Choisir ma position" icon="location" size="md" variant="primary" onPress={() => router.push('/location')} style={{ alignSelf: 'flex-start' }} />
        </Animated.View>
      )}

      {!categoryId && popular.length > 0 && (
        <View style={{ marginTop: theme.space.xxl }}>
          <SectionTitle title="Les plus populaires" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.lg }}>
            {popular.map((v) => (
              <RestaurantCard key={v.restaurant.id} view={v} now={now} variant="compact" onPress={() => openRestaurant(v.restaurant.slug)} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ marginTop: theme.space.xxl }}>
        <SectionTitle title={categoryLabel ? categoryLabel : location ? 'Autour de toi' : 'Tous les restaurants'} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.sm }}>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <Chip key={key} label={SORT_LABELS[key]} selected={sort === key} onPress={() => setSort(key)} testID={`sort-${key}`} />
          ))}
          {location && (
            <Chip label={`Rayon ${radiusKm} km`} icon="sliders" trailingIcon="chevronDown" selected={showRadius} onPress={() => setShowRadius((v) => !v)} testID="radius-toggle" />
          )}
        </ScrollView>
        {showRadius && location && (
          <Animated.View entering={FadeInDown.duration(180)} style={[styles.radiusRow, { paddingHorizontal: theme.layout.gutter, marginTop: theme.space.sm, gap: theme.space.sm }]}>
            {RADIUS_OPTIONS_KM.map((r) => (
              <Chip key={r} label={`${r} km`} selected={radiusKm === r} onPress={() => setRadius(r)} testID={`radius-${r}`} />
            ))}
          </Animated.View>
        )}
      </View>
      <View style={{ height: theme.space.lg }} />
    </View>
  );

  const renderEmpty = () => {
    if (restaurants.isPending) {
      return (
        <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.xxl }}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      );
    }
    if (restaurants.isError) return <ErrorState error={restaurants.error} onRetry={() => restaurants.refetch()} />;
    if (categoryId) {
      return <StateView icon="search" title="Rien par ici" description={`Aucun restaurant « ${categoryLabel} » dans ton rayon.`} actionLabel="Voir toutes les catégories" onAction={() => setCategoryId(null)} />;
    }
    return (
      <StateView
        icon="pin"
        title="Aucun restaurant proche"
        description={`Aucun restaurant Vice Go à moins de ${radiusKm} km pour l'instant.`}
        actionLabel={radiusKm < 20 ? 'Élargir à 20 km' : 'Changer de position'}
        onAction={() => (radiusKm < 20 ? setRadius(20) : router.push('/location'))}
      />
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <FlatList
        data={restaurants.isPending ? [] : list}
        keyExtractor={(v) => v.restaurant.id}
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 40).duration(260)} style={{ paddingHorizontal: theme.layout.gutter }}>
            <RestaurantCard view={item} now={now} onPress={() => openRestaurant(item.restaurant.slug)} />
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: theme.space.xxl }} />}
        contentContainerStyle={{ paddingBottom: bottomInset + 96 }}
        refreshControl={<RefreshControl refreshing={restaurants.isRefetching} onRefresh={() => restaurants.refetch()} tintColor={theme.colors.accent} />}
        showsVerticalScrollIndicator={false}
        testID="home-list"
      />
      <CartBar bottomOffset={bottomInset} />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Text variant="title" style={{ paddingHorizontal: theme.layout.gutter, marginBottom: theme.space.md }}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  locationCard: {},
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
