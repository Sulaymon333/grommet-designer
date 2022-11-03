import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
// import ReactGA from 'react-ga';
import { Box, Grid, Keyboard, Notification, ResponsiveContext } from 'grommet';
import AppContext from './AppContext';
import SelectionContext from './SelectionContext';
import ErrorCatcher from './ErrorCatcher';
import NewScreen from './NewScreen';
import Canvas from './Canvas2';
import Data from './Data';
import Loading from './Loading';
import Auth from './Auth';
import Properties from './Properties/Properties';
import Tree from './Tree/Tree';
// import Comments from './Comments/Comments';
import {
  load as loadDesign,
  getAncestors,
  getComponent,
  getLocationForPath,
  getPathForLocation,
  getRoot,
  getScreen,
  getType,
  isValidId,
  setProblem,
  setProperty,
  uncollapseAncestors,
  useDesignSummary,
  useProblem,
  useScreen,
} from './design2';
import ScreenDetails from './Properties/ScreenDetails';
import { parseUrlParams, pushPath, pushUrl } from './utils';

const editGridColumns = [
  ['small', 'medium'],
  ['1/2', 'flex'],
  ['small', 'medium'],
];

const commentGridColumns = [
  ['1/2', 'flex'],
  ['small', 'medium'],
];

const Designer = ({ loadProps: loadPropsProp, onClose, thumb }) => {
  const { grommetThemeMode, setThemeMode } = useContext(AppContext);
  const responsive = useContext(ResponsiveContext);
  const [loadProps, setLoadProps] = useState(loadPropsProp);
  const [auth, setAuth] = useState();
  const [ready, setReady] = useState(false);
  const [location, setLocation] = useState();
  const [selection, setSelection] = useState();
  const [mode, setMode] = useState(thumb ? 'thumb' : undefined);
  const problem = useProblem();

  // when the document name changes, update title and URL
  const summary = useDesignSummary();

  useEffect(() => {
    if (summary.local && summary.name) {
      document.title = summary.name;
      const url = `${window.location.pathname}?name=${encodeURIComponent(
        summary.name,
      )}`;
      window.history.replaceState(undefined, undefined, url);
    }
  }, [summary]);

  // load design when we start

  useEffect(() => {
    loadDesign(loadProps)
      .then((design) => {
        if (!thumb) {
          // initialize selection, location, and mode
          const params = parseUrlParams(window.location.search);
          const paramSelection =
            params.selection && parseInt(params.selection, 10);
          const stored = localStorage.getItem(`${design.name}--state`);
          // don't use stored state if loading from remote id
          if (!loadProps.id && stored) {
            const savedState = JSON.parse(stored);
            setMode(params.mode || savedState.mode);
            const nextSelection = paramSelection || savedState.selection;
            if (isValidId(nextSelection)) setSelection(nextSelection);
            if (paramSelection) {
              const root = getRoot(paramSelection);
              const path = getScreen(root).path;
              setLocation(getLocationForPath(path));
            } else setLocation(savedState.location);
          } else {
            setMode(params.mode || (loadProps.id && 'preview') || 'edit');
            if (loadProps.location)
              setLocation(getLocationForPath(loadProps.location));
            else setLocation(getLocationForPath(window.location.pathname));
            if (paramSelection || loadProps.selection)
              setSelection(paramSelection || loadProps.selection);
          }
        }
        return design;
      })
      .then(() => setReady(true))
      .catch((e) => {
        // need to prompt user for password?
        if (e.message === '401') setAuth(true);
        else if (e.message === '404') onClose();
        else throw e;
      });
    return () => setReady(false);
  }, [loadProps, onClose, thumb]);

  // browser navigation

  // following a link changes component hide or screen path
  const followLink = useCallback(
    (link) => {
      if (link) {
        if (Array.isArray(link)) link.forEach(followLink);
        else if (link.control === 'toggleThemeMode') {
          setThemeMode(grommetThemeMode === 'dark' ? 'light' : 'dark');
        } else if (link.component) {
          const component = getComponent(link.component);
          const type = getType(component.type);
          if (type.selectable && type.follow) {
            type.follow(component.props, { component });
          }
          if (type.hideable) {
            setProperty(link.component, undefined, 'hide', !component.hide);
            if (!component.hide) setSelection(undefined);
          }
        } else if (link.screen) {
          setLocation({ screen: link.screen });
          // delay so any click handler setting selection finishes first
          setTimeout(() => setSelection(link.screen), 1);
        }
      }
    },
    [grommetThemeMode, setThemeMode],
  );

  const unfollowLink = useCallback((link) => {
    if (link) {
      if (Array.isArray(link)) link.forEach(unfollowLink);
      else if (link.component) {
        const component = getComponent(link.component);
        const type = getType(component.type);
        if (type.hideable) setProperty(link.component, undefined, 'hide', true);
      }
    }
  }, []);

  const followLinkOption = useCallback(
    (link, value) => {
      const hasValue = (Array.isArray(value) && value.length) || value;

      // divide links into what we should unfollow and what we should follow
      const unfollow = [];
      const follow = [];
      Object.keys(link)
        .filter((n) => link[n])
        .forEach((name) => {
          const inValue =
            (Array.isArray(value) && value.includes(name)) || value === name;
          if (
            ((name === '-unchecked-' || name === '-none-') && hasValue) ||
            ((name === '-checked-' || name === '-any-' || name === '-both-') &&
              !hasValue) ||
            (name[0] !== '-' && !inValue)
          )
            unfollow.push(link[name]);
          else if (
            ((name === '-unchecked-' || name === '-none-') && !hasValue) ||
            ((name === '-checked-' || name === '-any-' || name === '-both-') &&
              hasValue) ||
            (name[0] !== '-' && inValue)
          )
            follow.push(link[name]);
        });

      // unfollow first
      unfollow.forEach(unfollowLink);
      // then follow
      follow.forEach(followLink);
    },
    [followLink, unfollowLink],
  );

  // when user uses browser back and forward buttons,
  // clear selection and set path
  useEffect(() => {
    const onPopState = () => {
      setLocation(getLocationForPath(window.location.pathname));
      setSelection(undefined);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (location) {
      let nextPath = getPathForLocation(location);
      if (nextPath !== window.location.pathname) {
        // track location in browser location, so browser
        // backward/forward controls work
        pushPath(nextPath);
      }
    }
  }, [location]);

  // store mode and selection state if they change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!thumb && mode && selection) {
        localStorage.setItem(
          `${summary.name}--state`,
          JSON.stringify({ location, mode, selection }),
        );
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [location, mode, selection, summary.name, thumb]);

  const onKey = useCallback(
    (event) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === 'e' || event.key === 'E' || event.key === '.') {
          event.preventDefault();
          setMode(mode !== 'edit' ? 'edit' : 'preview');
        } else if (event.key === ';') {
          event.preventDefault();
          setMode(mode !== 'comments' ? 'comments' : 'preview');
        }
      }
    },
    [mode],
  );

  // we do this so we can detect when the root of the screen changes
  const screen = useScreen(location?.screen);

  const [treeRoot, canvasRoot] = useMemo(() => {
    if (!location) return [];
    if (location.screen && screen) return [undefined, screen.root];
    if (location.property) {
      const { id, value, ...rest } = location.property;
      return [{ id, value, ...rest }, value];
    }
    return [];
  }, [location, screen]);

  const selectionPath = useMemo(() => getAncestors(selection), [selection]);

  useEffect(
    // don't un-collapse the selection itself
    () => uncollapseAncestors(selectionPath.filter((id) => id !== selection)),
    [selection, selectionPath],
  );

  const selectionContext = useMemo(
    () =>
      mode === 'edit'
        ? [
            selection,
            setSelection,
            { followLink, followLinkOption, setLocation, selectionPath },
          ]
        : [undefined, undefined, { followLink, followLinkOption }],
    [followLink, followLinkOption, mode, selection, selectionPath],
  );

  if (auth)
    return (
      <Auth
        onCancel={onClose}
        onChange={(password) => {
          setLoadProps({ ...loadProps, password });
          setAuth(false);
        }}
      />
    );
  if (!ready) return <Loading />;

  // console.log('!!! Designer', { location, selection, treeRoot, canvasRoot });

  const Details =
    selection && ((getScreen(selection) && ScreenDetails) || Properties);

  let content;
  if (canvasRoot || treeRoot)
    content = (
      <ErrorCatcher>
        <Canvas root={treeRoot?.value || canvasRoot} />
      </ErrorCatcher>
    );
  else if (getScreen(selection)) content = <NewScreen />;
  else if (selection) content = <Data id={selection} />;

  if (!thumb && responsive !== 'small') {
    if (mode === 'edit') {
      content = (
        <Grid columns={editGridColumns}>
          <Tree
            root={treeRoot}
            setMode={setMode}
            onClose={() => {
              pushUrl('/');
              onClose();
            }}
          />
          <Box height="100vh" overflow="auto">
            {content}
          </Box>
          {Details && <Details />}
        </Grid>
      );
    } else if (mode === 'comments') {
      content = (
        <Grid columns={commentGridColumns}>
          <Box height="100vh" overflow="auto">
            {content}
          </Box>
          {/* <Comments /> */}
        </Grid>
      );
    }
  }

  if (problem) {
    content = (
      <Grid columns="auto" rows={['auto', 'flex']}>
        <Notification
          status="warning"
          message={problem}
          onClose={() => setProblem()}
        />
        {content}
      </Grid>
    );
  }

  // if (/* confirmReplace || */ (responsive !== 'small' && mode !== 'preview')) {
  //   content = (
  //     <Grid columns={columns}>
  //       {mode === 'edit' && <Tree />}

  //       <Box height="100vh" overflow="auto">
  //         {content}
  //       </Box>

  //       {responsive !== 'small' && mode !== 'preview' && (
  //         <Box height="100vh">
  //           {(mode === 'comments' && <Comments />) ||
  //             (selectedComponent && <Properties />) ||
  //             (selected.screen && <ScreenDetails />)}
  //         </Box>
  //       )}
  //       {/* {confirmReplace && (
  //         <ConfirmReplace
  //           design={design}
  //           nextDesign={confirmReplace}
  //           onDone={(nextDesign) => {
  //             if (nextDesign) updateDesign(nextDesign);
  //             setConfirmReplace(undefined);
  //           }}
  //         />
  //       )} */}
  //     </Grid>
  //   );
  // }

  return (
    <Keyboard target="document" onKeyDown={onKey}>
      <SelectionContext.Provider value={selectionContext}>
        {content}
      </SelectionContext.Provider>
    </Keyboard>
  );
};

export default Designer;
