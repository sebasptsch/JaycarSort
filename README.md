# Jaycar Sort

A tool designed to help sort through the different hard-to-sort-through areas of a Jaycar store.

## Demo

[Live Demo](https://jaycarsort.vercel.app)

## Usage

To use simply upload a new XLSX Excel workbork formatted as bellow with the first sheet containing a list of the different items. Make sure the titles and the location names remain the same as the example document or the tool will not work.

### Excel Format

To be stored in a file ending with `.xlsx`.

| Location | Unit | Shelf | Tray | Barcode       | Item   | Description | Notes |
| -------- | ---- | ----- | ---- | ------------- | ------ | ----------- | ----- |
| Turbine  | 1    | 2     | 3    | 0000000000001 | AA0001 | PLG ITM     |       |
| Capstan  | 1    | 2     | 3    | 0000000000002 | AA0002 | PLG ITM     |       |
| Zone     | 1    | 2     | 3    | 0000000000003 | AA0003 | PLG ITM     |       |

## Features

- Full-screen button for mobile devices

## Installation

This program was designed to be as unobtrusive as possible and as a result can run on nearly and device with the correct version of Google Chrome.

The release files for this project can be found [here](https://github.com/sebasptsch/jaycarsort/releases/tag/latest).

### Windows

On windows simply download the zipped files (found above) and unzip them making sure that the directory structure remains the same. The files can be unzipped to any location.

Once the files have been unzipped simply double click the `index.html` file. This should open a new browser window.

If a new prompt comes up asking for which program to open the file with select Chrome.

For ease-of-use bookmark the page that opens.

### Android

This installation progress is somewhat more complicated in Android because it is a mobile operating system.

1. Download the files the same as you would on a computer through the link provided above.
2. Open the operating system's file explorer. One common to almost every Android device is one called "Downloads" or similar. (This may be called something different on your device).
   2.1. Note: If using the downloads app make sure that "Show internal filesystem" is enabled in the menu in the upper right-hand corner.

3. Browse to your `Downloads` folder and hold down on the file called `release.zip` and then click unzip. These files can be unzipped to any desired location provided it isn't on an external storage device like a usb or SD card as this results in permissions issues.
4. Similar to on Windows click on the `index.html` file and select "Chrome" in the application selection prompt that might come up.
5. This should open the application in a new chrome window that can be bookmarked or added to the home-screen for ease-of-access

## Tech Stack

This app uses [Preact](https://preactjs.com/) (minified version of [React](https://reactjs.org/)) and is compiled into vanilla JavaScript using the [Snowpack](https://www.snowpack.dev/) compiler.

It uses [`xlsx`](https://www.npmjs.com/package/xlsx) to convert Excel documents into json and then, subsequently all the items in the parsed file are added to a locally stored IndexedDB by [`react-use-indexeddb`](https://github.com/assuncaocharles/react-indexed-db). In addition it uses the [`fuse.js`](https://fusejs.io/) library for fuzzy searching.

## Authors

- [@sebasptsch](https://www.github.com/sebasptsch)

## Feedback/Support

If you have any new feature requirements or require help simply create an issue in the Github repository.

## Contributing

Contributions are always welcome! Simply create a fork of this repository and create a pull request to be merged into the main project.

## License

[MIT](https://choosealicense.com/licenses/mit/)
