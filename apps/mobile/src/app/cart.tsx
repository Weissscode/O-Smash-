import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { StateView } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { toRestaurantView } from '@/features/discovery/restaurant-view';
import { useRestaurantMenu } from '@/hooks/use-catalog';
import { useNow } from '@/hooks/use-now';
import { confirmDialog } from '@/lib/dialog';
import { estimatePrepTime, formatEtaRange } from '@/lib/eta';
import { formatPrice } from '@/lib/money';
import { buildPickupSlots } from '@/lib/pickup-slots';
import { selectItemCount, selectSubtotal, useCartStore } from '@/store/cart-store';
import { useTheme } from '@/theme/theme';
import type { FulfillmentMode } from '@/types/domain';

const MODES: Record<FulfillmentMode, { label: string; icon: IconName }> = {
  dine_in: { label: 'Sur place', icon: 'dineIn' },
  takeaway: { label: 'À emporter', icon: 'takeaway' },
};

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const cart = useCartStore();
  const count = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const menu = useRestaurantMenu(cart.restaurantSlug ?? undefined);
  const [timing, setTiming] = useState<'asap' | 'scheduled'>('asap');
  const [slot, setSlot] = useState<string | null>(null);

  const restaurant = menu.data?.restaurant;
  const view = restaurant ? toRestaurantView(restaurant, null, now) : null;
  const complexity = useMemo(() => {
    if (!menu.data) return 0;
    return cart.lines.reduce((sum, l) => sum + (menu.data.products.find((p) => p.id === l.productId)?.extraPrepMinutes ?? 0) * l.quantity, 0);
  }, [cart.lines, menu.data]);
  const eta = restaurant ? estimatePrepTime({ settings: restaurant.settings.eta, activeOrders: restaurant.activeOrders, itemCount: count, complexityMinutes: complexity }) : null;
  const slots = useMemo(
    () =>
      restaurant?.settings.scheduledOrders.enabled && eta
        ? buildPickupSlots(restaurant.openingHours, restaurant.timezone, now, {
            slotMinutes: restaurant.settings.scheduledOrders.slotMinutes,
            maxDaysAhead: restaurant.settings.scheduledOrders.maxDaysAhead,
            leadMinutes: eta.minutes,
            limit: 10,
          })
        : [],
    [restaurant, eta, now],
  );
  const modes = restaurant?.settings.fulfillmentModes ?? [];
  const fulfillment = cart.fulfillment && modes.includes(cart.fulfillment) ? cart.fulfillment : modes.length === 1 ? modes[0] : null;
  const effectiveTiming = view?.canOrderNow ? timing : 'scheduled';
  const ready = !!fulfillment && (effectiveTiming === 'asap' || !!slot);

  if (count === 0) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: theme.space.xl }]}>
        <Header onClose={() => router.back()} />
        <StateView icon="bag" title="Panier vide" description="Ajoute des produits depuis la fiche d'un restaurant." actionLabel="Découvrir" onAction={() => router.dismissTo('/')} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingTop: theme.space.xl, paddingBottom: 180 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <Header onClose={() => router.back()} subtitle={cart.restaurantName ?? undefined} />

        <View style={{ paddingHorizontal: theme.layout.gutter, marginTop: theme.space.lg }}>
          {cart.lines.map((line) => (
            <Animated.View key={line.lineId} layout={LinearTransition} exiting={FadeOut.duration(150)} style={[styles.line, { borderBottomColor: theme.colors.border, paddingVertical: theme.space.lg, gap: theme.space.md }]}>
              <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md }]}>
                {line.image != null && <Image source={line.image} style={styles.thumbImg} contentFit="contain" />}
              </View>
              <View style={[styles.flex, { gap: 2 }]}>
                <Text variant="headline">{line.name}</Text>
                {line.summary.map((s) => (
                  <Text key={s} variant="caption" tone="muted">
                    {s}
                  </Text>
                ))}
                {line.note ? (
                  <Text variant="caption" tone="muted" style={{ fontStyle: 'italic' }}>
                    « {line.note} »
                  </Text>
                ) : null}
                <View style={[styles.lineFooter, { marginTop: theme.space.sm }]}>
                  <QuantityStepper value={line.quantity} size="sm" allowRemove onChange={(q) => cart.updateQuantity(line.lineId, q)} />
                  <Text variant="price">{formatPrice(line.unitPrice * line.quantity)}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
          <PressableScale haptic="selection" onPress={() => cart.restaurantSlug && router.push({ pathname: '/restaurant/[slug]', params: { slug: cart.restaurantSlug } })} style={[styles.row, { paddingVertical: theme.space.lg, gap: theme.space.sm }]}>
            <Icon name="plus" size={16} color={theme.colors.accent} />
            <Text variant="bodyStrong" tone="accent">
              Ajouter des articles
            </Text>
          </PressableScale>
        </View>

        <Section title="Comment ?">
          <View style={[styles.row, { gap: theme.space.sm }]}>
            {modes.map((m) => (
              <OptionCard key={m} icon={MODES[m].icon} label={MODES[m].label} selected={fulfillment === m} onPress={() => cart.setFulfillment(m)} testID={`mode-${m}`} />
            ))}
          </View>
        </Section>

        <Section title="Quand ?">
          <View style={[styles.row, { gap: theme.space.sm }]}>
            <OptionCard
              icon="clock"
              label="Dès que possible"
              caption={view?.canOrderNow && eta ? formatEtaRange(eta.range) : 'Fermé maintenant'}
              selected={effectiveTiming === 'asap'}
              disabled={!view?.canOrderNow}
              onPress={() => setTiming('asap')}
            />
            <OptionCard
              icon="history"
              label="Programmer"
              caption={restaurant?.settings.scheduledOrders.enabled ? (slot ?? 'Choisir un créneau') : 'Non proposé'}
              selected={effectiveTiming === 'scheduled'}
              disabled={!restaurant?.settings.scheduledOrders.enabled}
              onPress={() => setTiming('scheduled')}
            />
          </View>
          {effectiveTiming === 'scheduled' && slots.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.space.sm, paddingTop: theme.space.md }}>
              {slots.map((s) => (
                <PressableScale
                  key={s.label}
                  haptic="selection"
                  onPress={() => setSlot(s.label)}
                  accessibilityState={{ selected: slot === s.label }}
                  style={[styles.slot, { borderRadius: theme.radius.md, backgroundColor: slot === s.label ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text variant="callout" color={slot === s.label ? theme.colors.onPrimary : theme.colors.text}>
                    {s.label}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
          )}
        </Section>

        <Section title="Récapitulatif">
          <Row label="Sous-total" value={formatPrice(subtotal)} />
          <Row label="Total" value={formatPrice(subtotal)} strong />
          <Text variant="caption" tone="subtle" style={{ marginTop: theme.space.sm }}>
            Les prix sont revérifiés par le restaurant au moment de commander.
          </Text>
          <Button
            label="Vider le panier"
            variant="ghost"
            size="md"
            icon="trash"
            style={{ alignSelf: 'flex-start', marginTop: theme.space.md, paddingHorizontal: 0 }}
            onPress={() => confirmDialog({ title: 'Vider le panier ?', message: 'Tous les articles seront retirés.', confirmLabel: 'Vider', destructive: true, onConfirm: cart.clear })}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md, paddingHorizontal: theme.layout.gutter, backgroundColor: theme.colors.bg, borderTopColor: theme.colors.border }]}>
        {!fulfillment && (
          <Text variant="caption" tone="muted" align="center" style={{ marginBottom: theme.space.sm }}>
            Choisis sur place ou à emporter pour continuer
          </Text>
        )}
        <Button
          label="Continuer"
          disabled={!ready}
          onPress={() => router.push('/auth')}
          testID="checkout"
          trailing={
            <Text variant="price" tone="onPrimary">
              {formatPrice(subtotal)}
            </Text>
          }
        />
      </View>
    </View>
  );
}

