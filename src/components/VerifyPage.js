import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import React from 'react';
import { checkToken, compareFingerprint } from '../oidc/vfy';
import Persist from '../util/storage';
import Page from './Page';
import ToClipboard from './ToClipboard';

const STATUS = {
  VERIFYING: 0,
  VERIFIED: 1,
  FAILED: 2,
  INVALID: 3,
};

export default class VerifyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { status: STATUS.VERIFYING };
  }

  componentDidMount() {
    const { params } = this.props;
    const alg = params.get('alg');
    const fp = params.get('fp');
    const id_token = params.get('id_token');
    const rounds = params.get('rounds');
    const salt = params.get('salt');

    // Is any value null?
    if (alg && fp && id_token && rounds && salt === null) {
      this.setState({ status: STATUS.INVALID });
    }

    checkToken(id_token).then(({ payload, hash, provider, nonce }) => {
      return Promise.all([
        Promise.resolve(payload),
        Promise.resolve(provider.name),
        Promise.resolve(nonce),
        compareFingerprint(alg, rounds, salt, hash, fp),
      ]);
    }).then(([ payload, providerName, nonce ]) => {
      // If we're still here, compare succeeded.
      this.setState({ status: STATUS.VERIFIED, email: payload.email, fp, provider: providerName, nonce });
    }).catch((err) => {
      console.error(err);
      this.setState({ status: STATUS.FAILED, errMsg: err.message });
    });
  }

  render() {
    let coreComponent;
    const { status } = this.state;
    switch (status) {
      case STATUS.VERIFIED:
        const { email, fp, provider, nonce } = this.state;
        coreComponent = <Stack spacing={2}>
          <Alert severity="success">User <strong>{email}</strong> verified their identity to you using <strong>{provider}</strong>. This is their key fingerprint:</Alert>
          {Persist.knowsNonce(nonce) && <Alert severity="warning">You are viewing your own request!</Alert>}
          <ToClipboard text={fp} />
        </Stack>;
        break;
      case STATUS.FAILED:
        const { errMsg } = this.state;
        coreComponent = <Alert severity="error">{errMsg}</Alert>;
        break;
      case STATUS.INVALID:
        coreComponent = <Alert severity="error">Invalid request.</Alert>;
        break;
      default:
        coreComponent = <CircularProgress />;
    }

    return <Page>
      <Box sx={{ p: 2 }}>
        {coreComponent}
      </Box>
    </Page>;
  }
}
