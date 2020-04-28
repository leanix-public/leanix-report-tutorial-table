import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'

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

const methods = {
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

window.init = () => {
  return {
    ...state,
    ...methods
  }
}
