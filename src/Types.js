import React from 'react';
import {
  Anchor, Box, Button, Calendar, CheckBox, Clock, DataTable, FormField,
  Grid, Grommet, Heading, Image, Layer,
  Menu, Meter, Paragraph,
  Select, Stack, Text, TextArea, TextInput, base, grommet,
} from 'grommet';
import Icon, { names as iconNames } from './Icon';
import Repeater from './Repeater';
import GridColumns from './custom/GridColumns';
import GridRows from './custom/GridRows';
import DataTableColumns from './custom/DataTableColumns';
import DataTableData from './custom/DataTableData';

const internalColors = ['active', 'background', 'focus', 'icon', 'placeholder', 'selected', 'text' ]
const colors = Object.keys({ ...base.global.colors, ...grommet.global.colors })
  // prune out colors we tend to use internally
  .filter(color => (typeof base.global.colors[color] === 'string'
    && !internalColors.includes(color)))
  .sort((c1, c2) => (c1 > c2 ? 1 : -1)); // sort alphabetically

export const types = {
  Box: {
    component: Box,
    name: 'Box',
    sample: <Box pad="xsmall" border>Box</Box>,
    defaultProps: {
      align: 'center',
      justify: 'center',
      pad: 'small',
    },
    properties: {
      align: ['stretch', 'start', 'center', 'end'],
      alignSelf: ['stretch', 'start', 'center', 'end'],
      animation: ['fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'zoomIn', 'zoomOut'],
      background: {
        color: colors,
        dark: false,
        opacity: ['weak', 'medium', 'strong'],
        position: ['center', 'top', 'bottom', 'left', 'right'],
        image: '',
      },
      border: {
        color: colors,
        size: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
        side: ['all', 'horizontal', 'vertical', 'top', 'left', 'bottom', 'right' ],
      },
      basis: ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'full', '1/2', '1/3', '2/3', '1/4', '3/4', 'auto'],
      direction: ['column', 'row'],
      elevation: ['none', 'xsmall', 'small', 'medium', 'large', 'xlarge'],
      fill: ['horizontal', 'vertical'],
      flex: ['grow', 'shrink'],
      gap: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      height: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      justify: ['between', 'start', 'center', 'end'],
      margin: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      overflow: ['auto', 'hidden', 'scroll', 'visible'],
      pad: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      round: ['xsmall', 'small', 'medium', 'large', 'full'],
      width: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
    },
  },
  Grid: {
    component: Grid,
    name: 'Grid',
    sample: <Box pad="xsmall" border={{ side: 'vertical', size: 'xlarge' }}>Grid</Box>,
    properties: {
      align: ['stretch', 'start', 'center', 'end'],
      alignContent: ['stretch', 'start', 'center', 'end'],
      columns: GridColumns,
      fill: ['horizontal', 'vertical'],
      gap: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      justify: ['between', 'start', 'center', 'end'],
      margin: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      rows: GridRows,
    },
  },
  Stack: {
    component: Stack,
    name: 'Stack',
    sample: (
      <Stack guidingChild="last">
        <Box width="xxsmall" background={{ color: 'brand', opacity: 'medium' }} fill="vertical" round="full"/>
        <Box pad="xsmall" border>Stack</Box>
      </Stack>
    ),
    properties: {
      anchor: ['center', 'top', 'bottom', 'left', 'right'],
      fill: false,
      guidingChild: ['first', 'last'],
    },
  },
  Layer: {
    component: Layer,
    name: 'Layer',
    sample: <Box pad="xsmall" border={{ side: 'right', size: 'xlarge' }}>Layer</Box>,
    defaultProps: {
      modal: false,
    },
    properties: {
      animate: false,
      full: ['horizontal', 'vertical'],
      margin: ['none', 'xsmall', 'small', 'medium', 'large'],
      plain: false,
      position: ['center', 'top', 'bottom', 'left', 'right'],
      responsive: false,
    },
  },
  Grommet: { component: Grommet, name: 'Grommet' },
  Heading: {
    component: Heading,
    name: 'Heading',
    sample: <Heading size="small" margin="none">Heading</Heading>,
    text: 'Heading',
    properties: {
      color: colors,
      level: ['1', '2', '3', '4'],
      margin: ['none', 'small', 'medium', 'large'],
      size: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      textAlign: ['start', 'center', 'end'],
      truncate: false,
    },
  },
  Paragraph: {
    component: Paragraph,
    name: 'Paragraph',
    text: 'Paragraph',
    properties: {
      color: colors,
      margin: ['none', 'small', 'medium', 'large'],
      size: ['small', 'medium', 'large', 'xlarge', 'xxlarge'],
      textAlign: ['start', 'center', 'end'],
    },
  },
  Text: {
    component: Text,
    name: 'Text',
    text: 'Text',
    properties: {
      color: colors,
      size: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      textAlign: ['start', 'center', 'end'],
      truncate: false,
      weight: ['normal', 'bold'],
    },
  },
  Icon: {
    component: Icon,
    name: 'Icon',
    properties: {
      icon: iconNames,
      size: ['small', 'medium', 'large'],
    }
  },
  Anchor: {
    component: Anchor,
    name: 'Anchor',
    sample: <Text style={{ textDecoration: 'underline' }}>Anchor</Text>,
    defaultProps: {
      label: 'anchor',
    },
    properties: {
      color: colors,
      label: 'anchor',
      size: ['xsmall', 'small', 'medium', 'large'],
    },
  },
  Button: {
    component: Button,
    name: 'Button',
    sample: (
      <Box
        round="medium"
        border={{ color: 'brand', size: 'medium' }}
        align="center"
      >
        Button
      </Box>
    ),
    defaultProps: {
      label: 'Button',
    },
    properties: {
      color: colors,
      disabled: false,
      fill: ['horizontal', 'vertical'],
      gap: ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge'],
      hoverIndicator: false,
      icon: iconNames,
      label: 'Click Me',
      plain: false,
      primary: false,
      reverse: false,
    },
  },
  Menu: {
    component: Menu,
    name: 'Menu',
    defaultProps: {
      label: 'Menu',
    },
    properties: {
      disabled: false,
      icon: false,
      label: 'Actions',
      open: false,
      size: ['small', 'medium', 'large', 'xlarge'],
    },
  },
  CheckBox: {
    component: CheckBox,
    name: 'CheckBox',
    defaultProps: {
      label: 'CheckBox',
    },
    properties: {
      checked: false,
      disabled: false,
      label: 'enabled?',
      reverse: false,
      toggle: false,
    },
  },
  FormField: {
    component: FormField,
    name: 'FormField',
    properties: {
      color: colors,
      error: 'error',
      help: 'help',
      label: 'label',
    },
  },
  Select: {
    component: Select,
    name: 'Select',
    defaultProps: {
      options: ['option 1', 'option 2'],
    },
    properties: {
      disabled: false,
      multiple: false,
      placeholder: '',
      size: ['small', 'medium', 'large', 'xlarge'],
    },
  },
  TextArea: {
    component: TextArea,
    name: 'TextArea',
  },
  TextInput: {
    component: TextInput,
    name: 'TextInput',
    properties: {
      placeholder: '',
    }
  },
  Calendar: {
    component: Calendar,
    name: 'Calendar',
    properties: {
      animate: false,
      daysOfWeek: false,
      range: false,
      size: ['small', 'medium', 'large'],
    },
  },
  Clock: {
    component: Clock,
    name: 'Clock',
    properties: {
      hourLimit: ["12", "24"],
      precision: ['hours', 'minutes', 'seconds'],
      run: ['forward', 'backward'],
      size: ['small', 'medium', 'large', 'xlarge'],
      type: ['analog', 'digital'],
    },
  },
  DataTable: {
    component: DataTable,
    name: 'DataTable',
    defaultProps: {
      columns: [
        { header: 'Name', property: 'name', primary: true },
        { header: 'Count', property: 'count' },
      ],
      data: [{ name: 'Eric', count: 5 }, { name: 'Shimi', count: 7 }],
    },
    properties: {
      columns: DataTableColumns,
      data: DataTableData,
      resizeable: false,
      size: ['small', 'medium', 'large', 'xlarge'],
      sortable: false,
    },
  },
  Meter: {
    component: Meter,
    name: 'Meter',
    properties: {
      background: colors,
      round: false,
      size: ['xsmall', 'small', 'medium', 'large', 'xlarge', 'full'],
      thickness: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      type: ['bar', 'circle'],
    },
  },
  Image: {
    component: Image,
    name: 'Image',
    properties: {
      fit: ['cover', 'contain'],
      opacity: ['weak', 'medium', 'strong'],
      src: '',
    },
  },
  Repeater: {
    component: Repeater,
    name: 'Repeater',
    help: `Repeater is not a grommet component, it is a special component for
    use with this design tool. It expects a single child component which
    it will repeat 'count' times. Wrap it in a Box or Grid to control
    it's layout.`,
    defaultProps: {
      count: 2,
    },
    properties: {
      count: [1, 2, 5, 10, 20, 100],
    },
  }
};

export const Adder = ({ onAdd, onClose }) => (
  <Layer
    position="top-left"
    margin="medium"
    onEsc={onClose}
    onClickOutside={onClose}
  >
    <Box fill="vertical" overflow="auto">
      <Grid columns="small" rows="xxsmall">
        {Object.keys(types).filter(key => key !== 'Grommet').map((key) => {
          const type = types[key];
          return (
            <Box fill key={key} overflow="hidden">
              <Button fill hoverIndicator onClick={() => onAdd(key)}>
                <Box pad={{ horizontal: 'small', vertical: 'xxsmall' }}>
                  {type.sample || type.name}
                </Box>
              </Button>
            </Box>
          );
        })}
        <Box border="top">
          <Button fill hoverIndicator onClick={() => onAdd('Screen')}>
            <Box pad={{ horizontal: 'small', vertical: 'xxsmall' }}>
              Screen
            </Box>
          </Button>
        </Box>
      </Grid>
    </Box>
  </Layer>
);
