import '../styles/globals.css';
import Footer from '../components/footer';
import Navbar from '../components/navbar';

function MyApp({ Component, pageProps }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content, which grows to fill available space */}
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default MyApp;
