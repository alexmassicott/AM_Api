/*Expressions for AWS
*/
var moment=require('moment');
let ddbutil=require('ddbutil');

const putBase64Params=(bucketName,url,image,filetype)=>(
  {
        Bucket: bucketName,
        Key: url,
        Body: image,
        ContentType: 'image/'+filetype
});


const getExpressions = (key,status,metadata)  =>{
    if(metadata){
    delete metadata.fieldName;
    delete metadata.headers;
    delete metadata.name;
    metadata.filesize=Math.floor(metadata.size/1000)+"kb";
    delete metadata.size;
    }
  var data = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: {}
  };
  data.Key={ "id" : key };
  data.TableName="mediaobjects";
  data.ExpressionAttributeNames["#noc"] = "number_of_changes";
  data.ExpressionAttributeNames["#et"] = "edit_timestamp";
  data.ExpressionAttributeNames["#stat"] = "status";
  if(metadata)data.ExpressionAttributeNames["#og"] = "original_data";
  data.UpdateExpression = "ADD #noc :inc SET #stat=:status, #et=:now";
  if(metadata)data.UpdateExpression+=", #og=:og";
  data.ExpressionAttributeValues[":inc"] = 1;
  data.ExpressionAttributeValues[":now"] = moment().unix();
  if(metadata)data.ExpressionAttributeValues[":og"] = metadata;
  data.ExpressionAttributeValues[":status"] = status;

  return data;

}

const getCropExpressions = (key,size,cropdata)  =>{

  var data = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: {}
  };
  data.Key={ "id" : key };
  data.TableName="mediaobjects";

  data.ExpressionAttributeNames["#data"] = "data";
  data.ExpressionAttributeNames["#"+size] = size;
  data.ExpressionAttributeValues[":cd"] = cropdata;
  data.UpdateExpression = "SET #data.#"+size+"=:cd";
  return data;

};

const getPostLom=(post_id)=>{
 let params = {
   TableName: "Posts",
   Key: {
       "id": post_id
   },
   ProjectionExpression:"list_of_media"
 };
 return params;
}

const updatePostLom=(post_id,lom)=> {
 let data = {
   ExpressionAttributeNames: {},
   ExpressionAttributeValues: {},
   UpdateExpression: {}
 };
 data.Key={ "id" :post_id };
 data.TableName="Posts";
 data.ExpressionAttributeNames["#lom"] = "list_of_media";
 data.UpdateExpression = "SET #lom=:lom";
 data.ExpressionAttributeValues[":lom"] = lom;

 return data;
}

const getUpdatePostExpressions = (key,lom)  =>{

  var data = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    UpdateExpression: {}
  };
  data.Key={ "id" : key };
  data.TableName="Posts";

  data.ExpressionAttributeNames["#lom"] = "list_of_media";
  data.ExpressionAttributeValues[":lom"] = lom;
  data.UpdateExpression = "SET #lom=:lom";
  data.ReturnValues="ALL_NEW";
  return data;

};

function updateCropData(_id, _size, _cd, docClient){

  let _lom;
  let _pid;
  let getPostLOM;

  let params1 = {
    TableName: "mediaobjects",
    Key: {
        "id": _id
    },
    ExpressionAttributeNames: {
         "#pid": "post_id",
     },
    ProjectionExpression:"#pid"
    };

  ddbutil.get(docClient,params1)
  .then((data)=>{
    _pid=data.Item.post_id;
    let params = {
      TableName: "Posts",
      Key: {
          "id": _pid
      },
      ExpressionAttributeNames: {
           "#n": "list_of_media",
       },
      ProjectionExpression:"#n"
    };
    return Promise.resolve(ddbutil.get(docClient,params))})
    .then((data)=>{
      _lom=data.Item.list_of_media;
      let mo = _lom.filter(function(a){return a.id==_id});
      return mo[0]})
    .then((mo)=>{

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
    var params2 = getUpdatePostExpressions(_pid, _lom);
    return Promise.resolve(ddbutil.update(docClient,params2));
  })
  .then(res=>console.log(res))
  .catch(function(err) {
    console.log(err);
  });

}

function updateOriginalData(req, res, _status, docClient, file){

  let _lom;
  let _id=req.body.id;
  let _pid;
  var params1 = {
    TableName: "mediaobjects",
    Key: {
        "id": _id
    },
    ExpressionAttributeNames: {
         "#pid": "post_id",
     },
    ProjectionExpression:"#pid"
    };


  ddbutil.get(docClient,params1)
  .then((data)=>{
    _pid=data.Item.post_id;
    var params = {
      TableName: "Posts",
      Key: {
          "id": _pid
      },
      ExpressionAttributeNames: {
           "#n": "list_of_media",
       },
      ProjectionExpression:"#n"
    };
    // getPostLOM=docClient.get(params).promise();
    return Promise.resolve(ddbutil.get(docClient,params))})
    .then((data)=>{
        _lom=data.Item.list_of_media;
        let mo = _lom.filter(function(a){return a.id==_id});
        return mo[0];
    })
    .then((mo)=>{
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
     return Promise.resolve(ddbutil.update(docClient,getUpdatePostExpressions(_pid, _lom)))
   })
   .then(()=>{res.json({status: "success"})})
   .catch(function(err) {
     console.log(err);
     res.status(500).send({
       status:'error',
       err});
     });


}
module.exports={
  updateOriginalData,
  updateCropData,
  getPostLom,
  updatePostLom,
  getUpdatePostExpressions,
  getCropExpressions,
  getExpressions,
  putBase64Params
};
