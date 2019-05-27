#!/usr/bin/env node
const request = require('request-promise')
const chalk = require('chalk')

const args = process.argv.slice(2)

if (args.length < 2) {
  console.log("")
  console.log(chalk.gray("   Pour changer la période : "))
  console.log(chalk.gray("      passer les arguments $mois $date "))
  console.log(chalk.gray("      Mai 2019 : \"node index.js 5 2019\" "))
  console.log("")
}


const now = new Date()

let year = args.length === 2 ? args[1] : now.getFullYear()
let month = args.length === 2 ? args[0] : now.getMonth() + 1

const MOIS = [null, "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const paths = {
  source: 'https://www.joursouvres.fr/calendrier_joursouvres_{year}_{month}.htm'
}

function printIt({
  url = "",
  workingDays = "",
  mois = "",
  year = "",
  daysInMonth = "",
  bankHolidayDays = "bankHolidayDays"
}) {
  const templateStr = `

    Il y a ${chalk.green.bold(workingDays + "  jours ouvres")}  pour le mois de ${chalk.bold(mois)} ${chalk.bold(year)}.
    (le mois compte ${chalk.blue(daysInMonth)} jours dont ${chalk.blue(bankHolidayDays)} feries).

    Source : ${chalk.gray(url)}

`
  console.log(templateStr)
}


function template(str = "", p = {}) {
  return Object.keys(p).reduce((s, prop) => {
    return s.replace(new RegExp("{" + prop + "}", "g"), p[prop])
  }, str)
}

const workingDaysReg = /jours\ ouvrés\ \:\ ([0-9]{2})/
const bankHoliDaysReg = /jours\ fériés\ \:\ ([0-9]+)/
const daysInMonthReg = /Jours dans le mois\ \:\ ([0-9]+)/

function getWorkingDays(str) {
  const data = str.match(workingDaysReg)
  return data && data[1] ? data[1] : null
}

function getBankHolidayDays(str) {
  const data = str.match(bankHoliDaysReg)
  return data && data[1] ? data[1] : null
}

function getDaysInMonth(str) {
  const data = str.match(daysInMonthReg)
  return data && data[1] ? data[1] : null
}

async function fetchSource() {

  const url = template(paths.source, { year, month })

  return request({
    url,
  }).then(response => {
    return Promise.resolve({
      url,
      month,
      year,
      workingDays: getWorkingDays(response),
      bankHolidayDays: getBankHolidayDays(response),
      daysInMonth: getDaysInMonth(response)
    })
  }).catch(e => {
    console.log(e)
    console.log("error")
  })
}


const init = async function () {
  const result = await fetchSource()

  printIt({
    ...result,
    mois: MOIS[result.month]
  })


}


module.exports = { init }
