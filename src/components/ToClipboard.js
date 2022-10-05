import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import React from 'react';

function toClipboard(text) {
  const type = 'text/plain';
  const blob = new Blob([text], { type });
  return navigator.clipboard.write([ new window.ClipboardItem({ [type]: blob }) ]);
}

export default class ToClipboard extends React.Component {
  render() {
    const { text, noWrap } = this.props;
    const cp = () => toClipboard(text);
    return <Paper sx={{ p: 2, display: 'flex', alignContent: 'center', justifyContent: 'center' }} elevation={3}>
      <Grid container spacing={1}>
          <Grid item xs={11} sx={{ m: 'auto' }}>
            <Typography noWrap={noWrap} variant="body2" onClick={cp}>{text}</Typography>
          </Grid>
          <Grid item xs={1} sx={{ m: 'auto' }}>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={cp}><ContentPasteIcon /></IconButton>
            </Tooltip>
          </Grid>
        </Grid>
    </Paper>;
  }
}
