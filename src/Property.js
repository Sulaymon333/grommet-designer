import React from 'react';
import {
  Box, Button, CheckBox, Heading, Layer, Select, Text, TextInput,
} from 'grommet';
import { Close, FormDown, FormNext, FormUp } from 'grommet-icons';
import { SelectLabel as IconLabel } from './Icon';
import ActionButton from './components/ActionButton';
import Field from './components/Field';

const ColorLabel = ({ color }) => (
  <Box pad="small" direction="row" gap="small" align="center">
    <Box pad="small" background={color} />
    <Text weight="bold">{color}</Text>
  </Box>
)

const OptionLabel = ({ active, hasColor, name, value }) => {
  if (hasColor && typeof value === 'string') return <ColorLabel color={value} />;
  if (name === 'icon' && typeof value === 'string') return <IconLabel icon={value} />;
  return (
    <Box pad="small">
      <Text weight={active ? "bold" : undefined}>
        {typeof value !== 'string' ? JSON.stringify(value) : value || ''}
      </Text>
    </Box>
  );
}

const Property = React.forwardRef((props, ref) => {
  const { name, property, value, onChange } = props;
  const [expand, setExpand] = React.useState();
  const [searchText, setSearchText] = React.useState('');

  const searchExp = searchText && new RegExp(searchText, 'i');
  if (Array.isArray(property)) {
    const hasColor = property.includes('light-1');
    return (
      <Field key={name} label={name} htmlFor={name}>
        <Select
          ref={ref}
          plain
          id={name}
          name={name}
          options={searchExp ? [...property.filter(p => searchExp.test(p)), 'undefined']
            : [...property, 'undefined']}
          value={value || ''}
          valueLabel={
            <OptionLabel active name={name} hasColor={hasColor} value={value} />}
          onChange={({ option }) => {
            setSearchText(undefined);
            onChange(option === 'undefined' ? undefined : option);
          }}
          onSearch={property.length > 20
            ? (nextSearchText) => setSearchText(nextSearchText) : undefined}
        >
          {(option) =>
            <OptionLabel
              name={name}
              hasColor={hasColor}
              value={option}
              active={option === value}
            />}
        </Select>
      </Field>
    );
  } else if (typeof property === 'string') {
    return (
      <Field key={name} label={name} htmlFor={name}>
        <TextInput
          ref={ref}
          id={name}
          name={name}
          plain
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          style={{ textAlign: 'end' }}
        />
      </Field>
    );
  } else if (typeof property === 'boolean') {
    return (
      <Field key={name} label={name} htmlFor={name}>
        <Box pad="small">
          <CheckBox
            ref={ref}
            id={name}
            name={name}
            toggle
            checked={!!value}
            onChange={(event) => onChange(event.target.checked)}
          />
        </Box>
      </Field>
    );
  } else if (typeof property === 'object') {
    return (
      <Box key={name}>
        <Button ref={ref} hoverIndicator onClick={() => setExpand(!expand)}>
          <Field label={name}>
            <Box pad="small">
              {expand
                ? <FormUp color={value ? 'accent-2' : undefined} />
                : <FormDown color={value ? 'accent-2' : undefined} />}
            </Box>
          </Field>
        </Button>
        {expand && (
          <Box margin={{ left: 'small' }} background="dark-1">
            {Object.keys(property).map((key) => (
              <Property
                key={key}
                name={key}
                property={property[key]}
                value={(value || {})[key]}
                onChange={subValue => {
                  let nextValue = { ...(value || {}) };
                  if (subValue !== undefined && subValue !== '') nextValue[key] = subValue
                  else delete nextValue[key];
                  onChange(Object.keys(nextValue).length > 0 ? nextValue : undefined);
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  } else if (typeof property === 'function') {
    const CustomProperty = property;
    return (
      <Box key={name} border="bottom">
        <Button ref={ref} hoverIndicator onClick={() => setExpand(!expand)}>
          <Field label={name}>
            <Box pad="small">
              <FormNext color={value ? 'accent-2' : undefined} />
            </Box>
          </Field>
        </Button>
        {expand && (
          <Layer
            position="right"
            margin="medium"
            onEsc={() => setExpand(false)}
            onClickOutside={() => setExpand(false)}
          >
            <Box
              direction="row"
              align="center"
              justify="between"
              gap="medium"
              pad="small"
              flex={false}
            >
              <Heading margin={{ left: "small", vertical: 'none' }} level={3}>
                {name}
              </Heading>
              <ActionButton
                icon={<Close />}
                onClick={() => setExpand(false)}
              />
            </Box>
            <Box
              overflow="auto"
              pad={{ horizontal: 'medium', bottom: 'medium' }}
            >
              <Box flex={false}>
                <CustomProperty {...props} />
              </Box>
            </Box>
          </Layer>
        )}
      </Box>
    );
  }
  return null;
})

export default Property
