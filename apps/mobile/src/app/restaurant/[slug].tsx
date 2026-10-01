import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Extrapolation, FadeIn, FadeOut, interpolate, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Badge } from '@/components/ui/badge';
import { Checker } from '@/components/ui/checker';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { CartBar } from '@/features/cart/components/cart-bar';
import { RestaurantCover } from '@/features/discovery/components/restaurant-cover';
import { RestaurantMeta } from '@/features/discovery/components/restaurant-meta';
import { toRestaurantView } from '@/features/discovery/restaurant-view';
import { ProductRow } from '@/features/restaurant/components/product-row';
import { useRestaurantMenu } from '@/hooks/use-catalog';
import { useNow } from '@/hooks/use-now';
import { haptics } from '@/lib/haptics';
import { describeOpenStatus } from '@/lib/opening-hours';
import { useLocationStore } from '@/store/location-store';
import { useTheme } from '@/theme/theme';
import type { FulfillmentMode, PaymentMethod } from '@/types/domain';

const COVER_HEIGHT = 260;

const FULFILLMENT: Record<FulfillmentMode, { label: string; icon: IconName }> = {
  dine_in: { label: 'Sur place', icon: 'dineIn' },
  takeaway: { label: 'À emporter', icon: 'takeaway' },
};
const PAYMENT: Record<PaymentMethod, string> = { counter: 'Comptoir', card: 'Carte', apple_pay: 'Apple Pay' };

