import Provider from './Provider';

const Microsoft = new Provider(
  'Microsoft',
  'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0',
  'ec8813c8-670b-4b23-a85b-d44c8b7e8521',
  '/token-msft',
);
export default Microsoft;
