// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}