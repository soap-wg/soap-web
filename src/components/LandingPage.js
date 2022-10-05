import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Page from './Page';
import TextField from '@mui/material/TextField';

import getIdToken from '../oidc/flow';
import React from 'react';
import GitLab from '../oidc/GitLab';
import Microsoft from '../oidc/Microsoft';

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fp: undefined };
  }

  render() {
    const { fp } = this.state;

    return <Page text="This page provides an early prototype to verify that you control an account.">
      <Stack spacing={2} sx={{ p: 3 }}>
        <TextField multiline label="Paste fingerprint" variant="outlined"
          onChange={(e) => this.setState({ fp: e.target.value })} />
        <Button style={{justifyContent: 'center'}} variant="contained"
          onClick={() => getIdToken(GitLab, fp)}
        >Request token from GitLab</Button>
        <Button style={{justifyContent: 'center'}} variant="contained"
          onClick={() => getIdToken(Microsoft, fp)}
        >Request token from Microsoft</Button>
      </Stack>
    </Page>;
  }
}
