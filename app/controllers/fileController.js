/**
 * Created by jngue on 06/06/2017.
 */

let shortId = require('shortid');
let fs = require('fs');

class FileController {
    constructor(app) {
        this.gridfs = app.get('gridfs');
    }

    uploadFile(req, res, next) {
        let is;
        let os;
        let filename;
        //get the extenstion of the file
        let extension = req.files[0].originalname.split(/[. ]+/).pop();
        is = fs.createReadStream(req.files[0].path);
        filename = shortId.generate()+'.'+extension;
        os = this.gridfs.createWriteStream({ filename: filename });
        is.pipe(os);

        os.on('close', function (file) {
            //delete file from temp folder
            fs.unlink(req.files[0].path, function() {
                next(null, filename);
            });
        });
    }

    getFileById (req, res, next) {
        let readstream = this.gridfs.createReadStream({
            _id: req.params.fileId
        });
        req.on('error', function(err) {
            res.send(500, err);
        });
        readstream.on('error', function (err) {
            res.send(500, err);
        });
        readstream.pipe(res);
    }

    getFileByFilename(req, res, next) {
        let readstream = this.gridfs.createReadStream({
            filename: req.params.filename
        });
        req.on('error', function(err) {
            next(err);
        });
        readstream.on('error', function (err) {
            next(err);
        });
        readstream.pipe(res);
    }
}

module.exports = FileController;