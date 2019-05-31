import React, { Component, Fragment } from 'react';
import {
  Box, Button, Heading, Layer, Markdown, Text, TextArea, TextInput
} from 'grommet';
import { Close, CloudUpload, Copy, Code, Download } from 'grommet-icons';
// import LZString from 'lz-string';
import { bucketPostUrl, bucketKey, generateJSX } from './designs';

export default class Share extends Component {

  state = {};

  ref = React.createRef();

  onCopy = () => {
    this.ref.current.select();
    document.execCommand('copy');
    this.setState({ message: 'copied to clipboard!'});
  }

  render() {
    const { design, onClose } = this.props;
    const { code, message, uploadUrl } = this.state;
    // const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(design));
    // const url = `${window.location.href.split('?')[0]}?preview=true&d=${encoded}`;
    return (
      <Layer onEsc={onClose}>
        <Box pad="medium" gap="medium">
          <Box direction="row" gap="medium" align="center" justify="between">
            <Heading level={2} margin="none">
              Share
            </Heading>
            <Button icon={<Close />} hoverIndicator onClick={onClose} />
          </Box>
          {/* }
          <Heading level={3} margin="none">Browser</Heading>
          <Box>
            <Box direction="row">
              <TextInput ref={this.ref} value={url} />
              <Button
                icon={<Copy />}
                title="Copy URL"
                hoverIndicator
                onClick={this.onCopy}
              />
            </Box>
            <Box>
              <Text textAlign="end">{message}&nbsp;</Text>
            </Box>
          </Box>
          { */}
          <Box direction="row" align="center" justify="between" gap="medium">
            <Heading level={3} margin="none">Publish</Heading>
            <Button
              icon={<CloudUpload />}
              title="Publish Design"
              hoverIndicator
              onClick={() => {
                const name = encodeURIComponent(`${design.name || 'd'}-${(new Date()).toISOString()}`);
                const body = JSON.stringify(design);
                fetch(
                  `${bucketPostUrl}?uploadType=media&name=${name}&${bucketKey}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/javascript; charset=UTF-8',
                      'Content-Length': body.length,
                    },
                    body,
                  },
                )
                .then((response) => {
                  if (response.ok) {
                    const uploadUrl =
                      `${window.location.href.split('?')[0]}?preview=true&n=${name}`;
                    this.setState({ uploadUrl });
                  }
                });
              }}
            />
          </Box>
          {uploadUrl && (
            <Fragment>
              <Box direction="row">
                <TextInput ref={this.ref} value={uploadUrl} />
                <Button
                  icon={<Copy />}
                  title="Copy URL"
                  hoverIndicator
                  onClick={this.onCopy}
                />
              </Box>
              <Box>
                <Text textAlign="end">{message}&nbsp;</Text>
              </Box>
            </Fragment>
          )}
          <Box direction="row" align="center" justify="between" gap="medium">
            <Heading level={3} margin="none">Download</Heading>
            <Button
              icon={<Download />}
              title="Download Design"
              hoverIndicator
              href={`data:application/json;charset=utf-8,${JSON.stringify(design)}`}
              download={`${design.name || 'design'}.json`}
            />
          </Box>
          <Box direction="row" align="center" justify="between" gap="medium">
            <Heading level={3} margin="none">Developer</Heading>
            <Button
              icon={<Code />}
              title="Generate Code"
              hoverIndicator
              onClick={() => this.setState({ code: generateJSX(design) })}
            />
          </Box>
          {code && (
            <Box>
              <Markdown>{`
* install nodejs, npm, yarn, and create-react-app (if needed)
* \`# create-react-app my-app\`
* \`# cd my-app\`
* \`# yarn add grommet grommet-icons styled-components\`
* replace the contents of \`src/App.js\` with the text below
* \`# yarn start\`
                `}
              </Markdown>
              <TextArea value={code} rows={20} cols={40} readOnly />
            </Box>
          )}
        </Box>
      </Layer>
    );
  }
}
