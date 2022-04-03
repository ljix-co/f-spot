const arrayHas = (arr, param) => {
    for(let p in arr) {
        if(p === param) {
            return true;
        }
    }
    return false;
}
exports.arrayHas = arrayHas;

const formatDate = (date) => {
    let conv_date = "'" + date.getFullYear() + '-' + (date.getMonth() + 1)+ '-' +
    date.getDate() + ' ' + date.getHours() + ':' +
    date.getMinutes() + ':' + date.getSeconds() + "'" ;

    return conv_date;
}
exports.formatDate = formatDate;