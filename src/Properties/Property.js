import React from 'react';
import ArrayProperty from './ArrayProperty';
import BooleanProperty from './BooleanProperty';
import ColorProperty from './ColorProperty';
import FunctionProperty from './FunctionProperty';
import IconProperty from './IconProperty';
import LinkProperty from './LinkProperty';
import NumberProperty from './NumberProperty';
import ObjectProperty from './ObjectProperty';
import ReferenceProperty from './ReferenceProperty';
import StringProperty from './StringProperty';

const Property = React.forwardRef(
  ({ property: propertyArg, value, ...rest }, ref) => {
    let property =
      propertyArg && propertyArg.dynamicProperty
        ? propertyArg.dynamicProperty({ value })
        : propertyArg;

    if (Array.isArray(property)) {
      if (property.includes('-color-')) {
        return <ColorProperty ref={ref} value={value} {...rest} />;
      }
      if (property.includes('-Icon-')) {
        return <IconProperty ref={ref} value={value} {...rest} />;
      }
      if (property.includes('-link-')) {
        return <LinkProperty ref={ref} value={value} {...rest} />;
      }
      if (property.includes('-reference-')) {
        return <ReferenceProperty ref={ref} value={value} {...rest} />;
      }
      return (
        <ArrayProperty ref={ref} options={property} value={value} {...rest} />
      );
    } else if (typeof property === 'string') {
      return <StringProperty ref={ref} value={value} {...rest} />;
    } else if (typeof property === 'number') {
      return <NumberProperty ref={ref} value={value} {...rest} />;
    } else if (typeof property === 'boolean') {
      return <BooleanProperty ref={ref} value={value} {...rest} />;
    } else if (typeof property === 'object') {
      return (
        <ObjectProperty
          ref={ref}
          value={value}
          property={property}
          Property={Property}
          {...rest}
        />
      );
    } else if (typeof property === 'function') {
      return (
        <FunctionProperty
          ref={ref}
          value={value}
          property={property}
          {...rest}
        />
      );
    }
    return null;
  },
);

export default Property;
