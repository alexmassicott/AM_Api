
export function errorHandler(res,message){
  res.status(500)
  .json({
    status:"error",
    message:message
  });
}
