'use strict';
let dynamoose = require('dynamoose');
let Posts = dynamoose.model('Posts');
let Content = dynamoose.model('content');
//////////////
function getfeeds(req,res){
  // ["work", "showcase", "news"]
  var count=0;
  const promises = req.query.feed.reduce((acc, type) => {

  // acc.push(Promise.resolve(Posts.query('type').eq(type).where("publication_status").eq("live").exec()));
  acc.push(  Content.get({feed:"list_of_live_"+type})
    .then(items=>{
      return Promise.resolve(Posts.batchGet(items.posts.map(item=>{return {id:item}})))}))
  return acc;
}, []);

  Promise.all(promises)
  .then((items)=>{

  let feed = items.reduce(function (arr, row) {
  return arr.concat(row);
  }, []);
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
