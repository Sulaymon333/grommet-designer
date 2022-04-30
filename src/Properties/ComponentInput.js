import React, { useContext } from 'react';
import { Box, Button } from 'grommet';
import { Add, Close, Edit } from 'grommet-icons';
import { getComponent, removeComponent } from '../design2';
import SelectionContext from '../SelectionContext';

const ComponentInput = ({ id, name, onChange, value }) => {
  const [, setSelection, { setLocation }] = useContext(SelectionContext);
  if (value && typeof value === 'string') return null;
  // if we have a value ensure we have a component there. if not, clear it
  if (value && !getComponent(value)) onChange(undefined);
  return (
    <Box direction="row">
      {value ? (
        <>
          <Button
            icon={<Edit />}
            onClick={() => {
              setLocation({ property: { id, name } });
              setSelection(value);
            }}
          />
          <Button icon={<Close />} onClick={() => removeComponent(value)} />
        </>
      ) : (
        <Button
          icon={<Add />}
          onClick={() => {
            setLocation({ property: { id, name } });
            setSelection(value);
          }}
        />
      )}
    </Box>
  );
};

export default ComponentInput;
