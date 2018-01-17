/*Expressions for AWS
*/
var moment=require('moment');
let dynamoose = require('dynamoose');
let Posts = dynamoose.model('Posts');
let Media = dynamoose.model('mediaobjects');

const getPostLom=(post_id)=>{

 return Posts.get({id:post_id});

}

const getFullMedia=(media_id)=>{

  return Media.get({id:media_id})
   .then((data)=>{
    console.log(data.post_id);
    return Promise.resolve(getPostLom(data.post_id))
  })
}

function updateCropData(_id, _size, _cd){

    return getFullMedia(_id)
    .then((data)=>{
      let _pid=data.id;
      let _lom=data.list_of_media;
      let mo = _lom.filter(function(a){return a.id==_id})[0];
      mo.data[_size]=_cd;
      mo.edit_timestamp=moment().unix();
      mo.number_of_changes+=1;
      var index = _lom.map(function(e) { return e.id; }).indexOf(_id);
      _lom[index]=mo;
      _lom= _lom.sort(function(a, b) {
        var aa = a.creation_timestamp,
            bb = b.creation_timestamp;
          //  console.log(aa);
        if (aa !== bb) {
            if (aa > bb) { return 1; }
            if (aa < bb) { return -1; }
        }
        return aa - bb;
      });
      return Promise.resolve(Posts.update({id:_pid},{list_of_media:_lom}));
      })


}

function updateOriginalData(req, res, _status, file){

  let _id=req.body.id;

  return getFullMedia(_id).
  then(data=>{
      let _pid=data.id;
      let _lom=data.list_of_media;
      let mo = _lom.filter(function(a){return a.id==_id})[0];
      mo.original_data=file;
      mo.status=_status;
      mo.number_of_changes+=1;
      mo.edit_timestamp = moment().unix();

      var index = _lom.map(function(e) { return e.id; }).indexOf(_id);
      _lom[index]=mo;
      _lom= _lom.sort(function(a, b) {
        var aa = a.creation_timestamp,
            bb = b.creation_timestamp;
          //  console.log(aa);
        if (aa !== bb) {
            if (aa > bb) { return 1; }
            if (aa < bb) { return -1; }
        }
        return aa - bb;
      });

     return Promise.resolve(Posts.update({id:_pid},{list_of_media:_lom}))
   },
   err=>{throw err});
}

module.exports={
  updateOriginalData,
  updateCropData,
  getPostLom,
  getFullMedia
};
