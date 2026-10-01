import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checker } from '@/components/ui/checker';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { ModifierGroupSection } from '@/features/product/components/modifier-group-section';
import { computeUnitPrice, initialSelections, summarizeSelections, toggleOption, validateSelections } from '@/features/product/selection';
import { useProduct } from '@/hooks/use-catalog';
import { confirmDialog } from '@/lib/dialog';
import { haptics } from '@/lib/haptics';
import { formatPrice } from '@/lib/money';
import { MAX_LINE_QUANTITY, useCartStore } from '@/store/cart-store';
import { useTheme } from '@/theme/theme';
import type { Product, Restaurant, Selections } from '@/types/domain';

const NOTE_MAX = 140;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProduct(id);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (query.isError) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: insets.top }]}>
        <CloseButton onPress={() => router.back()} />
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </View>
    );
  }
  if (!query.data) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.bg, padding: theme.layout.gutter, gap: theme.space.lg }]}>
        <Skeleton height={260} radius={theme.radius.xl} />
        <Skeleton width="70%" height={28} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="40%" height={16} />
      </View>
    );
  }
  return <ProductEditor product={query.data.product} restaurant={query.data.restaurant} />;
}

function ProductEditor({ product, restaurant }: { product: Product; restaurant: Restaurant }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);
  const scrollRef = useRef<ScrollView>(null);
  const groupY = useRef<Record<string, number>>({});
  const contentTop = useRef(0);
  const [selections, setSelections] = useState<Selections>(() => initialSelections(product));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [attempted, setAttempted] = useState(0);

  const errors = useMemo(() => validateSelections(product, selections), [product, selections]);
  const unitPrice = computeUnitPrice(product, selections);
  const total = unitPrice * quantity;
  const errorFor = (groupId: string) => (attempted > 0 ? errors.find((e) => e.groupId === groupId)?.message : undefined);

  const commit = (replaceCart = false) => {
    const result = addLine(
      { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        unitPrice,
        quantity,
        selections,
        summary: summarizeSelections(product, selections),
        note: note.trim() || null,
      },
      { replaceCart },
    );
    if (result.status === 'conflict') {
      haptics.warning();
      confirmDialog({
        title: 'Nouveau panier ?',
        message: `Ton panier contient des articles de ${result.currentRestaurantName}. Un panier ne peut contenir qu'un seul restaurant.`,
        cancelLabel: 'Garder mon panier',
        confirmLabel: 'Vider et ajouter',
        destructive: true,
        onConfirm: () => commit(true),
      });
      return;
    }
    haptics.success();
    router.back();
  };

  const onAdd = () => {
    if (errors.length > 0) {
      setAttempted((n) => n + 1);
      haptics.warning();
      const y = groupY.current[errors[0].groupId];
      if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, contentTop.current + y - 24), animated: true });
      return;
    }
    commit();
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 140 + insets.bottom }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: theme.colors.surfaceMuted }]}>
          {product.image != null ? (
            <Image source={product.image} style={styles.heroImage} contentFit="contain" transition={200} accessibilityLabel={product.name} />
          ) : (
            <Icon name="bag" size={56} color={theme.colors.textSubtle} />
          )}
          <View style={styles.heroChecker}>
            <Checker cell={8} height={16} opacity={0.85} />
          </View>
        </View>

        <View onLayout={(e) => (contentTop.current = e.nativeEvent.layout.y)} style={{ paddingHorizontal: theme.layout.gutter, paddingTop: theme.space.xl, gap: theme.space.sm }}>
          <View style={[styles.row, { gap: theme.space.xs, flexWrap: 'wrap' }]}>
            {product.isCombo && <Badge label="Formule" tone="secondary" />}
            {product.labels.includes('signature') && <Badge label="Signature" />}
            {product.labels.includes('vegetarian') && <Badge label="Végétarien" tone="success" icon="leaf" />}
            {product.labels.includes('spicy') && <Badge label="Épicé" tone="danger" icon="flame" />}
          </View>
          <Text variant="display">{product.name}</Text>
          {product.description ? (
            <Text variant="body" tone="muted">
              {product.description}
            </Text>
          ) : null}
          <Text variant="price" style={{ fontSize: 20, lineHeight: 24 }}>
            {formatPrice(product.basePrice)}
          </Text>
          <View style={[styles.allergens, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.space.md, gap: theme.space.sm }]}>
            <Icon name="help" size={16} color={theme.colors.textMuted} />
            <Text variant="caption" tone="muted" style={styles.flex}>
              {product.allergensKnown
                ? product.allergens.length
                  ? `Allergènes : ${product.allergens.join(', ')}`
                  : 'Aucun allergène majeur déclaré'
                : 'Allergènes non renseignés pour ce produit. Demande au restaurant en cas de doute.'}
            </Text>
          </View>

          {product.modifierGroups.map((group) => (
            <View key={group.id} onLayout={(e: LayoutChangeEvent) => (groupY.current[group.id] = e.nativeEvent.layout.y)}>
              <ModifierGroupSection
                group={group}
                selected={selections[group.id] ?? []}
                onToggle={(optionId) => setSelections((s) => toggleOption(s, group, optionId))}
                error={errorFor(group.id)}
                shakeKey={attempted}
              />
            </View>
          ))}

          {product.allowsNote && (
            <View style={{ paddingTop: theme.space.xxl, gap: theme.space.sm }}>
              <Text variant="headline">Une précision ?</Text>
              <TextInput
                value={note}
                onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
                placeholder="Ex. bien cuit, sauce à part…"
                placeholderTextColor={theme.colors.textSubtle}
                multiline
                maxLength={NOTE_MAX}
                accessibilityLabel="Note pour le restaurant"
                style={[styles.note, theme.text.body, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.space.md }]}
              />
              <Text variant="caption" tone="subtle" align="right">
                {note.length}/{NOTE_MAX}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.close, { top: theme.space.lg }]}>
        <CloseButton onPress={() => router.back()} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md, paddingHorizontal: theme.layout.gutter, backgroundColor: theme.colors.bg, borderTopColor: theme.colors.border, gap: theme.space.md }]}>
        <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_LINE_QUANTITY} />
        <Button
          label={errors.length && attempted ? 'Choix requis' : 'Ajouter'}
          variant={errors.length ? 'secondary' : 'primary'}
          onPress={onAdd}
          style={styles.flex}
          testID="add-to-cart"
          accessibilityHint={errors.length ? 'Certains choix obligatoires ne sont pas remplis' : undefined}
          trailing={
            <Text variant="price" color={errors.length ? theme.colors.text : theme.colors.onPrimary}>
              {formatPrice(total)}
            </Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale onPress={onPress} haptic="selection" accessibilityLabel="Fermer" hitSlop={8} style={[styles.closeBtn, { backgroundColor: theme.colors.surface, ...theme.shadow.card }]}>
      <Icon name="close" size={16} color={theme.colors.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  hero: { height: 280, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '86%', height: 240 },
  heroChecker: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  allergens: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  note: { minHeight: 80, borderWidth: StyleSheet.hairlineWidth, textAlignVertical: 'top' },
  close: { position: 'absolute', right: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
