import { createProductCard } from './ProductCard';

export default {
  title: 'Components/ProductCard',
  tags: ['autodocs'],
  render: (args) => createProductCard(args),
  argTypes: {
    image: {
      control: 'text',
      description: 'URL de la imagen del producto',
    },
    title: {
      control: 'text',
      description: 'Nombre del producto',
    },
    description: {
      control: 'text',
      description: 'Descripción del producto',
    },
    price: {
      control: 'number',
      description: 'Precio original en CLP',
    },
    discount: {
      control: { type: 'range', min: 0, max: 50, step: 5 },
      description: 'Porcentaje de descuento',
    },
    onAddToCart: { action: 'add-to-cart' },
    onViewDetails: { action: 'view-details' },
  },
};

export const Default = {
  args: {
    title: 'Ramo de Rosas Rojas',
    description: '12 rosas rojas frescas con follaje',
    price: 35000,
    discount: 0,
  },
};

export const WithDiscount = {
  args: {
    title: 'Arreglo Primavera',
    description: 'Mezcla de flores de temporada',
    price: 45000,
    discount: 20,
  },
};

export const Premium = {
  args: {
    title: 'Arreglo Premium',
    description: 'Orquídeas y rosas en elegante jarrón',
    price: 75000,
    discount: 15,
  },
};

export const Simple = {
  args: {
    title: 'Girasoles',
    description: '6 girasoles frescos',
    price: 18000,
    discount: 0,
  },
};

export const BestSeller = {
  args: {
    title: 'Mix de Rosas',
    description: 'Rosas de colores variados (24 unidades)',
    price: 55000,
    discount: 25,
  },
};
