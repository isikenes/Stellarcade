# 🔧 Freighter API Setup - IMPORTANT!

## ⚠️ Critical Requirement

The Freighter browser extension **alone is not enough**! You must also load the Freighter API library via CDN.

## ✅ What Was Fixed

Added the Freighter API script to `pages/_app.tsx`:

```tsx
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
```

## 📚 Official Documentation

From Freighter docs:

> "Install the packaged library via script tag using cdnjs. This will expose a global variable called `window.freighterApi`."

### Required Setup:

1. ✅ **Install Freighter Extension** (from freighter.app)
2. ✅ **Load Freighter API Library** (via CDN script tag)
3. ✅ Both are needed for `window.freighterApi` to work!

## 🎯 Why This Was the Issue

- The extension provides the **wallet functionality**
- The CDN script provides the **JavaScript API** (`window.freighterApi`)
- Without the script tag, `window.freighterApi` is `undefined`
- We were only checking for the extension, not loading the API!

## ✅ Now It Works!

After adding the script tag, refresh your browser and you should see:
- ✅ Freighter detected!
- ✅ Connect button works!
- ✅ All functionality operational!

---

**Reference:** https://docs.freighter.app/docs/guide/usingFreighterBrowser
