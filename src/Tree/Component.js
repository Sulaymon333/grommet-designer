import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Stack, Text } from 'grommet';
import { FormDown, FormNext } from 'grommet-icons';
import SelectionContext from '../SelectionContext';
import {
  getComponent,
  getName,
  getType,
  moveComponent,
  toggleCollapsed,
  useComponent,
} from '../design2';
import ComponentDropArea from './ComponentDropArea';
import DragDropContext from './DragDropContext';

const Component = ({ id, first }) => {
  const [selection, setSelection, { followLinkOption }] =
    useContext(SelectionContext);
  const [dragging, setDragging] = useContext(DragDropContext);
  const [dragOver, setDragOver] = useState();

  const component = useComponent(id);

  useEffect(() => {
    const comp = getComponent(id);
    const type = getType(comp.type);
    if (type.initialize)
      type.initialize(comp.props, { component: comp, followLinkOption });
  }, [id, followLinkOption]);

  if (!component) return null;

  const name = getName(id);
  const subName = component.type.split('.')[1] || component.type;

  // let reference;
  // if (component.type === 'designer.Reference')
  //   reference = getComponent(component.props.component);

  const collapserColor = selection === id ? 'white' : 'border';
  const CollapseIcon = component.collapsed ? FormNext : FormDown;

  return (
    <Box>
      {first && <ComponentDropArea id={id} where="before" />}
      <Stack anchor="left">
        <Button
          fill
          hoverIndicator
          onClick={(event) => setSelection(event.shiftKey ? undefined : id)}
          draggable={!component.coupled}
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', ''); // for Firefox
            setDragging(id);
          }}
          onDragEnd={() => {
            if (dragging === id) setDragging(undefined);
          }}
          onDragEnter={(event) => {
            if (dragging && dragging !== id && getComponent(dragging)) {
              event.preventDefault();
              setDragOver(true);
            }
          }}
          onDragOver={(event) => {
            if (dragOver) event.preventDefault();
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={() => {
            if (dragOver) {
              moveComponent(dragging, { within: id });
              setDragOver(false);
            }
          }}
        >
          <Box
            direction="row"
            align="center"
            gap="medium"
            pad={{ vertical: 'xsmall', left: 'large', right: 'small' }}
            background={
              (dragOver && 'focus') ||
              (selection === id && 'selected-background') ||
              undefined
            }
          >
            <Text size="medium" truncate>
              {name}
            </Text>
            {subName !== name && (
              <Text size="small" truncate>
                {subName}
              </Text>
            )}
          </Box>
        </Button>
        {component.children && (
          <Button
            icon={<CollapseIcon color={collapserColor} />}
            onClick={() => toggleCollapsed(id)}
          />
        )}
      </Stack>
      {!component.collapsed && component.children && (
        <Box pad={{ left: 'small' }}>
          {component.children.map((childId, index) => (
            <Component key={childId} id={childId} first={index === 0} />
          ))}
        </Box>
      )}
      <ComponentDropArea id={id} where="after" />
    </Box>
  );
};

export default Component;
