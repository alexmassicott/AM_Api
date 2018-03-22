"use strict";
/**
 * Sort array of objects based on another array
 */
Object.defineProperty(exports, "__esModule", { value: true });
function mapOrder(array, order, key) {
    array.sort(function (a, b) {
        var A = a[key], B = b[key];
        if (order.indexOf(A) > order.indexOf(B)) {
            return 1;
        }
        else {
            return -1;
        }
    });
    return array;
}
exports.mapOrder = mapOrder;
;
// 
// /**
//  * Example:
//  */
//
// var item_array, item_order, ordered_array;
//
// item_array = [
//   { id: 2, label: 'Two' }
// , { id: 3, label: 'Three' }
// , { id: 5, label: 'Five' }
// , { id: 4, label: 'Four' }
// , { id: 1, label: 'One'}
// ];
//
// item_order = [1,2,3,4,5];
//
// ordered_array = mapOrder(item_array, item_order, 'id');
//
// console.log('Ordered:', JSON.stringify(ordered_array));
//# sourceMappingURL=mapOrder.js.map