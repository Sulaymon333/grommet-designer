import Icon, { names as iconNames } from './Icon';
import ReferenceComponent from './ReferenceComponent';
import Repeater from './Repeater';

export const components = {
  Icon: {
    component: Icon,
    name: 'Icon',
    properties: {
      color: ['-color-'],
      icon: iconNames,
      size: ['small', 'medium', 'large'],
    },
  },
  Repeater: {
    component: Repeater,
    name: 'Repeater',
    container: true,
    help: `Repeater is a designer specific component for
    use with this design tool. It expects a single child component which
    it will repeat 'count' times. Wrap it in a Box or Grid to control
    it's layout.`,
    defaultProps: {
      count: 2,
    },
    properties: {
      count: [1, 2, 5, 10, 20, 100],
      dataPath: '',
    },
  },
  Reference: {
    name: 'Reference',
    help: `Reference is a designer specific componen for
    use with this design tool. It has a single property which is a reference
    to the component that should be used. Changes to that referenced component
    will be shown for all References to it.`,
    properties: {
      component: ReferenceComponent,
    },
  },
  Screen: {
    name: 'Screen',
  },
};
