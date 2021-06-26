/**
 * this is to render <time> tags with timezone-specific content based on the browser's settings
 */

function updateTimeElementTextContent(formatOptions, timeEle) {
  timeEle.textContent = new Date(timeEle.dateTime).toLocaleString(undefined, formatOptions);
}
const dateFormatOptions = {weekday: 'short', day: 'numeric', month: 'short'};
const timeFormatOptions = {hour: 'numeric', minute: 'numeric', timeZoneName: 'short'};
const updateDate = updateTimeElementTextContent.bind(null, dateFormatOptions);
const updateTime = updateTimeElementTextContent.bind(null, timeFormatOptions);

function updateDateTimesWithTimezoneContent() {
  document.querySelectorAll('time.date[dateTime]').forEach(updateDate);
  document.querySelectorAll('time.time[dateTime]').forEach(updateTime);
}
