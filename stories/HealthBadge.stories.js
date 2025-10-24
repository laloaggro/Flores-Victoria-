import { HealthBadge } from './HealthBadge';

export default {
  title: 'Status/HealthBadge',
  component: HealthBadge,
};

const Template = (args) => HealthBadge(args);

export const OK = Template.bind({});
OK.args = { status: 'OK' };

export const DOWN = Template.bind({});
DOWN.args = { status: 'DOWN' };
