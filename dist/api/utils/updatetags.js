"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require('async');
const _ = require('lodash');
const Tags_1 = require("../models/Tags");
const tagParams = (_tag, _pid, docClient) => {
    const params = {};
    params.ExpressionAttributeNames = {
        '#PostIDs': 'posts',
        '#name': 'name'
    };
    params.ExpressionAttributeValues = {
        ':pid': docClient.createSet([_pid]),
        ':tagname': _tag
    };
    params.UpdateExpression = 'ADD #PostIDs :pid';
    params.Key = {
        name: _tag
    };
    params.ConditionExpression = '#name = :tagname';
    params.TableName = 'Tags';
    return params;
};
const remtagParams = (_tag, _pid, docClient) => {
    console.log('remove tags');
    const params = {};
    params.ExpressionAttributeNames = {
        '#PostIDs': 'posts'
    };
    params.ExpressionAttributeValues = {
        ':pid': docClient.createSet([_pid])
    };
    params.UpdateExpression = 'DELETE #PostIDs :pid';
    params.Key = {
        name: _tag
    };
    params.TableName = 'Tags';
    params.ReturnValues = 'UPDATED_NEW';
    return params;
};
const updatePostTags = (docClient, pid, lot) => {
    const data = {};
    data.Key = {
        id: pid
    };
    data.TableName = 'Posts';
    data.ExpressionAttributeNames = new Object();
    data.ExpressionAttributeValues = new Object();
    data.ExpressionAttributeNames['#lom'] = 'list_of_tags';
    data.UpdateExpression = 'SET #lom=:lom';
    data.ExpressionAttributeValues[':lom'] = lot;
    data.ReturnValues = 'UPDATED_OLD';
    return data;
};
module.exports = (pid, list_of_tags, docClient, cb) => {
    console.log('in it');
    let tags = list_of_tags;
    async.forEachOf(list_of_tags, (value, key, next) => {
        if (value.name) {
            console.log('looking');
            const params = tagParams(value.name, pid, docClient);
            Tags_1.Tags.update(params, (err, data) => {
                if (err) {
                    console.log(err);
                    tags = _.remove(list_of_tags, {
                        id: value.name
                    });
                }
                next();
            });
        }
        else
            next();
    }, (err, result) => {
        // Tags.update(updatePostTags(docClient, pid, tags))
        // .then((data) => {
        //   console.log(data.Attributes.list_of_tags);
        //   if (!tags.equals(data.Attributes.list_of_tags)) {
        //     async.forEachOf(tags.diff(data.Attributes.list_of_tags), function(value, key, next) {
        //       Tags.update(remtagParams(value.name, pid, docClient))
        //       .then((data) => {
        //         console.log(data);
        //       }).catch((err) => {
        //         console.log(err)});
        //     });
        //   }
        // }).catch((err) => {
        //   console.log(err)
        // });
    });
};
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;
    for (let i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i].name != array[i].name) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'equals', {
    enumerable: false
});
Array.prototype.diff = function (array) {
    const diff = [];
    const len = this.length >= array.length ? this.length : array.length;
    for (let i = 0, l = len; i < l; i++) {
        if (this[i] && array[i]) {
            if (this[i].name != array[i].name) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                diff.push(array[i]);
            }
        }
        else {
            // if(this[i])diff.push(this[i]);
            if (array[i])
                diff.push(array[i]);
        }
    }
    return diff;
};
//# sourceMappingURL=updatetags.js.map