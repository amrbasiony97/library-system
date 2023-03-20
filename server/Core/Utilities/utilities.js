exports.toCapitalCase = str =>
    str.split('/')[1].charAt(0).toUpperCase() +
    str.split('/')[1].substring(1, str.length - 1);
