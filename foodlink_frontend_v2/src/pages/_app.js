// pages/_app.js
import Layout from './layout.js';
import '../styles/globals.css';
import '../styles/mapbox-gl.css';

function MyApp({ Component, pageProps }) {
  const userRole = ''; // This should come from your authentication logic

  return (
    <Layout userRole={userRole}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
