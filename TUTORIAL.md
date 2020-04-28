# TUTORIAL: Creating a LeanIX custom report

Custom reports are a great way for analysing and communicating Enterprise Architecture insights of your organization in an effective way.

In this step-by-step tutorial we create a simple [LeanIX](https://www.leanix.net/en/) custom report, from scratch, that displays a table of Applications with the corresponding tag count and tag names, and exports it as an Excel file, as in the picture below:

<img src="https://i.imgur.com/mZtLVeb.png">

The complete source-code for this project can be found [here](https://github.com/pauloramires/leanix-reporting-table-tutorial).

## Pre-requisites
* [NodeJS LTS](https://nodejs.org/en/) installed in your computer.

  
## Getting started

#### Install the [leanix-reporting-cli](https://github.com/leanix/leanix-reporting-cli) globally via npm:

```bash
npm install -g @leanix/reporting-cli
```

#### Initialize a new project:
```bash
mkdir table-report-tutorial
cd table-report-tutorial
lxr init
npm install
```

#### Configure your environment by editing the *lxr.json* file, if required:
```json
{
  "host": "app.leanix.net",
  "apitoken": "Jw8MfCqEXDDubry64H95SYYPjJTBKNFhkYD8kSCL"
}
```
#### After this procedure, you should end up with the following project structure:
<img src="https://i.imgur.com/kJTFgZM.png">

#### We start by cleaning up our project folder, deleting the unnecessary files:
- *src/report.js*
- *src/fact-sheet-mapper.js*
- *src/assets/bar.css*
- *src/assets/main.css*
  
#### Your project folder should look now like this:
<img src="https://i.imgur.com/h3RprP7.png">

#### We will be using [Alpine.js](https://github.com/alpinejs/alpine). Add the following additional dependencies to your project:

```bash
npm install alpinejs
```


#### We edit the *index.js* file as follows:
```javascript
import 'alpinejs'
import '@leanix/reporting'

const state = {
  baseUrl: '',
  // Will hold the dataset fetched from the workspace
  applications: [],
  // The column definition for our table
  columns: [
    {
      key: 'id',
      header: 'ID'
    },
    {
      key: 'name',
      header: 'Name'
    },
    {
      key: 'tagCount',
      header: 'Tag Count'
    },
    {
      key: 'tags',
      header: 'Tags'
    }
  ]
}

const methods = {
  // to be called upon report initialization
  initializeReport () {
    return lx.init()
      .then(setup => {
        this.baseUrl = setup.settings.baseUrl
        const config = {
          allowTableView: false,
          facets: [
            {
              fixedFactSheetType: 'Application',
              attributes: ['name', 'tags {name tagGroup {name}}'],
              callback: applications => this.applications = applications
                .map(application => {
                  let { tags = [] } = application
                  const tagCount = tags.length
                  tags = tags.map(tag => {
                    const { name, tagGroup = null } = tag
                    let labelPrefix = ''
                    if (tagGroup !== null) labelPrefix = `${tagGroup.name} - `
                    return `${labelPrefix}${name}`
                  }).join(', ')
                  return { ...application, tags, tagCount }
                })
            }
          ]
        }
        return lx.ready(config)
      })
  }
}

window.init = () => {
  return {
    ...state,
    ...methods
  }
}

```

#### We edit the *index.html* file as follows:
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <meta name="application-name" content="table-report-tutorial">
  <meta name="description" content="%description%">
  <meta name="author" content="%author%">

  <title>%title%</title>

</head>
<body x-data="init()" x-init="initializeReport()">
  <table>
    <thead>
      <tr>
        <template x-for="column in columns">
          <th x-text="column.header"></th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template x-for="application in applications">
        <tr>
          <template x-for="column in columns">
            <td x-text="application[column.key]"></td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</body>
</html>
```

#### After modifying the *index.html* and *index.js* files, launch the development server by using the following command:
```bash
npm start
```

#### You should get an output similar to the picture below.
<div style="display:flex; justify-content:center">
  <img src="https://i.imgur.com/t5TawDQ.png">
</div>

#### Success🎉 Our table renders correctly however it is clear that it could benefit from some styling. Let's make that happen then! 


## Styling the report
#### We will be using [Tailwindcss](https://tailwindcss.com/) for styling our report. Add the following additional dependencies to your project:

```bash
npm install --save-dev postcss-loader
npm install tailwindcss
```

#### In order to use [Tailwindcss](https://tailwindcss.com/), we need to modify the *webpack.config.js* file by including the *'postcss-loader'* option, as indicated by the red arrow in the picture below:
<div style="display:flex; justify-content:center;">
<img src="https://i.imgur.com/0Pf9Dly.png">
</div>

#### Next we create a *postcss.config.js* file in the *src* folder, with the following content:
```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
}
```

#### Additionally we create an *tailwind.css* file in the assets folder with the following content:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Finally we import the *tailwind.css* file into our *index.js* file at the top, as follows:
```javascript
import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'
...
```

#### Our project folder should look now like this:
<div style="display:flex; justify-content:center;">
<img src="https://i.imgur.com/n9Z1zvY.png">
</div>



#### We edit again the *index.html* file and add some tailwind classes to our table elements:
```html
...
<body x-data="init()" x-init="initializeReport()">
  <!--  we add this wrapper element around our table -->
  <div class="container mx-auto h-screen">
    <!-- and we add tailwindcss utility classes to our already existing table elements -->
    <table class="table-auto w-full text-center text-xs">
      <thead class="bg-black text-white sticky top-0">
        <tr>
          <template x-for="column in columns">
            <th class="px-4 py-2" x-text="column.header"></th>
          </template>
        </tr>
      </thead>
      <tbody>
        <template x-for="application in applications">
          <tr class="hover:bg-gray-100 transition-color duration-150 ease-in-out">
            <template x-for="column in columns">
              <td class="border px-4 py-2" x-text="application[column.key]">
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</body>
...
```

#### The output of our report looks now much better, doesn't it?
<div style="display:flex; justify-content:center;">
<img src="https://i.imgur.com/zXNnIvd.png">
</div>


## Implementing the "*Export to Excel*" feature
#### Our report is not yet complete, as it still misses the *"export to excel feature"*. It is worth of noticing that altough the *leanix-reporting* framework provides an *out-of-the-box export to excel feature*, we will be using a custom solution for it since our table displays a couple of locally computed columns - *tag count* and *tags*.


#### For that, we will use [ExcelJS](https://github.com/exceljs/exceljs) by adding the following additional dependencies to our project:

```bash
npm install exceljs file-saver
```

#### In the *index.js* file, import the *exceljs* and the *file-saver* libraries and add the *exportToXLSX* method as follows:
```javascript
import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'

const methods = {
  initializeReport () {
    ...
  },
  exportToXLSX (columns, applications) {
    lx.showSpinner()
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Applications')
    worksheet.columns = columns
    worksheet.addRows(applications)
    return workbook.xlsx.writeBuffer()
      .then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, 'document.xlsx')
        lx.hideSpinner()
      })
      .catch(err => console.error('error while exporting to excel', err))
  }
}
```

#### We still need a button in our custom report user-interface to trigger the *exportToXLSX* method. We implement it by editing the *index.html*:

```html
<body x-data="init()" x-init="initializeReport()">
  <div class="container mx-auto h-screen">
    <!-- wrapper for our export-to-excel button -->
    <div class="flex justify-between items-center py-4">
      <!-- additinonally we display the number of listed applications -->
      <span class="text-sm italic" x-text="'Listing ' + applications.length + ' Applications'"></span>
      <!-- and the export-to-excel button that triggers the exportToXLSX method-->
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
        @click="exportToXLSX(columns, applications)">
        Export to XLSX
      </button>
    </div>
    <table class="table-auto w-full text-center text-xs">
      ...
    </table>
  </div>
</body>
```

#### Launching again our development server, we get our table and our export button, as expected:
<div style="display:flex; justify-content:center">
<img src="https://i.imgur.com/mZtLVeb.png">
</div>

#### We quickly realize when exporting the dataset that the exported document doesn't look that great. Altough the styling of the excel document falls out of scope of the current tutorial, we can improve it significantly by simply specifying the width of each exported column in our *index.js* file as follows:

```javascript
...
const state = {
  baseUrl: '',
  applications: [],
  columns: [
    {
      key: 'id',
      header: 'ID',
      width: 40
    },
    {
      key: 'name',
      header: 'Name',
      width: 60
    },
    {
      key: 'tagCount',
      header: 'Tag Count',
      width: 10
    },
    {
      key: 'tags',
      header: 'Tags',
      width: 100
    }
  ]
}
...
```

#### And that's it! Your custom report is now ready to be uploaded to your workspace with the following command:
```bash
npm run upload
```

#### Congratulations on completing your custom table report!
