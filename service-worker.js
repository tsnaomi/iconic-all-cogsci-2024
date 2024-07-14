/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v0.0.0';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  // jsPsych files --------------------------------------------------
  'https://unpkg.com/jspsych@7.0.0/css/jspsych.css',
  'https://unpkg.com/jspsych@7.0.0',
  'https://unpkg.com/@jspsych/plugin-html-button-response@1.1.2',
  'https://unpkg.com/@jspsych/plugin-call-function@1.1.2',
  // local files ----------------------------------------------------
  'index.html',
  './',
  '../_static/css/ex-m20-min.css',
  '../_static/css/ex-m20.css',
  '../_static/css/ex-min.css',
  '../_static/css/ex.css',
  '../_static/css/style.css',
  '../_static/fonts/Functions.eot',
  '../_static/fonts/Functions.svg',
  '../_static/fonts/Functions.ttf',
  '../_static/fonts/Functions.woff',
  '../_static/fonts/Iconic.eot',
  '../_static/fonts/Iconic.svg',
  '../_static/fonts/Iconic.ttf',
  '../_static/fonts/Iconic.woff',
  '../_static/images/download-pink.png',
  '../_static/images/favicon.ico',
  '../_static/images/iOS-share.svg',
  '../_static/images/reading-list-1.png',
  '../_static/images/reading-list-2.png',
  '../_static/images/reading-list-3.png',
  '../_static/images/reading-list-4.png',
  '../_static/images/ready.png',
  '../_static/images/sidebar.svg',
  '../_static/images/tree.svg',
  '../_static/js/ex-m20-min.js',
  '../_static/js/ex.js',
  '../_static/js/helpers.js',
  '../_static/js/madlib.js',
  '../_static/js/production.js',
  '../_static/js/responsive-production.js',
  '../_static/js/selection.js',
  '../_static/js/test.js',
  '../_static/stimuli/ball.png',
  '../_static/stimuli/black-ball.png',
  '../_static/stimuli/black-feather.png',
  '../_static/stimuli/black-mug.png',
  '../_static/stimuli/feather.png',
  '../_static/stimuli/mug.png',
  '../_static/stimuli/red-ball.png',
  '../_static/stimuli/red-feather.png',
  '../_static/stimuli/red-mug.png',
  '../_static/stimuli/three-ball.png',
  '../_static/stimuli/three-black-ball.png',
  '../_static/stimuli/three-black-feather.png',
  '../_static/stimuli/three-black-mug.png',
  '../_static/stimuli/three-feather.png',
  '../_static/stimuli/three-mug.png',
  '../_static/stimuli/three-red-ball.png',
  '../_static/stimuli/three-red-feather.png',
  '../_static/stimuli/three-red-mug.png',
  '../_static/stimuli/two-ball.png',
  '../_static/stimuli/two-black-ball.png',
  '../_static/stimuli/two-black-feather.png',
  '../_static/stimuli/two-black-mug.png',
  '../_static/stimuli/two-feather.png',
  '../_static/stimuli/two-mug.png',
  '../_static/stimuli/two-red-ball.png',
  '../_static/stimuli/two-red-feather.png',
  '../_static/stimuli/two-red-mug.png',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
