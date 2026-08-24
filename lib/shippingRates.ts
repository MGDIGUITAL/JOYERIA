export interface Region {
  id: string;
  name: string;
  shippingCost: number;
}

export const REGIONS: Region[] = [
  { id: 'XV', name: 'Arica y Parinacota', shippingCost: 6800 },
  { id: 'I', name: 'Tarapacá', shippingCost: 6800 },
  { id: 'II', name: 'Antofagasta', shippingCost: 6800 },
  { id: 'III', name: 'Atacama', shippingCost: 5800 },
  { id: 'IV', name: 'Coquimbo', shippingCost: 5800 },
  { id: 'V', name: 'Valparaíso', shippingCost: 7000 },
  { id: 'XIII', name: 'Metropolitana de Santiago', shippingCost: 3100 },
  { id: 'VI', name: 'Libertador Gral. Bernardo O’Higgins', shippingCost: 7000 },
  { id: 'VII', name: 'Maule', shippingCost: 7000 },
  { id: 'XVI', name: 'Ñuble', shippingCost: 7000 },
  { id: 'VIII', name: 'Biobío', shippingCost: 7000 },
  { id: 'IX', name: 'La Araucanía', shippingCost: 7200 },
  { id: 'XIV', name: 'Los Ríos', shippingCost: 7200 },
  { id: 'X', name: 'Los Lagos', shippingCost: 7200 },
  { id: 'XI', name: 'Aysén del Gral. Carlos Ibáñez del Campo', shippingCost: 15100 },
  { id: 'XII', name: 'Magallanes y de la Antártica Chilena', shippingCost: 15100 },
];
