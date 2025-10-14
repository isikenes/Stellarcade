import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-freighter-api/5.0.0/index.min.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
