import Navigo from 'navigo';
import React from 'react';
import ReactDOM from 'react-dom';

import LandingPage from './components/LandingPage';
import ReceivePage from './components/ReceivePage';
import VerifyPage from './components/VerifyPage';
import GitLab from './oidc/GitLab';
import Microsoft from './oidc/Microsoft';
import { VERIFY_PATH } from './util/consts';

function renderPage(page) {
  ReactDOM.render(
    <React.StrictMode>{page}</React.StrictMode>,
    document.getElementById('root')
  );
}

const router = new Navigo('/');
router.on(() => renderPage(<LandingPage />));
router.on(Microsoft.redirect_path, ({ queryString }) => {
  renderPage(<ReceivePage provider={Microsoft} params={new URLSearchParams(queryString)} />);
});
router.on(GitLab.redirect_path, ({ queryString }) => {
  renderPage(<ReceivePage provider={GitLab} params={new URLSearchParams(queryString)} />);
});
router.on(`/${VERIFY_PATH}`, ({ queryString }) => {
  renderPage(<VerifyPage params={new URLSearchParams(queryString)} />);
});

router.resolve();
