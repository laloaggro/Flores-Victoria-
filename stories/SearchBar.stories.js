import { createSearchBar } from './SearchBar.js';

export default {
  title: 'Components/SearchBar',
  argTypes: {
    placeholder: { control: 'text' },
    value: { control: 'text' },
    showFilters: { control: 'boolean' },
    onSearch: { action: 'searched' },
    onClear: { action: 'cleared' },
    onFilterChange: { action: 'filtersChanged' },
  },
};

const Template = (args) => createSearchBar(args);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Buscar productos...',
  value: '',
  showFilters: false,
};

export const WithValue = Template.bind({});
WithValue.args = {
  placeholder: 'Buscar productos...',
  value: 'Rosas',
  showFilters: false,
};

export const WithSuggestions = Template.bind({});
WithSuggestions.args = {
  placeholder: 'Buscar productos...',
  value: 'ro',
  suggestions: [
    'Rosas rojas',
    'Rosas blancas',
    'Rosas rosadas',
    'Rosas amarillas',
    'Ramo de rosas',
  ],
  showFilters: false,
};

export const WithFilters = Template.bind({});
WithFilters.args = {
  placeholder: 'Buscar productos...',
  value: '',
  showFilters: true,
};

export const CompleteSearch = Template.bind({});
CompleteSearch.args = {
  placeholder: 'Buscar flores, arreglos, plantas...',
  value: 'rosa',
  suggestions: ['Rosas rojas', 'Rosas blancas', 'Ramo de rosas'],
  showFilters: true,
};
