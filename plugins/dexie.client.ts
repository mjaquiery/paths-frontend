import { db } from '~/src/lib/db';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('db', db);
});
