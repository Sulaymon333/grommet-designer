import React from 'react';
import ReactGA from 'react-ga';
import { Grommet, Grid, Keyboard, ResponsiveContext, grommet } from 'grommet';
import ErrorCatcher from './ErrorCatcher';
import Canvas from './Canvas';
import Properties from './Properties/Properties';
import Tree from './Tree/Tree';
import {
  getInitialSelected,
  getScreenByPath,
  setupDesign,
  loading,
} from './design';
import ScreenDetails from './Properties/ScreenDetails';
import designerLibrary from './libraries/designer';
import grommetLibrary from './libraries/grommet';
import { loadDesign, loadLibraries, loadTheme } from './design/load';

const designerTheme = {
  ...grommet,
  global: {
    ...grommet.global,
    colors: { background: { dark: '#282828', light: '#f8f8f8' } },
  },
};

const getParams = () => {
  const { location } = window;
  const params = {};
  location.search
    .slice(1)
    .split('&')
    .forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v);
    });
  return params;
};

const App = () => {
  const responsive = React.useContext(ResponsiveContext);
  // In the worst case, we need to load a published design, a published theme,
  // a base design, and any libraries. We load theme as we go into the 'load'
  // state. When they're all ready, we update all of the necessary states.
  const [load, setLoad] = React.useState({});
  const [design, setDesign] = React.useState(setupDesign(loading));
  const [selected, setSelected] = React.useState(getInitialSelected(design));
  const [base, setBase] = React.useState();
  const [theme, setTheme] = React.useState(grommet);
  const [colorMode, setColorMode] = React.useState('dark');
  const [rtl, setRTL] = React.useState();
  const [preview, setPreview] = React.useState(true);
  const [changes, setChanges] = React.useState([]);
  const [changeIndex, setChangeIndex] = React.useState();
  const [designs, setDesigns] = React.useState([]);
  const [libraries, setLibraries] = React.useState([
    grommetLibrary,
    designerLibrary,
  ]);
  const selectedComponent = React.useMemo(
    () =>
      selected.component ? design.components[selected.component] : undefined,
    [design, selected],
  );

  // initialize analytics
  React.useEffect(() => {
    if (window.location.host !== 'localhost') {
      const {
        location: { pathname },
      } = window;
      ReactGA.initialize('UA-99690204-4');
      ReactGA.pageview(pathname);
    }
  }, []);

  // load initial design
  React.useEffect(() => {
    const {
      location: { pathname },
    } = window;
    const params = getParams();
    loadDesign(
      pathname === '/_new' ? '_new' : params.id,
      nextDesign => {
        let nextSelected;
        if (params.id) {
          const screen =
            (pathname && getScreenByPath(nextDesign, pathname)) ||
            nextDesign.screenOrder[0];
          nextSelected = { screen };
        } else {
          const stored = localStorage.getItem('selected');
          if (stored) nextSelected = JSON.parse(stored);
          else {
            const screen =
              pathname && pathname !== '/_new'
                ? getScreenByPath(nextDesign, pathname)
                : nextDesign.screenOrder[0];
            const component = nextDesign.screens[screen].root;
            nextSelected = { screen, component };
          }
        }
        setLoad(prevLoad => ({
          ...prevLoad,
          design: nextDesign,
          selected: nextSelected,
        }));

        loadTheme(nextDesign.theme, nextTheme => {
          setLoad(prevLoad => ({ ...prevLoad, theme: nextTheme }));
        });

        if (nextDesign.base) {
          const id = nextDesign.base.split('id=')[1];
          loadDesign(id, nextBase => {
            setLoad(prevLoad => ({ ...prevLoad, base: nextBase }));
          });
        } else {
          setLoad(prevLoad => ({ ...prevLoad, base: true }));
        }

        loadLibraries(nextDesign.library, nextLibraries => {
          setLoad(prevLoad => ({ ...prevLoad, libraries: nextLibraries }));
        });
      },
      true,
    );
  }, []);

  // finish loading
  React.useEffect(() => {
    if (
      load &&
      load.design &&
      load.selected &&
      load.theme &&
      load.base &&
      load.libraries
    ) {
      const params = getParams();
      if (load.base && load.base !== true) setBase(load.base);
      setLibraries(prevLibraries => [...load.libraries, ...prevLibraries]);
      setTheme(load.theme);
      setDesign(load.design);
      setSelected(load.selected);
      setPreview(!!params.id);
      setChanges([{ design: load.design, selected: load.selected }]);
      setChangeIndex(0);
      setLoad(undefined);
    }
  }, [load]);

  React.useEffect(() => {
    const stored = localStorage.getItem('designs');
    if (stored) setDesigns(JSON.parse(stored));
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem('colorMode');
    if (stored) setColorMode(stored);
    else if (window.matchMedia) {
      setColorMode(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      );
    }
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem('preview');
    if (stored) setPreview(JSON.parse(stored));
  }, []);

  // browser navigation

  // react when user uses browser back and forward buttons
  React.useEffect(() => {
    const onPopState = () => {
      const {
        location: { pathname },
      } = document;
      const screen = getScreenByPath(design, pathname);
      if (screen)
        setSelected({ screen, component: design.screens[screen].root });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [design]);

  // push state when the user navigates
  React.useEffect(() => {
    if (!load) {
      const {
        location: { pathname },
      } = document;
      // track selected screen in browser location, so browser
      // backward/forward controls work
      const screen = design.screens[selected.screen];
      if (screen && screen.path !== pathname) {
        window.history.pushState(undefined, undefined, screen.path);
      }
    }
  }, [design, load, selected.screen]);

  // store design
  React.useEffect(() => {
    if (!load) {
      // do this stuff lazily, so we don't bog down the UI
      const timer = setTimeout(() => {
        document.title = design.name;

        localStorage.setItem(design.name, JSON.stringify(design));
        localStorage.setItem('activeDesign', design.name);

        if (!designs.includes(design.name)) {
          const nextDesigns = [design.name, ...designs];
          localStorage.setItem('designs', JSON.stringify(nextDesigns));
          setDesigns(nextDesigns);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [design, designs, load]);

  // update libraries
  React.useEffect(() => {
    if (!load) {
      loadLibraries(design.library, nextLibraries =>
        setLibraries(prevLibraries => [...nextLibraries, ...prevLibraries]),
      );
    }
  }, [design.library, load]);

  // update base
  React.useEffect(() => {
    if (!load) {
      if (design.base && !base) {
        const id = design.base.split('id=')[1];
        loadDesign(id, setBase);
      } else if (base && !design.base) {
        setBase(undefined);
      }
    }
  }, [base, design.base, load]);

  // update theme
  React.useEffect(() => {
    if (!load) loadTheme(design.theme, setTheme);
  }, [design.theme, load]);

  // store selected
  React.useEffect(() => {
    localStorage.setItem('selected', JSON.stringify(selected));
  }, [selected]);

  // add to changes, if needed
  React.useEffect(() => {
    if (!load) {
      // do this stuff lazily to ride out typing sprees
      const timer = setTimeout(() => {
        // If we already have this design object, we must be doing an undo or
        // redo, and therefore no need to add a change
        if (!changes.some(c => c.design === design)) {
          let nextChanges;
          nextChanges = [...changes];
          nextChanges = nextChanges.slice(changeIndex, 10);
          nextChanges.unshift({ design, selected });
          setChanges(nextChanges);
          setChangeIndex(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [changes, changeIndex, design, load, selected]);

  // persist preview state when it changes
  React.useEffect(() => {
    localStorage.setItem('preview', JSON.stringify(preview));
    // trigger resize so rendered elements can respond accordingly
    window.dispatchEvent(new Event('resize'));
  }, [preview]);

  // set body editing class when preview changes, so we can use some
  // custom CSS for Layer. Yes, this is a bit of a hack :(
  React.useEffect(() => {
    if (preview) {
      document.body.classList.remove('editing');
    } else {
      document.body.classList.add('editing');
    }
  }, [preview]);

  const onKey = React.useCallback(
    event => {
      if (event.metaKey) {
        if (event.key === 'e' || event.key === 'E') {
          event.preventDefault();
          setPreview(!preview);
        }
      }
    },
    [preview],
  );

  const onUndo = React.useCallback(() => {
    const nextChangeIndex = Math.min(changeIndex + 1, changes.length - 1);
    const { design: nextDesign, selected: nextSelected } = changes[
      nextChangeIndex
    ];
    setDesign(nextDesign);
    setSelected(nextSelected);
    setChangeIndex(nextChangeIndex);
  }, [changes, changeIndex]);

  const onRedo = React.useCallback(() => {
    const nextChangeIndex = Math.max(changeIndex - 1, 0);
    const { design: nextDesign, selected: nextSelected } = changes[
      nextChangeIndex
    ];
    setDesign(nextDesign);
    setSelected(nextSelected);
    setChangeIndex(nextChangeIndex);
  }, [changes, changeIndex]);

  return (
    <Grommet
      full
      theme={designerTheme}
      themeMode={colorMode}
      dir={rtl ? 'rtl' : undefined}
    >
      <Keyboard target="document" onKeyDown={onKey}>
        <Grid
          fill
          columns={
            responsive === 'small' || preview
              ? 'flex'
              : [
                  ['small', 'medium'],
                  ['1/2', 'flex'],
                  ['small', 'medium'],
                ]
          }
        >
          {responsive !== 'small' && !preview && (
            <Tree
              design={design}
              libraries={libraries}
              base={base}
              rtl={rtl}
              selected={selected}
              theme={theme}
              colorMode={colorMode}
              setColorMode={setColorMode}
              setDesign={setDesign}
              setRTL={setRTL}
              setSelected={setSelected}
              onRedo={changeIndex > 0 && onRedo}
              onUndo={changeIndex < changes.length - 1 && onUndo}
            />
          )}

          <ErrorCatcher>
            <Canvas
              design={design}
              libraries={libraries}
              selected={selected}
              preview={preview}
              setDesign={setDesign}
              setSelected={setSelected}
              theme={theme}
            />
          </ErrorCatcher>

          {responsive !== 'small' &&
            !preview &&
            (!selectedComponent ? (
              <ScreenDetails
                design={design}
                selected={selected}
                setDesign={setDesign}
                setSelected={setSelected}
              />
            ) : (
              <Properties
                design={design}
                libraries={libraries}
                theme={theme}
                selected={selected}
                component={selectedComponent}
                setDesign={setDesign}
                setSelected={setSelected}
              />
            ))}
        </Grid>
      </Keyboard>
    </Grommet>
  );
};

export default App;
