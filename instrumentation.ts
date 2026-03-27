// Node 25+ exposes an experimental localStorage global that breaks
// next-themes and other libraries that check `typeof window === "undefined"`
// to guard SSR. The Node implementation is incomplete (getItem is not a
// function) when --localstorage-file is not provided. Patch it out.
if (typeof window === "undefined" && typeof globalThis.localStorage !== "undefined") {
  // @ts-expect-error — intentionally removing broken Node 25 localStorage
  delete globalThis.localStorage;
}
