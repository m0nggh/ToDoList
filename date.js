module.exports.getDate = getDate;

function getDate() {
    const today = new Date();
    // var currentDay = today.getDay();
    let options = {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric"
    };
    return today.toLocaleDateString("en-US", options);
}

exports.getDay = function() {
    const today = new Date();
    // var currentDay = today.getDay();
    let options = {
        weekday: "long",
    };
    return today.toLocaleDateString("en-US", options);
}

// console.log(module.exports);
