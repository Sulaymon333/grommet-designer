import React from 'react';
import { TextInput } from 'grommet';
import Field from '../components/Field';
import useDebounce from './useDebounce';

export default ({ componentId, onChange, name, value: valueProp }) => {
  const [value, setValue] = useDebounce(componentId, valueProp, onChange);
  return (
    <Field label={name} htmlFor={name}>
      <TextInput
        id={name}
        name={name}
        plain
        value={value || ''}
        onChange={event => setValue(event.target.value)}
        style={{ textAlign: 'end' }}
      />
    </Field>
  );
};
