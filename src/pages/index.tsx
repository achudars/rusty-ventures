import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import SpecDocument from '../components/SpecDocument';

// Import RustPlayground component with no SSR
const RustPlayground = dynamic(() => import('../components/RustPlayground'), {
  ssr: false,
  loading: () => <div>Loading Rust Playground...</div>
});

export default function Home() {
  return (
    <div>
      <Head>
        <title>Rusty Ventures - Rust + WebAssembly + Next.js</title>
        <meta name="description" content="A Next.js app with Rust and WebAssembly integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout
        leftContent={<SpecDocument />}
        rightContent={<RustPlayground />}
      />
    </div>
  );
}
