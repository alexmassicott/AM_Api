export function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error:err.message })
  } else {
    next(err)
  }
}
export function errorHandler(err, req, res){
  res.status(500)
   res.render('error', { error: err })
}
