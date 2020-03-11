const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
    destination:
    function (req, file, cb) {
        cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

module.exports = function (app) {
    app.post('/sendfile', upload.single('file'), async (req, res) => {
        const fileInfo = req.file;
        if (fileInfo) {
            const stringFromFile = fs.readFileSync(`${fileInfo.destination}${fileInfo.filename}`).toString();
            const adjustedStringValue = stringFromFile.replace(/\n/g, ' ');
            res.send({value: adjustedStringValue});            
        }
        res.send({ value: '' });
    });
};