import React, { Component } from 'react';
import {
  Box, Button, Heading, Keyboard, Menu, Stack, Text, grommet,
} from 'grommet';
import { Add, FormDown, FormUp, Redo, Undo } from 'grommet-icons';
import { types } from '../types';
import { getParent, getScreen, resetState, bare } from '../designs';
import ActionButton from '../ActionButton';
import AddComponent from './AddComponent';
import Code from './Code';
import ConfirmReset from './ConfirmReset';
import Data from './Data';
import Designs from './Designs';
import Publish from './Publish';
import Rename from './Rename';
import Theme from './Theme';
import Import from './Import';

const treeName = component =>
  (component.name || component.text
    || component.props.name || component.props.label
    || component.type);

class Tree extends Component {
  state = {}

  selectedRef = React.createRef();

  componentDidUpdate() {
    if (this.selectedRef.current) {
      const rect = this.selectedRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        this.selectedRef.current.scrollIntoView();
      }
    }
  }

  select = (selected) => {
    const { onChange } = this.props;
    onChange({ selected });
  }

  moveChild = (dragging, target, where) => {
    const { design, onChange } = this.props;
    const nextDesign = JSON.parse(JSON.stringify(design));
    // remove from old parent
    const priorParent = getParent(nextDesign, dragging);
    const priorIndex = priorParent.children.indexOf(dragging);
    priorParent.children.splice(priorIndex, 1);
    // insert into new parent
    if (where === 'in') {
      const nextParent = nextDesign.components[target];
      if (!nextParent.children) nextParent.children = [];
      nextParent.children.unshift(dragging);
    } else {
      const nextParent = getParent(nextDesign, target);
      const nextIndex = nextParent.children.indexOf(target);
      nextParent.children.splice(where === 'before' ? nextIndex : nextIndex + 1,
        0, dragging);
    }
    const nextScreen = getScreen(nextDesign, dragging);
    this.setState({ dragging: undefined, dropTarget: undefined });
    onChange({
      design: nextDesign,
      selected: { screen: nextScreen , component: dragging },
    });
  }

  moveScreen = (dragging, target, where) => {
    const { design, onChange } = this.props;
    const nextDesign = JSON.parse(JSON.stringify(design));
    const moveIndex = nextDesign.screenOrder.indexOf(dragging);
    nextDesign.screenOrder.splice(moveIndex, 1);
    const targetIndex = nextDesign.screenOrder.indexOf(target);
    nextDesign.screenOrder.splice(where === 'before' ? targetIndex : targetIndex + 1,
      0, dragging);
    this.setState({ draggingScreen: undefined, dropScreenTarget: undefined });
    onChange({ design: nextDesign });
  }

  onDuplicate = () => {
    const { design, onChange } = this.props;
    const nextDesign = JSON.parse(JSON.stringify(design));
    nextDesign.name = `${design.name} - 1`;
    onChange({ design: nextDesign });
  }

  onReset = () => {
    const { onChange } = this.props;
    localStorage.removeItem('selected');
    localStorage.removeItem('activeDesign');
    onChange({ ...resetState(bare), theme: grommet });
  }

  toggleCollapse = () => {
    const { design, selected, onChange } = this.props;
    const nextDesign = JSON.parse(JSON.stringify(design));
    const component = nextDesign.components[selected.component];
    component.collapsed = !component.collapsed;
    onChange({ design: nextDesign });
  }

  onKeyDown = (event) => {
    if (event.metaKey) {
      // if (event.keyCode === 65) { // a
      //   event.preventDefault();
      //   this.setState({ adding: true });
      // }
    }
  }

  renderDropArea = (id, where) => {
    const { dragging, dropWhere, dropTarget } = this.state;
    return (
      <Box
        pad="xxsmall"
        background={dragging && dropTarget
          && dropTarget === id && dropWhere === where
          ? 'accent-2' : undefined}
        onDragEnter={(event) => {
          if (dragging && dragging !== id) {
            event.preventDefault();
            this.setState({ dropTarget: id, dropWhere: where });
          } else {
            this.setState({ dropTarget: undefined });
          }
        }}
        onDragOver={(event) => {
          if (dragging && dragging !== id) {
            event.preventDefault();
          }
        }}
        onDrop={() => this.moveChild(dragging, dropTarget, dropWhere)}
      />
    );
  }

  renderScreenDropArea = (screenId, where) => {
    const { draggingScreen, dropWhere, dropScreenTarget } = this.state;
    return (
      <Box
        pad="xxsmall"
        background={draggingScreen
          && dropScreenTarget && dropScreenTarget === screenId
          && dropWhere === where
          ? 'accent-2' : undefined}
        onDragEnter={(event) => {
          if (draggingScreen && draggingScreen !== screenId) {
            event.preventDefault();
            this.setState({ dropScreenTarget: screenId, dropWhere: where });
          } else {
            this.setState({ dropScreenTarget: undefined });
          }
        }}
        onDragOver={(event) => {
          if (draggingScreen && draggingScreen !== screenId) {
            event.preventDefault();
          }
        }}
        onDrop={() => this.moveScreen(draggingScreen, dropScreenTarget, dropWhere)}
      />
    );
  }

  renderComponent = (screen, id, firstChild) => {
    const { design, selected } = this.props;
    const { dragging, dropTarget, dropWhere } = this.state;
    const component = design.components[id];
    if (!component) return null;
    const type = types[component.type];
    const reference = (component.type === 'Reference'
      && design.components[component.props.component]);
    return (
      <Box key={id}>
        {firstChild && this.renderDropArea(id, 'before')}
        <Stack anchor="right">
          <Button
            fill
            hoverIndicator
            onClick={() => this.select({ screen, component: id })}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', ''); // for Firefox
              this.setState({ dragging: id });
            }}
            onDragEnd={() =>
              this.setState({ dragging: undefined, dropTarget: undefined })}
            onDragEnter={() => {
              if (dragging && dragging !== id && type.container) {
                this.setState({ dropTarget: id, dropWhere: 'in' });
              }
            }}
            onDragOver={(event) => {
              if (dragging && dragging !== id && type.container) {
                event.preventDefault();
              }
            }}
            onDrop={() => this.moveChild(dragging, dropTarget, dropWhere)}
          >
            <Box
              ref={selected.component === id ? this.selectedRef : undefined}
              pad={{ vertical: 'xsmall', horizontal: 'small' }}
              background={
                (dropTarget && dropTarget === id && dropWhere === 'in')
                ? 'accent-2'
                : (selected.component === id ? 'dark-3' : undefined)
              }
              round={{
                size: 'small',
                corner: (component.children ? 'top-left' : 'left'),
              }}
            >
              <Text truncate>
                {(reference && treeName(reference)) || treeName(component)}
              </Text>
            </Box>
          </Button>
          {selected.component === id && component.children && (
            <Button
              icon={component.collapsed ? <FormDown /> : <FormUp />}
              onClick={this.toggleCollapse}
            />
          )}
        </Stack>
        {!component.collapsed && component.children && (
          <Box
            pad={{ left: 'small' }}
            background={selected.component === id ? 'dark-2' : undefined}
            round={{ size: 'small', corner: 'bottom-left' }}
          >
            {component.children.map((childId, index) =>
              this.renderComponent(screen, childId, index === 0))}
          </Box>
        )}
        {this.renderDropArea(id, 'after')}
      </Box>
    )
  }

  renderScreen = (screenId, firstScreen) => {
    const { design, selected } = this.props;
    const screen = design.screens[screenId];
    const id = screen.root;
    const component = design.components[id];
    return (
      <Box key={screen.id} flex={false}>
        {firstScreen && this.renderScreenDropArea(screenId, 'before')}
        <Stack anchor="right">
          <Button
            fill
            hoverIndicator
            onClick={() => this.select({ screen: screenId, component: id })}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', ''); // for Firefox
              this.setState({ draggingScreen: screenId });
            }}
            onDragEnd={() =>
              this.setState({ draggingScreen: undefined, dropScreenTarget: undefined })}
          >
            <Box
              pad={{ vertical: 'xsmall', horizontal: 'small' }}
              background={
                selected.screen === screenId && selected.component === id
                ? 'dark-3' : undefined
              }
              round={{ size: 'small', corner: 'top-left' }}
            >
              <Heading level={3} size="small" margin="none">
                {screen.name || `Screen ${screen.id}`}
              </Heading>
            </Box>
          </Button>
          {selected.screen === screenId
            && selected.component === id
            && component.children && (
            <Button
              icon={component.collapsed ? <FormDown /> : <FormUp />}
              onClick={this.toggleCollapse}
            />
          )}
        </Stack>
        {!component.collapsed && component.children && (
          <Box
            flex={false}
            background={
              selected.screen === screenId && selected.component === id
              ? 'dark-2' : undefined
            }
            round={{ size: 'small', corner: 'bottom-left' }}
          >
            {component.children.map((childId) =>
              this.renderComponent(screen.id, childId))}
          </Box>
        )}
        {this.renderScreenDropArea(screenId, 'after')}
      </Box>
    );
  }

  renderAction() {
    const { design, selected, onChange } = this.props;
    const {
      adding, changeTheme, code, confirmReset, chooseDesign, editData,
      importFile, publish, rename,
    } = this.state;
    if (adding) return (
      <AddComponent
        design={design}
        selected={selected}
        onChange={(nextState) => {
          this.setState({ adding: false });
          onChange(nextState);
        }}
        onClose={() => this.setState({ adding: false })}
      />
    );
    if (rename) return (
      <Rename
        design={design}
        onClose={() => this.setState({ rename: undefined })}
        onChange={onChange}
      />
    );
    if (changeTheme) return (
      <Theme
        design={design}
        onClose={() => this.setState({ changeTheme: undefined })}
        onChange={onChange}
      />
    );
    if (editData) return (
      <Data
        design={design}
        onClose={() => this.setState({ editData: undefined })}
        onChange={onChange}
      />
    );
    if (publish) return (
      <Publish
        design={design}
        onClose={() => this.setState({ publish: undefined })}
        onChange={onChange}
      />
    );
    if (code) return (
      <Code
        design={design}
        onClose={() => this.setState({ code: undefined })}
        onChange={onChange}
      />
    );
    if (chooseDesign) return (
      <Designs
        design={design}
        onClose={() => this.setState({ chooseDesign: undefined })}
        onChange={onChange}
      />
    );
    if (importFile) return (
      <Import
        design={design}
        onClose={() => this.setState({ importFile: undefined })}
        onChange={onChange}
      />
    );
    if (confirmReset) return (
      <ConfirmReset
        onCancel={() => this.setState({ confirmReset: undefined })}
        onReset={() => {
          this.setState({ confirmReset: undefined });
          this.onReset();
        }}
      />
    );
    return null;
  }

  render() {
    const { design, selected, onUndo, onRedo } = this.props;
    const selectedComponent = design.components[selected.component];
    const selectedType = types[selectedComponent.type];
    return (
      <Keyboard
        target="document"
        onKeyDown={selectedType.container ? this.onKeyDown : undefined}
      >
        <Box background="dark-1" height="100vh" border="right">
          <Box flex={false} border="bottom" pad={{ vertical: 'small' }}>
            <Menu
              label={design.name || 'design'}
              dropBackground="brand"
              items={[
                { label: 'Rename', onClick: () => this.setState({ rename: true }) },
                { label: 'Theme', onClick: () => this.setState({ changeTheme: true }) },
                { label: 'Data', onClick: () => this.setState({ editData: true }) },
                { label: 'Publish', onClick: () => this.setState({ publish: true }) },
                { label: 'Code', onClick: () => this.setState({ code: true }) },
                { label: 'Duplicate', onClick: this.onDuplicate },
                { label: 'Designs', onClick: () => this.setState({ chooseDesign: true }) },
                {
                  label: 'Export',
                  title: 'Export design to a file',
                  href: `data:application/json;charset=utf-8,${JSON.stringify(design)}`,
                  download: `${design.name}.json`,
                },
                { label: 'Import', onClick: () => this.setState({ importFile: true }) },
                { label: 'Reset', onClick: () =>
                  design.modified ? this.setState({ confirmReset: true }) : this.onReset()
                },
              ]}
            />
            {this.renderAction()}
          </Box>
          <Box flex overflow="auto">
            <Box flex={false}>
              {design.screenOrder.map((sId, index) =>
                  this.renderScreen(parseInt(sId, 10), index === 0))}
            </Box>
          </Box>
          <Box 
            flex={false}
            direction="row"
            justify="between"
            align="center"
            pad="small"
            border="top"
          >
            <Box direction="row">
              <ActionButton
                title="undo last change"
                icon={<Undo />}
                disabled={!onUndo}
                onClick={onUndo || undefined}
              />
              <ActionButton
                title="redo last change"
                icon={<Redo />}
                disabled={!onRedo}
                onClick={onRedo || undefined}
              />
            </Box>
            <ActionButton
              title="add a component"
              icon={<Add />}
              onClick={() => this.setState({ adding: true })}
            />
          </Box>
          
        </Box>
      </Keyboard>
    );
  }
}

export default Tree;
