declare global {
  interface Window {
    fastgeo: any;
    testsReady: boolean;
  }
  
  var page: import('puppeteer').Page;
  var browser: import('puppeteer').Browser;
  var server: import('http').Server;
}

export {};
