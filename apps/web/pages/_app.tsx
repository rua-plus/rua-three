import { AppProps } from 'next/app';
import Head from 'next/head';
import './global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>RUA</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
