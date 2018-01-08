'use strict';
let dynamoose = require('dynamoose');
let Posts = dynamoose.model('Posts');

//////////////
function getfeeds(req,res){
  // ["work", "showcase", "news"]
  var count=0;
  const promises = req.query.feed.reduce((acc, type) => {

  acc.push(Promise.resolve(Posts.query('type').eq(type).where("publication_status").eq("live").exec()));

  return acc;
}, []);

  Promise.all(promises)
  .then((items)=>{

  let feed = items.reduce(function (arr, row) {
  return arr.concat(row);
  }, []);

  if (feed.length > 1) {
  feed = feed.sort(function(a, b) {
    var aa = a.creation_timestamp,
      bb = b.creation_timestamp;
    //  console.log(aa);
    if (aa !== bb) {
      if (aa < bb) {
        return 1;
      }
      if (aa > bb) {
        return -1;
      }
    }
    return aa - bb;
    });
  }
    res.json({status:"success",data:{ posts : feed}})
  }).catch(err=>{console.log(err)})

}



exports.get_feed = function(req, res) {
  if (req.query.feed)getfeeds(req, res);
  else {
    res.status(500).send({
      status: 'error',
      message: 'no type or id specified'
    })
  }
};