export default function RestaurantScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const origin = useLocationStore((s) => s.location?.coords ?? null);
  const menu = useRestaurantMenu(slug);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const scrollY = useSharedValue(0);
  const tabsTop = useSharedValue(Number.MAX_SAFE_INTEGER);
  const headerHeight = insets.top + 52;

  const view = useMemo(() => (menu.data ? toRestaurantView(menu.data.restaurant, origin, now) : null), [menu.data, origin, now]);
  const sections = useMemo(() => {
    if (!menu.data) return [];
    return [...menu.data.categories]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ category: c, products: menu.data.products.filter((p) => p.categoryId === c.id) }))
      .filter((s) => s.products.length > 0);
  }, [menu.data]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      // Parallaxe : la couverture remonte deux fois moins vite que le contenu.
      { translateY: interpolate(scrollY.value, [0, COVER_HEIGHT], [0, -COVER_HEIGHT * 0.5], Extrapolation.CLAMP) },
      // Effet "élastique" quand on tire vers le bas.
      { scale: interpolate(scrollY.value, [-200, 0], [1.6, 1], Extrapolation.CLAMP) },
    ],
  }));
  // Les onglets se "collent" sous la barre supérieure une fois dépassés.
  useAnimatedReaction(
    () => scrollY.value >= tabsTop.value - headerHeight,
    (isPinned, prev) => {
      if (isPinned !== prev) scheduleOnRN(setPinned, isPinned);
    },
  );
  const topBarStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [COVER_HEIGHT - 140, COVER_HEIGHT - 60], [0, 1], Extrapolation.CLAMP) }));

  const onSectionLayout = (id: string) => (e: LayoutChangeEvent) => {
    sectionY.current[id] = e.nativeEvent.layout.y;
  };
  const jumpTo = (id: string) => {
    haptics.selection();
    setActiveCategory(id);
    const y = sectionY.current[id];
    if (y != null) scrollRef.current?.scrollTo({ y: y - headerHeight - 56, animated: true });
  };
  const onScrollEnd = (y: number) => {
    const entries = Object.entries(sectionY.current).sort((a, b) => a[1] - b[1]);
    let current = entries[0]?.[0] ?? null;
    for (const [id, top] of entries) if (y + headerHeight + 80 >= top) current = id;
    if (current && current !== activeCategory) setActiveCategory(current);
  };

  if (menu.isError) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: insets.top }]}>
        <BackButton onPress={() => router.back()} />
        <ErrorState error={menu.error} onRetry={() => menu.refetch()} />
      </View>
    );
  }

  const restaurant = menu.data?.restaurant;
  const canAdd = !!view && (view.canOrderNow || (view.status.state === 'closed' && !!restaurant?.settings.scheduledOrders.enabled));

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Animated.View style={[styles.cover, coverStyle]}>
        {restaurant ? <RestaurantCover restaurant={restaurant} height={COVER_HEIGHT} /> : <Skeleton height={COVER_HEIGHT} radius={0} />}
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => onScrollEnd(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => onScrollEnd(e.nativeEvent.contentOffset.y)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        testID="restaurant-scroll">
        <View style={{ height: COVER_HEIGHT - theme.radius.xxl }} />

        {/* Bloc d'informations */}
        <View style={[styles.sheet, { backgroundColor: theme.colors.bg, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, paddingHorizontal: theme.layout.gutter, paddingTop: theme.space.xxl }]}>
          {!restaurant || !view ? (
            <View style={{ gap: theme.space.md }}>
              <Skeleton width="70%" height={32} />
              <Skeleton width="50%" height={16} />
              <Skeleton width="90%" height={44} radius={theme.radius.lg} />
            </View>
          ) : (
            <View style={{ gap: theme.space.md }}>
              {restaurant.logo != null && (
                <View style={[styles.logo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.bg, ...theme.shadow.card }]}>
                  <Image source={restaurant.logo} style={styles.logoImg} contentFit="contain" />
                </View>
              )}
              <Text variant="display">{restaurant.name}</Text>
              <Text variant="body" tone="muted">
                {restaurant.tagline}
              </Text>
              <RestaurantMeta view={view} />
              <View style={[styles.row, { gap: theme.space.xs }]}>
                <View style={[styles.dot, { backgroundColor: view.canOrderNow ? theme.colors.success : theme.colors.danger }]} />
                <Text variant="callout" tone={view.canOrderNow ? 'success' : 'danger'}>
                  {describeOpenStatus(view.status, now, restaurant.timezone)}
                </Text>
              </View>

              <View style={[styles.infoGrid, { gap: theme.space.sm }]}>
                {restaurant.settings.fulfillmentModes.map((m) => (
                  <InfoPill key={m} icon={FULFILLMENT[m].icon} label={FULFILLMENT[m].label} />
                ))}
                <InfoPill icon="card" label={restaurant.settings.paymentMethods.map((p) => PAYMENT[p]).join(' · ')} />
              </View>

              {restaurant.loyaltyEnabled && (
                <View style={[styles.loyalty, { backgroundColor: theme.colors.secondarySoft, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.md }]}>
                  <Icon name="gift" size={22} color={theme.colors.secondary} />
                  <View style={styles.flex}>
                    <Text variant="headline">Programme fidélité</Text>
                    <Text variant="callout" tone="muted">
                      Connecté, tes commandes cumulent des points chez {restaurant.name}.
                    </Text>
                  </View>
                </View>
              )}

              {!view.canOrderNow && (
                <View style={[styles.loyalty, { backgroundColor: theme.colors.warningSoft, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.md }]}>
                  <Icon name={view.status.state === 'paused' ? 'pause' : 'clock'} size={22} color={theme.colors.warning} />
                  <Text variant="callout" style={styles.flex}>
                    {view.status.state === 'paused'
                      ? 'Le restaurant a mis les commandes en pause. Tu peux consulter le menu.'
                      : restaurant.settings.scheduledOrders.enabled
                        ? 'Fermé pour le moment. Tu pourras programmer ton retrait pour la réouverture.'
                        : 'Fermé pour le moment. Tu peux consulter le menu.'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Onglets de catégories */}
        <View onLayout={(e) => tabsTop.set(e.nativeEvent.layout.y)}>
          <CategoryTabs sections={sections.map((x) => x.category)} activeId={activeCategory} onSelect={jumpTo} />
        </View>

        {/* Menu */}
        <View style={{ paddingHorizontal: theme.layout.gutter, backgroundColor: theme.colors.bg, minHeight: 600 }}>
          {menu.isPending
            ? Array.from({ length: 4 }, (_, i) => (
                <View key={i} style={[styles.row, { paddingVertical: theme.space.lg, gap: theme.space.lg }]}>
                  <View style={[styles.flex, { gap: theme.space.sm }]}>
                    <Skeleton width="60%" height={18} />
                    <Skeleton width="90%" height={14} />
                    <Skeleton width="25%" height={16} />
                  </View>
                  <Skeleton width={112} height={112} radius={theme.radius.lg} />
                </View>
              ))
            : sections.map(({ category, products }) => (
                <View key={category.id} onLayout={onSectionLayout(category.id)} style={{ paddingTop: theme.space.xxl }}>
                  <Text variant="title">{category.name}</Text>
                  {products.map((p, i) => (
                    <View key={p.id} style={i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }}>
                      <ProductRow product={p} disabled={!canAdd} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} />
                    </View>
                  ))}
                </View>
              ))}
          <View style={{ marginTop: theme.space.xxxl, borderRadius: theme.radius.sm, overflow: 'hidden', opacity: 0.6 }}>
            <Checker cell={6} height={12} />
          </View>
          {restaurant && (
            <Text variant="caption" tone="subtle" style={{ marginTop: theme.space.md }}>
              {restaurant.address.line1}, {restaurant.address.postalCode} {restaurant.address.city}
            </Text>
          )}
        </View>
      </Animated.ScrollView>

      {/* Barre supérieure qui apparaît au défilement */}
      <Animated.View pointerEvents="none" style={[styles.topBar, { paddingTop: insets.top, height: insets.top + 52, backgroundColor: theme.colors.bg, borderBottomColor: theme.colors.border }, topBarStyle]}>
        <Text variant="headline" numberOfLines={1} style={styles.topBarTitle}>
          {restaurant?.name ?? ''}
        </Text>
      </Animated.View>
      {pinned && (
        <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)} style={[styles.pinnedTabs, { top: headerHeight }]}>
          <CategoryTabs sections={sections.map((x) => x.category)} activeId={activeCategory} onSelect={jumpTo} />
        </Animated.View>
      )}
      <View style={[styles.backWrap, { top: insets.top + 4 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      {restaurant?.isDemo && (
        <View style={[styles.demo, { top: insets.top + 10 }]} pointerEvents="none">
          <Badge label="Données de démo" tone="inverse" />
        </View>
      )}

      <CartBar restaurantId={restaurant?.id} bottomOffset={insets.bottom} />
    </View>
  );
}

function CategoryTabs({ sections, activeId, onSelect }: { sections: { id: string; name: string }[]; activeId: string | null; onSelect: (id: string) => void }) {
  const theme = useTheme();
  const current = activeId ?? sections[0]?.id;
  return (
    <View style={{ backgroundColor: theme.colors.bg, paddingVertical: theme.space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.sm }} accessibilityRole="tablist">
        {sections.map((category) => {
          const active = current === category.id;
          return (
            <PressableScale
              key={category.id}
              haptic={false}
              onPress={() => onSelect(category.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, { borderRadius: theme.radius.pill, backgroundColor: active ? theme.colors.primary : 'transparent' }]}>
              <Text variant="callout" color={active ? theme.colors.onPrimary : theme.colors.textMuted} style={{ fontFamily: theme.fonts.semibold }}>
                {category.name}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

function InfoPill({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { gap: theme.space.xs, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: theme.radius.pill, paddingHorizontal: theme.space.md, paddingVertical: 8 }]}>
      <Icon name={icon} size={14} color={theme.colors.text} />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityLabel="Retour"
      hitSlop={8}
      style={[styles.back, { backgroundColor: theme.colors.surface, ...theme.shadow.card }]}>
      <Icon name="chevronLeft" size={18} color={theme.colors.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cover: { position: 'absolute', top: 0, left: 0, right: 0 },
  sheet: { paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  loyalty: { flexDirection: 'row', alignItems: 'center' },
  tab: { paddingHorizontal: 14, minHeight: 38, justifyContent: 'center' },
  logo: { position: 'absolute', right: 0, top: -58, width: 68, height: 68, borderRadius: 34, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 56, height: 56, borderRadius: 28 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  topBarTitle: { paddingHorizontal: 72 },
  backWrap: { position: 'absolute', left: 16 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  demo: { position: 'absolute', right: 16 },
  pinnedTabs: { position: 'absolute', left: 0, right: 0 },
});
