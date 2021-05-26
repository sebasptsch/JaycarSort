# Jaycar Stock Locator

A project built for reading and indexing provided excel documents and formatting them into a searchable list.

This app uses [Preact](https://preactjs.com/) (minified version of [React](https://reactjs.org/)) and is compiled into vanilla JavaScript using the [Snowpack](https://www.snowpack.dev/) compiler.

It uses a [`xlsx`](https://www.npmjs.com/package/xlsx) to convert excel documents into json and then, subsequently all the items in the parsed file are added to a locally stored in IndexedDB by [`react-use-indexeddb`](https://github.com/assuncaocharles/react-indexed-db). In addition it uses the [`fuse.js`](https://fusejs.io/) library for fuzzy searching.

## Example Document

