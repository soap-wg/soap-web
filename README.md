# A Social Authentication Protocol - Web-based Prototype

This repository contains the code for a React Single-Page Application prototype for SOAP, a Social Authentication Protocol.
The prototype is deployed under https://soap-wg.github.io/soap-web-proto/.

To build and host the prototype yourself, execute:
```
npm install
npm run build
npm start
```

Note that this prototype is already configured with client IDs and redirect URLs.
There are two ways in which you can use this prototype:

1. Manually alter redirect URLs.
Whenever you request a token in a locally hosted prototype, you will be forwarded to `https://soap-wg.github.io/soap-web-proto/`.
This will raise an error as the web application does not recognize the request.
You can simply replace aforementioned URL with your localhost path in the URL bar, and your locally hosted prototype should recognize the redirect correctly.
2. Alternatively, you can register your own OpenID Connect applications at Microsoft and GitLab.
Once you have done this, you need to edit the files `src/oidc/GitLab.js` and `src/oidc/Microsoft.js` with your client IDs and redirect URLs, and update the `homepage` field in `package.json`.
