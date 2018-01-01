const Upload = require('../controllers/upload')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
module.exports = (app) => {
// API Server Endpoints
    app.get('/', Upload.displayForm)
    app.post('/upload', multipartMiddleware, Upload.upload)
}
