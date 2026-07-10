export const IS_MOBILE =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 800px)').matches
