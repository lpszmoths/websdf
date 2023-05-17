import * as React from 'react'

import '../styles/global-styles.css'

export default function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}
