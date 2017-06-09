/**
 * Created by jngue on 06/06/2017.
 */

let shortId = require('shortid');
let fs = require('fs');

class FileSocketHandler {
    constructor(ss, socket, roomName) {
        this.socket = socket;
        this.ss = ss;
        this.roomName = roomName;
    }

    onFileToRoom() {
        this.ss(this.socket).on("file" + this.roomName, function (stream, data) {
            let is;
            let os;
            let newFilename;
            let filename = path.basename(data.name);
            //is = fs.createWriteStream(filename);
            filename = shortId.generate()+'.'+extension;
            os = this.gridfs.createWriteStream({ filename: filename });
            stream.pipe(os);
        })
    }

    emitFileToRoom() {

    }
}