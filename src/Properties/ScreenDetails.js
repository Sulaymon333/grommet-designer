import React, { useContext } from 'react';
// import ReactGA from 'react-ga';
import { Box, Button, Keyboard, Menu, Text } from 'grommet';
import { Duplicate, Trash } from 'grommet-icons';
import SelectionContext from '../SelectionContext';
import { removeScreen, setScreenProperty, useScreen } from '../design2';
// import { addScreen, deleteScreen, newFrom, slugify } from '../design';
import TextInputField from './TextInputField';

const ScreenDetails = () => {
  const [selection, setSelection] = useContext(SelectionContext);
  const screen = useScreen(selection);

  if (!screen) return null;

  const delet = () => {
    removeScreen(selection);
    setSelection(undefined);
  }

  // const duplicate = () => {
  //   const nextDesign = JSON.parse(JSON.stringify(design));
  //   const nextSelected = { ...selected };
  //   addScreen({
  //     nextDesign,
  //     nextSelected,
  //     copyScreen: nextDesign.screens[selected.screen],
  //     libraries,
  //   });
  //   changeDesign(nextDesign);
  //   setSelected(nextSelected);
  // };

  // const newDesignFrom = () => {
  //   const [nextDesign, nextSelected] = newFrom({
  //     design,
  //     externalReferences: false,
  //     imports,
  //     libraries,
  //     selected,
  //   });
  //   changeDesign(nextDesign);
  //   setSelected(nextSelected);

  //   ReactGA.event({ category: 'switch', action: 'new design from' });
  // };

  const onKeyDown = (event) => {
    if (event.metaKey) {
      if (event.keyCode === 8) {
        // delete
        event.preventDefault();
        delet();
      }
    }
  };

  const menuItems = [
    {
      label: `create new design using this Screen`,
      // onClick: newDesignFrom,
    },
  ].filter((i) => i);

  if (!screen) return null;
  return (
    <Keyboard target="document" onKeyDown={onKeyDown}>
      <Box border="left">
        <Box
          flex={false}
          direction="row"
          align="center"
          justify="between"
          border="bottom"
        >
          <Menu
            hoverIndicator
            label={
              <Text weight="bold" truncate>
                Screen
              </Text>
            }
            dropProps={{ align: { top: 'bottom', left: 'left' } }}
            items={menuItems}
          />
          <Box flex={false} direction="row" align="center">
            {/* <Button
              title="duplicate"
              tip="duplicate"
              icon={<Duplicate />}
              hoverIndicator
              onClick={duplicate}
            /> */}
            {/* {design.screenOrder.length > 1 && ( */}
              <Button
                title="delete"
                tip="delete"
                icon={<Trash />}
                hoverIndicator
                onClick={delet}
              />
            {/* )} */}
          </Box>
        </Box>
        <Box flex overflow="auto">
          <Box flex={false}>
            <TextInputField
              name="name"
              componentId={screen.id}
              value={screen.name || ''}
              onChange={(value) => setScreenProperty(selection, 'name', value)}
            />
            <TextInputField
              name="path"
              componentId={screen.id}
              value={screen.path || ''}
              onChange={(value) => setScreenProperty(selection, 'path', value)}
            />
          </Box>
        </Box>
      </Box>
    </Keyboard>
  );
};

export default ScreenDetails;
