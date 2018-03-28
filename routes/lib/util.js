var util = {
    sortArrayByKey: function (array, key, direction) {
        if (direction === "up") {
            for (var i = 0; i < array.length; i++) {
                for (var j = array.length - 1; j > i; j--) {
                    if (parseInt(array[j][key]) < parseInt(array[i][key])) {
                        var temp = array[j];
                        array[j] = array[i];
                        array[i] = temp;
                    }
                }
            }
        } else if (direction === "down") {
            for (var i = 0; i < array.length; i++) {
                for (var j = array.length - 1; j > i; j--) {
                    if (parseInt(array[j][key]) < parseInt(array[i][key])) {
                        var temp = array[j];
                        array[j] = array[i];
                        array[i] = temp;
                    }
                }
            }
        }
        return array;
    },
    compressArrayByKey: function (array, key) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = array[i]) != null; i++) {

            if (!hash[elem[key]]) {
                result.push(elem);
                hash[elem[key]] = true;
            }
        }
        return result;
    }
};

module.exports = util;