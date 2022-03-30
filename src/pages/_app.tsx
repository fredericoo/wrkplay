import SimpleLayout from '@/layouts/SimpleLayout';
import { PageWithLayout } from '@/layouts/types';
import fetcher from '@/lib/fetcher';
import Fonts from '@/theme/Fonts';
import theme from '@/theme/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { SWRConfig } from 'swr';

type AppComponent = React.VFC<AppProps & { Component: PageWithLayout }>;

const App: AppComponent = ({ Component, pageProps: { session, ...pageProps } }) => {
  const Layout = Component.Layout || SimpleLayout;

  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Fonts />
          <SessionProvider session={session}>
            <Layout sidebar={pageProps.sidebar}>
              <Component {...pageProps} />
            </Layout>
          </SessionProvider>
        </ChakraProvider>
      </RecoilRoot>
    </SWRConfig>
  );
};

export default App;
