import React, { Fragment } from 'react';
import { Paragraph } from 'grommet';
import DesignComponent from '../../DesignComponent';
import { replaceWithData, setProperty } from '../../design2';
import Alternative from './Alternative';
import Icon from './Icon';
import IFrame from './IFrame';

export const components = {
  Alternative: {
    component: Alternative,
    name: 'Alternative',
    container: true,
    selectable: true,
    placeholder: () => (
      <Paragraph size="large" textAlign="center" color="placeholder">
        This Alternative is currently empty. Add some components to it so it can
        alternate between them.
      </Paragraph>
    ),
    help: `Alternative is a designer specific component for
    use with this design tool. It provides a way to alternate through a variety
    of design options.`,
    defaultProps: {
      active: 1,
    },
    properties: {
      active: 1,
    },
    follow: (props, { component: { id, children } }) => {
      const nextActive =
        props.active === children.length ? 1 : props.active + 1;
      setProperty(id, 'props', 'active', nextActive);
    },
  },
  Icon: {
    component: Icon,
    name: 'Icon',
    properties: {
      color: ['-color-'],
      icon: ['-Icon-'],
      size: ['small', 'medium', 'large', 'xlarge'],
    },
    adjustProps: (props, { datum }) => {
      const adjusted = {};
      if (props.color) adjusted.color = replaceWithData(props.color, datum);
      if (props.icon) adjusted.icon = replaceWithData(props.icon, datum);
      return { ...props, ...adjusted };
    },
  },
  IFrame: {
    component: IFrame,
    name: 'IFrame',
    properties: {
      title: '',
      src: '',
    },
  },
  Repeater: {
    component: Fragment,
    name: 'Repeater',
    container: true,
    placeholder: () => (
      <Paragraph size="large" textAlign="center" color="placeholder">
        This Repeater is currently empty. Add some components to it so it can
        repeat them.
      </Paragraph>
    ),
    help: `Repeater is a designer specific component for
    use with this design tool. It expects a single child component which
    it will repeat 'count' times. Wrap it in a Box or Grid to control
    it's layout.`,
    defaultProps: {
      count: 2,
    },
    properties: {
      count: 2,
    },
    designProperties: {
      dataPath: '',
    },
    adjustProps: (props, { component }) => {
      const children = [];
      if (component?.children?.length === 1) {
        for (let i = 0; i < props.count; i += 1) {
          children.push(<DesignComponent key={i} id={component.children[0]} />);
        }
      }
      return { ...props, children };
    },
  },
  Reference: {
    component: ({ children, style }) => {
      if (children && style) return React.cloneElement(children, { style });
      else return children || null;
    },
    name: 'Reference',
    help: `Reference is a designer specific component for
    use with this design tool. The key property is 'component'
    which is a reference to the component that should be used.
    Changes to that referenced component will be shown for all
    References to it.`,
    hideable: true,
    defaultProps: {
      includeChildren: true,
    },
    properties: {
      component: ['-reference-'],
      includeChildren: true,
    },
    adjustProps: (props) => {
      if (props.component) {
        // TODO: verify !includeChildren case
        // pass style through to be able to show selection
        const children = (
          <DesignComponent id={props.component} style={props.style}>
            {!props.includeChildren ? props.children : null}
          </DesignComponent>
        );
        return { ...props, children };
      }
      return props;
    },
  },
  Screen: {
    name: 'Screen',
  },
};
