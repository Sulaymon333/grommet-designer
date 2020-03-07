import React from 'react';
import { Box, Button, Text } from 'grommet';
import { Location } from 'grommet-icons';
import { getDisplayName, getScreenForComponent } from '../design';
import ArrayProperty from './ArrayProperty';

const ReferenceLabel = design => ({ selected, value }) => (
  <Box pad="small">
    <Text weight={selected ? 'bold' : undefined}>
      {(value === 'undefined' && 'undefined') ||
        (value && getDisplayName(design, value)) ||
        ''}
    </Text>
  </Box>
);

const ReferenceProperty = React.forwardRef(
  (
    { design, first, name, onChange, selected, setSelected, sub, value },
    ref,
  ) => {
    const isReferenceable = component =>
      component.type !== 'Grommet' && component.type !== 'Reference';
    const options = Object.keys(design.components).filter(id =>
      isReferenceable(design.components[id]),
    );
    const referenceComponentId = parseInt(value, 10);
    const referenceSelected = {
      ...selected,
      screen: getScreenForComponent(design, referenceComponentId),
      component: referenceComponentId,
    };
    return (
      <ArrayProperty
        ref={ref}
        name={name}
        sub={sub}
        first={first}
        Label={ReferenceLabel(design)}
        options={options}
        value={value}
        searchTest={(option, searchExp) =>
          searchExp.test(getDisplayName(design, option))
        }
        onChange={onChange}
      >
        {value && (
          <Button
            icon={<Location />}
            hoverIndicator
            onClick={() => setSelected(referenceSelected)}
          />
        )}
      </ArrayProperty>
    );
  },
);

export default ReferenceProperty;
