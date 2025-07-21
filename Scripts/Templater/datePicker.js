async function datePicker(tp) {
    const today = moment();

    // Pick year
    const yearList = Array.from({ length: 5 }, (_, i) => today.year() - i);
    const year = await tp.system.suggester(yearList, yearList, today.year());

    if (year === today.year()) {
        const choice = await tp.system.suggester(
            ["📅 Today", "📅 Yesterday", "🗓️ Pick another date"],
            ["today", "yesterday", "pick"]
        );

        switch (choice) {
            case "today":
                return today.format("YYYY-MM-DD");
            case "yesterday":
                return today.clone().subtract(1, "days").format("YYYY-MM-DD");
            case "pick":
                break;
            default:
                return;
        }
    } else {
        const defaultDateStr = moment({
            year,
            month: today.month(),
            day: today.date(),
        }).format("MMMM D, YYYY");
        const useDefault = await tp.system.suggester(
            [`📅 Use today's date: ${defaultDateStr}`, "🗓️ Pick another date"],
            [true, false]
        );

        if (useDefault) {
            return moment({
                year,
                month: today.month(),
                day: today.date(),
            }).format("YYYY-MM-DD");
        }
    }

    // Pick month
    const monthNames = Array.from({ length: 12 }, (_, i) =>
        moment().month(i).format("MMMM")
    );
    const monthValues = Array.from({ length: 12 }, (_, i) => i + 1);
    const month = await tp.system.suggester(
        monthNames,
        monthValues,
        monthNames[today.month()]
    );

    // Pick day
    const daysInMonth = moment({ year, month: month - 1 }).daysInMonth();
    const dateList = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dateListString = dateList.map((day) =>
        moment({ year, month: month - 1, day }).format("DD MMMM, YYYY")
    );
    const defaultDayIndex =
        year === today.year() && month === today.month() + 1
            ? today.date() - 1
            : 0;
    const date = await tp.system.suggester(
        dateListString,
        dateList,
        dateListString[defaultDayIndex]
    );

    return moment({ year, month: month - 1, day: date }).format("YYYY-MM-DD");
}

module.exports = datePicker;
