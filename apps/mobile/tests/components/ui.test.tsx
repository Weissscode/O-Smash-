import { fireEvent, screen } from '@testing-library/react-native';

import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ErrorState } from '@/components/ui/state-view';
import { ModifierGroupSection } from '@/features/product/components/modifier-group-section';
import { AppError } from '@/lib/errors';
import type { ModifierGroup } from '@/types/domain';

import { renderWithTheme } from './render';

describe('Button', () => {
  it('déclenche onPress et expose son libellé aux lecteurs d’écran', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Ajouter" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('désactivé : ignore les appuis et l’annonce', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Continuer" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Continuer' });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('en chargement : pas de double déclenchement (anti double-clic)', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Commander" onPress={onPress} loading />);
    await fireEvent.press(screen.getByRole('button', { name: 'Commander' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('QuantityStepper', () => {
  it('incrémente, et propose la suppression au minimum si autorisé', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<QuantityStepper value={1} onChange={onChange} allowRemove />);
    await fireEvent.press(screen.getByLabelText('Augmenter la quantité'));
    expect(onChange).toHaveBeenLastCalledWith(2);
    await fireEvent.press(screen.getByLabelText('Supprimer'));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });
});

describe('ModifierGroupSection', () => {
  const group: ModifierGroup = {
    id: 'g',
    name: 'Boisson',
    kind: 'combo_item',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'coca', name: 'Coca', priceDelta: 0, isAvailable: true },
      { id: 'eau', name: 'Eau', priceDelta: 50, isAvailable: true },
      { id: 'sprite', name: 'Sprite', priceDelta: 0, isAvailable: false },
    ],
  };

  it('affiche la règle, le supplément et l’option épuisée', async () => {
    await renderWithTheme(<ModifierGroupSection group={group} selected={[]} onToggle={jest.fn()} />);
    expect(screen.getAllByText('Obligatoire').length).toBeGreaterThan(0);
    expect(screen.getByText('+0,50 €')).toBeTruthy();
    expect(screen.getByText('Épuisé')).toBeTruthy();
  });

  it('transmet la sélection et ignore les options épuisées', async () => {
    const onToggle = jest.fn();
    await renderWithTheme(<ModifierGroupSection group={group} selected={[]} onToggle={onToggle} />);
    await fireEvent.press(screen.getByTestId('option-eau'));
    await fireEvent.press(screen.getByTestId('option-sprite'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('eau');
  });

  it('affiche le message d’erreur quand le choix manque', async () => {
    await renderWithTheme(<ModifierGroupSection group={group} selected={[]} onToggle={jest.fn()} error="Choix obligatoire" shakeKey={1} />);
    expect(screen.getByText('Choix obligatoire')).toBeTruthy();
  });
});

describe('ErrorState', () => {
  it('message réseau clair + bouton Réessayer', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(<ErrorState error={new AppError('network', 'x')} onRetry={onRetry} />);
    expect(screen.getByText('Pas de connexion')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
