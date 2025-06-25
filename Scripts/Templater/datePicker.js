async function datePicker() {
    const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object;
    
    // Pick year
    const thisYear = moment().year();
    let yearList = [];
    for (let i = 0; i < 5; i++) {
        yearList.push(thisYear - i);
    }
    const year = await tp.system.suggester(yearList, yearList);

    const today = moment();
    let defaultMonth = today.month() + 1;
    let defaultDay = today.date();

    const defaultDateStr = moment({ year, month: defaultMonth - 1, day: defaultDay }).format('MMMM D, YYYY');
    let useDefault = await tp.system.suggester([
        `Use today's date: ${defaultDateStr}`,
        'Pick another date'
    ], [true, false]);

    let month, date;
    if (useDefault) {
        month = defaultMonth;
        date = defaultDay;
    } else {
        // Pick month
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push(moment().month(i).format("MMMM"));
        }
        let monthValues = [];
        for (let i = 1; i <= 12; i++) {
            monthValues.push(i);
        }
        month = await tp.system.suggester(months, monthValues, months[defaultMonth-1]);

        // Pick day
        const daysInMonth = moment({ year, month: month - 1 }).daysInMonth();
        let dateList = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dateList.push(i);
        }
        let dateListString = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dateListString.push(
                moment({ year, month: month - 1, day: i }).format("DD MMMM, YYYY")
            );
        }

        // Default to today's day if month matches, otherwise 1
        let defaultDayIndex = (month === defaultMonth) ? defaultDay - 1 : 0;
        date = await tp.system.suggester(dateListString, dateList, dateListString[defaultDayIndex]);
    }

    return moment({ year, month: month - 1, day: date }).format("YYYY-MM-DD");
}

module.exports = datePicker;