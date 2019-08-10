import React, { Component } from 'react';
import {
  Box, Button, Heading, Keyboard, Stack, Text,
} from 'grommet';
import { Add, Apps, FormDown, FormNext, Redo, Share, Undo } from 'grommet-icons';
import { types } from '../types';
import {
  childSelected, getParent, getScreen, nextSiblingSelected,
  parentSelected, previousSiblingSelected, isDescendent,
} from '../design';
import ActionButton from '../components/ActionButton';
import AddComponent from './AddComponent';
import DesignSettings from '../DesignSettings';
import Designs from './Designs';
import Sharing from './Share';

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
    // if we're moving within children, promote children first
    if (isDescendent(design, target, dragging)) {
      const component = nextDesign.components[dragging];
      priorParent.children = [...priorParent.children, ...component.children];
      component.children = undefined;
    }
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

  toggleCollapse = (id) => {
    const { design, selected, onChange } = this.props;
    const nextDesign = JSON.parse(JSON.stringify(design));
    const component = nextDesign.components[id];
    component.collapsed = !component.collapsed;
    onChange({ design: nextDesign, selected: { ...selected, component: id } });
  }

  onKey = (event) => {
    const { design, selected, onChange, onUndo, onRedo } = this.props;
    if (document.activeElement === document.body) {
      if (event.key === 'a') {
        this.setState({ adding: true });
      }
      if (event.key === 'ArrowDown') {
        onChange({ selected: (nextSiblingSelected(design, selected) || selected) });
      }
      if (event.key === 'ArrowUp') {
        onChange({ selected: (previousSiblingSelected(design, selected) || selected) });
      }
      if (event.key === 'ArrowLeft') {
        onChange({ selected: (parentSelected(design, selected) || selected) });
      }
      if (event.key === 'ArrowRight') {
        onChange({ selected: (childSelected(design, selected) || selected) });
      }
      if (onUndo && event.key === 'z') {
        onUndo();
      }
      if (onRedo && event.key === 'Z') {
        onRedo();
      }
      if (event.key === 'c') {
        this.toggleCollapse(selected.component);
      }
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
    const collapserColor = { light: 'light-4', dark: 'dark-3' };
    return (
      <Box key={id}>
        {firstChild && this.renderDropArea(id, 'before')}
        <Stack anchor="left">
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
              pad={{ vertical: 'xsmall', left: 'large', right: 'small' }}
              background={
                (dropTarget && dropTarget === id && dropWhere === 'in')
                ? 'accent-2'
                : (selected.component === id ? 'accent-1' : undefined)
              }
            >
              <Text size="medium" truncate>
                {(reference && treeName(reference)) || treeName(component)}
              </Text>
            </Box>
          </Button>
          {component.children && (
            <Button
              icon={component.collapsed
                ? <FormNext color={collapserColor} />
                : <FormDown color={collapserColor} />}
              onClick={() => this.toggleCollapse(id)}
            />
          )}
        </Stack>
        {!component.collapsed && component.children && (
          <Box pad={{ left: 'small' }}>
            {component.children.map((childId, index) =>
              this.renderComponent(screen, childId, index === 0))}
          </Box>
        )}
        {this.renderDropArea(id, 'after')}
      </Box>
    )
  }

  renderScreen = (screenId, firstScreen, onlyScreen) => {
    const { design, selected } = this.props;
    const screen = design.screens[screenId];
    const id = screen.root;
    const component = design.components[id];
    const collapserColor = { light: 'light-4', dark: 'dark-3' };
    return (
      <Box
        key={screen.id}
        flex={false}
        border={firstScreen ? undefined : 'top'}
      >
        {firstScreen && this.renderScreenDropArea(screenId, 'before')}
        <Stack anchor="left">
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
              ref={selected.component === screen.root ? this.selectedRef : undefined}
              direction="row"
              align="center"
              justify="between"
              gap="medium"
              pad={{ vertical: 'small', left: 'large', right: 'small' }}
              background={selected.component === id ? 'accent-1' : undefined}
            >
              <Heading level={3} size="xsmall" margin="none">
                {screen.name || (onlyScreen ? 'Screen' : `Screen ${screen.id}`)}
              </Heading>
            </Box>
          </Button>
          {component.children && (
            <Button
              icon={component.collapsed
                ? <FormNext color={collapserColor} />
                : <FormDown color={collapserColor} />}
              onClick={() => this.toggleCollapse(id)}
            />
          )}
        </Stack>
        {!component.collapsed && component.children && (
          <Box flex={false}>
            {component.children.map((childId, index) =>
              this.renderComponent(screen.id, childId, index === 0))}
          </Box>
        )}
        {this.renderScreenDropArea(screenId, 'after')}
      </Box>
    );
  }

  render() {
    const { colorMode, design, selected, onChange, onUndo, onRedo } = this.props;
    const { adding, choosing, editing, sharing } = this.state;
    return (
      <Keyboard target="document" onKeyDown={this.onKey}>
        <Box
          background={colorMode === 'dark' ? 'dark-1' : 'white'}
          height="100vh"
          border="right"
        >
          <Box flex={false} border="bottom">
            <Box
              flex={false}
              direction="row"
              align="start"
              justify="between"
              border="bottom"
            >
              <ActionButton
                title="choose another design"
                icon={<Apps />}
                onClick={() => this.setState({ choosing: true })}
              />
              {choosing && (
                <Designs
                  design={design}
                  colorMode={colorMode}
                  onChange={onChange}
                  onClose={() => this.setState({ choosing: undefined })}
                />
              )}
              <Box flex alignSelf="stretch">
                <Button
                  fill
                  hoverIndicator
                  onClick={() => this.setState({ editing: true })}
                >
                  <Box fill pad="small">
                    <Heading size="18px" margin="none" truncate>
                      {design.name}
                    </Heading>
                  </Box>
                </Button>
              </Box>
              <ActionButton
                title="share design"
                icon={<Share />}
                onClick={() => this.setState({ sharing: true })}
              />
              {sharing && (
                <Sharing
                  design={design}
                  onChange={onChange}
                  onClose={() => this.setState({ sharing: undefined })}
                />
              )}
            </Box>
            <Box 
              flex={false}
              direction="row"
              justify="between"
              align="center"
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
            {adding && (
              <AddComponent
                design={design}
                selected={selected}
                onChange={onChange}
                onClose={() => this.setState({ adding: false })}
              />
            )}
            {editing && (
              <DesignSettings
                design={design}
                onChange={onChange}
                onClose={() => this.setState({ editing: false })}
              />
            )}
          </Box>

          <Box flex overflow="auto">
            <Box flex={false}>
              {design.screenOrder.map((sId, index) =>
                this.renderScreen(parseInt(sId, 10), index === 0,
                  design.screenOrder.length === 1))}
            </Box>
          </Box>
        </Box>
      </Keyboard>
    );
  }
}

export default Tree;
