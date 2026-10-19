async function datePicker(tp) {
    const today = moment();

    const yearList = Array.from({ length: 5 }, (_, i) => today.year() - i);
    const year = await tp.system.suggester(
        yearList,
        yearList,
        false,
        "👇 Select year 👇"
    );
    if (year == null) return;

    const monthNames = Array.from({ length: 12 }, (_, i) =>
        moment().month(i).format("MMMM")
    );
    const monthValues = Array.from({ length: 12 }, (_, i) => i + 1);
    const month = await tp.system.suggester(
        monthNames,
        monthValues,
        false,
        "👇 Select month 👇"
    );
    if (month == null) return;

    const daysInMonth = moment({ year, month: month - 1 }).daysInMonth();
    const dateList = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dateListString = dateList.map((day) =>
        moment({ year, month: month - 1, day }).format("DD MMMM, YYYY")
    );
    const date = await tp.system.suggester(
        dateListString,
        dateList,
        false,
        "👇 Select day 👇"
    );
    if (date == null) return;

    return moment({ year, month: month - 1, day: date }).format("YYYY-MM-DD");
}

module.exports = datePicker;