var utils = {};

/**
 * Converts x amount of weeks after start date to since & until dates.
 */
utils.weekToDates = function (start, week) {
    var begin = new Date(start);
    begin.setDate(begin.getDate() - begin.getDay());
    var since = new Date(begin);
    since.setDate(begin.getDate() + (week-1)*7);
    var until = new Date(since);
    until.setDate(since.getDate() + 7);
    return {
        since, until
    };
}

module.exports = utils;