import React from 'react';
import ReactGA from 'react-ga';
import {
  Box,
  Button,
  Form,
  FormField,
  Grid,
  Heading,
  Markdown,
  MaskedInput,
  Paragraph,
  Text,
  TextArea,
  TextInput,
} from 'grommet';
import { CloudUpload, Copy, Code, Download } from 'grommet-icons';
import { dependencies, generateJSX, publish } from '../design';
import Action from '../components/Action';

const Summary = ({ Icon, label, guidance }) => (
  <Box align="center" gap="small" margin={{ top: 'medium' }}>
    <Icon size="large" />
    <Heading level={3} margin="none">
      {label}
    </Heading>
    <Paragraph textAlign="center">{guidance}</Paragraph>
  </Box>
);

const Publish = ({ design, setDesign }) => {
  const [publication, setPublication] = React.useState();
  const [publishing, setPublishing] = React.useState();
  const [message, setMessage] = React.useState();
  const [error, setError] = React.useState();
  const previewRef = React.useRef();
  const commentRef = React.useRef();

  React.useEffect(() => {
    let stored = localStorage.getItem(`${design.name}--identity`);
    if (stored) {
      const identity = JSON.parse(stored);
      setPublication({ ...identity, name: design.name });
    } else {
      stored = localStorage.getItem('identity');
      if (stored) {
        const identity = JSON.parse(stored);
        setPublication({ ...identity, name: design.name });
      } else {
        setPublication({ name: design.name });
      }
    }
  }, [design]);

  const onPublish = ({ value: { email, password, pin } }) => {
    // remember email and pin in local storage so we can use later
    localStorage.setItem(
      `${design.name}--identity`,
      JSON.stringify({ email, pin }),
    );
    localStorage.setItem('identity', JSON.stringify({ email, pin }));
    setPublishing(true);
    publish({
      design,
      email,
      password,
      pin,
      onChange: nextDesign => {
        setPublishing(false);
        setDesign(nextDesign);
        ReactGA.event({
          category: 'share',
          action: 'publish design',
        });
      },
      onError: error => {
        setPublishing(false);
        setError(error);
      },
    });
  };

  return (
    <Box>
      <Summary
        Icon={CloudUpload}
        label="Publish"
        guidance={`
        Publishing your design will generate a URL
        that you can send to others so they can see it.
        We use your email and PIN # so nobody else can modify your copy.
        They will be able to create their own design based on it.
      `}
      />
      <Form
        value={publication}
        onChange={({ value }) => setPublication(value)}
        onSubmit={onPublish}
      >
        <FormField
          name="email"
          label="Email"
          required
          validate={{ regexp: /\w+@\w+\.\w+/ }}
        >
          <TextInput name="email" />
        </FormField>
        <FormField
          name="pin"
          label="PIN to change"
          required
          validate={{ regexp: /\d{3}/, message: 'three digits' }}
          error={error}
        >
          <MaskedInput
            name="pin"
            type="password"
            mask={[
              {
                length: 3,
                regexp: /^\d{1,3}$/,
                placeholder: '###',
              },
            ]}
          />
        </FormField>
        <FormField name="password" label="Password to see" help="optional">
          <TextInput name="password" type="password" />
        </FormField>
        <Box align="center" margin="medium">
          <Button type="submit" label="Publish" disabled={publishing} />
        </Box>
      </Form>
      {publishing && (
        <Box alignSelf="center" animation="pulse">
          <Text size="large">...</Text>
        </Box>
      )}
      {design.date && (
        <Box margin="small" align="center">
          <Text size="small" color="text-xweak">
            Last published {new Date(design.date).toLocaleString()}
          </Text>
        </Box>
      )}
      <Grid columns={['auto', 'flex', 'auto']} gap="small" align="center">
        {design.publishedUrl && [
          <Text key="l" margin={{ start: 'small' }}>
            preview
          </Text>,
          <TextInput
            key="i"
            ref={previewRef}
            size="small"
            value={design.publishedUrl}
          />,
          <Button
            key="b"
            icon={<Copy />}
            title="Copy URL"
            hoverIndicator
            onClick={() => {
              previewRef.current.select();
              document.execCommand('copy');
              setMessage('copied to clipboard!');
            }}
          />,
        ]}
        {design.publishedUrl &&
          design.id && [
            <Text key="l" margin={{ start: 'small' }}>
              comment
            </Text>,
            <TextInput
              key="i"
              ref={commentRef}
              size="small"
              value={`${design.publishedUrl}&comments=true`}
            />,
            <Button
              key="b"
              icon={<Copy />}
              title="Copy URL"
              hoverIndicator
              onClick={() => {
                commentRef.current.select();
                document.execCommand('copy');
                setMessage('copied to clipboard!');
              }}
            />,
          ]}
      </Grid>
      {message && (
        <Box margin="small" align="center">
          <Text>{message}</Text>
        </Box>
      )}
    </Box>
  );
};

const SaveLocally = ({ design, onClose }) => (
  <Box align="center">
    <Summary
      Icon={Download}
      label="Download"
      guidance={`
      Download the design to a JSON file. You can use this as a separate
      backup copy, inspect and transform it with a program, or share
      it with someone else. You can upload it via the top left control
      that shows all of your designs.
    `}
    />
    <Button
      label="Download"
      hoverIndicator
      href={`data:application/json;charset=utf-8,${JSON.stringify(design)}`}
      download={`${design.name || 'design'}.json`}
      onClick={() => {
        onClose();
        ReactGA.event({
          category: 'share',
          action: 'download design',
        });
      }}
    />
  </Box>
);

const Developer = ({ design, imports, theme }) => {
  const [code, setCode] = React.useState();

  return (
    <Box align="center">
      <Summary
        Icon={Code}
        label="Generate Code"
        guidance={`
        Turn your design into real code that you can use to create a live site.
        While some development knowledge is required, we will give you some
        guidance to get you started.
      `}
      />
      {!code && (
        <Button
          label="Generate Code"
          hoverIndicator
          onClick={() => {
            setCode(generateJSX({ design, imports, theme }));
            ReactGA.event({
              category: 'share',
              action: 'generate code',
            });
          }}
        />
      )}
      {code && (
        <Box>
          <Markdown>
            {`
* install nodejs, npm, yarn, and create-react-app (if needed)
* \`# npx create-react-app my-app\`
* \`# cd my-app\`
* \`# yarn add ${dependencies(design).join(' ')}\`
* replace the contents of \`src/App.js\` with the text below
* \`# yarn start\`
            `}
          </Markdown>
          <TextArea value={code} rows={20} cols={40} readOnly />
        </Box>
      )}
    </Box>
  );
};

const Share = ({ design, imports, theme, onClose, setDesign }) => (
  <Action label="share" full="horizontal" animation="fadeIn" onClose={onClose}>
    <Grid
      fill="horizontal"
      columns={{ count: 'fit', size: 'small' }}
      gap="large"
    >
      <Publish design={design} setDesign={setDesign} />
      <SaveLocally design={design} onClose={onClose} />
      <Developer design={design} imports={imports} theme={theme} />
    </Grid>
  </Action>
);

export default Share;
