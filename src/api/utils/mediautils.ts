/*Expressions for AWS
*/
import {Posts} from '../models/Posts';
import {IPost} from '../interfaces/ipost'
import {Media} from '../models/MediaObjects';
export function getPostLom(post_id): Promise<any>{

 return Posts.get({id:post_id});

}

export async function getFullMedia(media_id:string): Promise<IPost>{

    const data = await Media.get({id:media_id});
    const post = await getPostLom(data.post_id);

    return post;

}

export async function updateCropData(_id:string, _size:any, _cd:any): Promise<any>{

  const data = await getFullMedia(_id)

  let _pid=data.id;
  let _lom=data.list_of_media;
  let mo = _lom.filter(function(a){return a.id==_id})[0];
  mo.data[_size]=_cd;
  mo.edit_timestamp=Date.now()/1000;
  mo.number_of_changes+=1;

  let index = _lom.map(function(e) { return e.id; }).indexOf(_id);
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

}

export async function updateOriginalData(_id:string, _status:string, file:any): Promise<any>{

  const data = await getFullMedia(_id)
  const _pid=data.id;
  let _lom=data.list_of_media;
  let mo = _lom.filter(function(a){return a.id==_id})[0];
  mo.original_data=file;
  mo.status=_status;
  mo.number_of_changes+=1;
  mo.edit_timestamp = Date.now()/1000

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

}



export function updateVideoData(req){


}
