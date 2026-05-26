export const STORE = {
  name: 'Adega 4 Amigos',
  address: 'Rua Rene Regaconi, 206 - Jd. Residencial Villa Amato',
  city: 'Sorocaba',
  state: 'SP',
  cep: '18087-632',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '(15) 99999-9999',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5515999999999',
  coords: { lat: -23.4735, lng: -47.4205 },
  minOrder: 30.00,
  freeDeliveryAbove: 150.00,
  hours: {
    weekdays: { open: '10:00', close: '23:00' },
    saturday: { open: '10:00', close: '00:00' },
    sunday: { open: '12:00', close: '22:00' },
  },
  deliveryFees: [
    { maxKm: 2, fee: 5.00 },
    { maxKm: 5, fee: 8.00 },
    { maxKm: 8, fee: 12.00 },
    { maxKm: 12, fee: 16.00 },
    { maxKm: 15, fee: 20.00 },
  ],
} as const;
