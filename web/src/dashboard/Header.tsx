import * as React from 'react';
import { Helmet } from 'react-helmet';

export default class Header extends React.PureComponent {
  public render() {
    return (
      <Helmet>
        <title>SeOppi - Suomen eOppimiskeskus ry - jäsenpalvelut - &copy; Mindhive Oy 2019</title>
        <meta name="description" content="Suomen eOppimiskeskus ry:n jäsenpalvelut verkossa" />
        <meta name="theme-color" content="#008f68" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.4.2/css/all.css"
          integrity="sha384-/rXc/GQVaYpyDdyxK+ecHPVYJSN9bmVFBvjA/9eOB+pb3F2w2N6fc5qB9Ew5yIns"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=PT+Sans" rel="stylesheet" />
        <script crossOrigin="anonymous" src="https://unpkg.com/react@16/umd/react.production.min.js" />
        <script crossOrigin="anonymous" src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" />

        {addFirebase()}

        <meta name="version" content={`${CONFIG.build.version} build: ${CONFIG.build.build}`} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#fffbuild" />
        <meta name="application-name" content="Suomen eOppimiskeskus ry" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-icon-180x180.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Suomen eOppimiskeskus ry" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="msapplication-TileImage" content="mstile-144x144.png" />
        <meta name="msapplication-config" content="browserconfig.xml" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="icons-28c55435391c94914bdea6fbeed1f871/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="icons-28c55435391c94914bdea6fbeed1f871/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="icons-28c55435391c94914bdea6fbeed1f871/favicon.ico" />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-320x460.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-640x920.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-640x1096.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-750x1294.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 736px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 3)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-1182x2208.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 736px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 3)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-1242x2148.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-748x1024.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-768x1004.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-1496x2048.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)"
          href="icons-28c55435391c94914bdea6fbeed1f871/apple-touch-startup-image-1536x2008.png"
        />
      </Helmet>
    );
  }
}

const FIREBASE_VERSION = '5.9.4';

const FIREBASE_SERVICES = ['app', 'auth', 'firestore', 'functions'];

function addFirebase() {
  if (CONFIG.build.environment !== 'development') {
    return (
      <>
        {FIREBASE_SERVICES.map(service => (
          <script key="service" src={`/__/firebase/${FIREBASE_VERSION}/firebase-${service}.js`} />
        ))}
      </>
    );
  }
  return (
    <>
      {FIREBASE_SERVICES.map(service => (
        <script key="service" src={`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-${service}.js`} />
      ))}
    </>
  );
}
