import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import React from 'react';

export default class Page extends React.Component {
  render() {
    const { children, text } = this.props;
    return <Container maxWidth="sm">
      <Typography variant="h4">Messaging Auth Prototype</Typography>
      {text && <Typography variant="body1">{text}</Typography>}
      {children}
    </Container>;
  }
}
