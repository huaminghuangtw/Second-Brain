async function datePicker() {
    const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object;
    
    // Pick year
    const thisYear = moment().year();
    let yearList = [];
    for (let i = 0; i < 5; i++) {
        yearList.push(thisYear - i);
    }
    const year = await tp.system.suggester(yearList, yearList);

    // Pick month
    const months = [];
    for (let i = 0; i < 12; i++) {
        months.push(moment().month(i).format("MMMM"));
    }
    let monthValues = [];
    for (let i = 1; i <= 12; i++) {
        monthValues.push(i);
    }
    const month = await tp.system.suggester(months, monthValues);

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
    const date = await tp.system.suggester(dateListString, dateList);

    return moment({ year, month: month - 1, day: date }).format("YYYY-MM-DD");
}

module.exports = datePicker;