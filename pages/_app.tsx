import * as React from 'react'
import App from 'next/app'
import Head from 'next/head' 
import Router from 'next/router'
import NProgress from 'nprogress'

Router.events.on('routeChangeStart', url => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

import 'semantic-ui-css/semantic.min.css'
import 'nprogress/nprogress.css'

export default class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props

    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Marvel API demo</title>
        </Head>
        <Component {...pageProps} />
      </>
    )
  }
}