function Header({ onClose, subtitle }: { onClose: () => void; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { paddingHorizontal: theme.layout.gutter, justifyContent: 'space-between' }]}>
      <View style={styles.flex}>
        <Text variant="display">Ton panier</Text>
        {subtitle && (
          <Text variant="callout" tone="muted">
            {subtitle}
          </Text>
        )}
      </View>
      <PressableScale onPress={onClose} haptic="selection" accessibilityLabel="Fermer" hitSlop={8} style={[styles.close, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Icon name="close" size={16} />
      </PressableScale>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: theme.layout.gutter, marginTop: theme.space.xxl, gap: theme.space.md }}>
      <Text variant="title">{title}</Text>
      {children}
    </View>
  );
}

function OptionCard({ icon, label, caption, selected, disabled, onPress, testID }: { icon: IconName; label: string; caption?: string; selected: boolean; disabled?: boolean; onPress: () => void; testID?: string }) {
  const theme = useTheme();
  return (
    <PressableScale
      haptic="selection"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      style={[
        styles.optionCard,
        {
          borderRadius: theme.radius.lg,
          padding: theme.space.lg,
          gap: theme.space.xs,
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      <Icon name={icon} size={20} color={selected ? theme.colors.accent : theme.colors.text} />
      <Text variant="headline" color={selected ? theme.colors.onPrimary : theme.colors.text}>
        {label}
      </Text>
      {caption ? (
        <Text variant="caption" color={selected ? theme.colors.onPrimary : theme.colors.textMuted} style={selected && { opacity: 0.8 }}>
          {caption}
        </Text>
      ) : null}
    </PressableScale>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <Text variant={strong ? 'headline' : 'body'} tone={strong ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={strong ? 'price' : 'body'}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  line: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  lineFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  thumb: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  thumbImg: { width: 58, height: 58 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  optionCard: { flex: 1, borderWidth: StyleSheet.hairlineWidth, minHeight: 104 },
  slot: { paddingHorizontal: 14, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
