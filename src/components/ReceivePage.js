import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { checkToken } from '../oidc/vfy';
import { BASE_URL, VERIFY_PATH } from '../util/consts';
import Persist from '../util/storage';
import Page from './Page';
import ToClipboard from './ToClipboard';

const STATUS = {
  VERIFYING: 0,
  VERIFIED: 1,
  FAILED: 2,
  INVALID: 3,
};

export default class ReceivePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { status: STATUS.VERIFYING };
    this.provider = props.provider;
  }

  componentDidMount() {
    const { params } = this.props;
    if (!params.has('code')) {
      this.setState({ status: STATUS.INVALID });
      return;
    }

    const code = params.get('code');
    const { code_verifier, iss, nonce, hashInfo } = Persist.latestRequest;
    Persist.latestRequest = {};

    if (params.get('state') !== nonce) {
      this.setState({
        status: STATUS.FAILED,
        errMsg: 'Missing or wrong state parameter'
      });
      return;
    }

    if (this.provider.issuer !== iss) {
      this.setState({
        status: STATUS.FAILED,
        errMsg: 'Wrong redirect URL',
      });
      return;
    }

    this.provider.token_endpoint.then((token_endpoint) => fetch(token_endpoint, {
      method: 'POST',
      body: new URLSearchParams({
        code, code_verifier,
        grant_type: 'authorization_code',
        redirect_uri: this.provider.redirect_uri,
        client_id: this.provider.client_id,
      }),
    })).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(
          `Token response not okay (${response.status} ${response.statusText})`
        );
      }
    }).then((body) => {
      if ('id_token' in body) {
        return checkToken(body.id_token, iss, nonce)
      } else {
        throw new Error('Token request response does not contain id_token');
      }
    }).then(({ id_token }) => {
      Persist.rememberNonce(nonce);
      this.setState({ status: STATUS.VERIFIED, ...hashInfo, id_token });
    }).catch((err) => {
      console.error(err);
      this.setState({ status: STATUS.FAILED, errMsg: err.message });
    });
  }

  render() {
    let text, coreComponent;
    const { status } = this.state;
    switch (status) {
      case STATUS.VERIFIED:
        text = 'Success! You can forward this token to your chat partner.';

        const { alg, fp, id_token, rounds, salt } = this.state;
        const params = new URLSearchParams({ alg, fp, id_token, rounds, salt });
        const url = `${BASE_URL}/${VERIFY_PATH}?${params.toString()}`;
        coreComponent = <ToClipboard noWrap text={url} />;
        break;
      case STATUS.FAILED:
        const { errMsg } = this.state;
        coreComponent = <Alert severity="error">{errMsg}</Alert>;
        break;
      case STATUS.INVALID:
        coreComponent = <Alert severity="error">Incomplete request</Alert>;
        break;
      default:
        text = 'Token received! Verifying...';
        coreComponent = <CircularProgress />;
    }

    return <Page text={text}>
      <Box sx={{ p: 2 }}>
        {coreComponent}
      </Box>
    </Page>;
  }
}
