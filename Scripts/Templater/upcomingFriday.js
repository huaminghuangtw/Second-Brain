function upcomingFriday() {
    return moment().day() <= 5
        ? moment().day(5)
        : moment().add(1, "week").day(5);
}

module.exports = upcomingFriday;
