import React from 'react';
import { T } from '../data/theme.js';
import { PRIORITY_PHONE_COUNTRIES, ALL_PHONE_COUNTRIES, DEFAULT_PHONE_COUNTRY } from '../utils/phoneCountries.js';

function findCountry(code) {
  return PRIORITY_PHONE_COUNTRIES.find(c => c.code === code)
    || ALL_PHONE_COUNTRIES.find(c => c.code === code)
    || DEFAULT_PHONE_COUNTRY;
}

// Champ telephone avec selecteur de pays (drapeau + indicatif) devant.
// Renvoie { country, number } au parent via onChange, il combine en
// E.164 au moment de l'envoi (utils/phoneCountries.toE164).
export function PhoneInput({ value, onChange, inputStyle }) {
  const country = value.country || DEFAULT_PHONE_COUNTRY;
  const number = value.number || '';

  return /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 8 } },
    /*#__PURE__*/React.createElement('select', {
      value: country.code,
      onChange: e => onChange({ country: findCountry(e.target.value), number }),
      style: {
        ...inputStyle, width: 78, padding: '13px 4px', flexShrink: 0, cursor: 'pointer'
      }
    },
      PRIORITY_PHONE_COUNTRIES.map(c => /*#__PURE__*/React.createElement('option', { key: c.code, value: c.code }, `${c.flag} ${c.dial}`)),
      ALL_PHONE_COUNTRIES.map(c => /*#__PURE__*/React.createElement('option', { key: c.code, value: c.code }, `${c.flag} ${c.label} ${c.dial}`))
    ),
    /*#__PURE__*/React.createElement('input', {
      type: 'tel',
      placeholder: '6 12 34 56 78',
      value: number,
      onChange: e => onChange({ country, number: e.target.value }),
      style: { ...inputStyle, flex: 1 }
    })
  );
}
