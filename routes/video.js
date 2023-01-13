const express = require('express');
const router = express.Router();
// const { Video } = require("../models/Video");

const { auth } = require("../middleware/auth");
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filenmae: (req, file, cb) => {
        cb(null, `${Data.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extnmae(file.orginalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false);
        }
        cb(null, true)
    }
});


const upload = multer({ storage: storage }).single("file");

//=================================
//             Video
//=================================

router.post('/uploadfiles', (req, res) => {
    // 비디오를 서버에 저장한다.
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, url: res.req.file.path, filename: res.req.file.filename })
    })
})

router.post('/thumbnail', (req, res) => {
    // 썸네일 생성하고 비디오 러닝타임도 가져오기

    let filePath = ""
    let fileDuration = ""

    // 비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration
    });

    // 썸네일 생성
    ffmpeg(req.body.url)
        .on(`filenmae`, function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            console.log(filenames)

            filePath = 'uploads/thumbnails/' + filenames[0]
        })
        .on('end', function () {
            console.error(err);
            return res.json({ success: false, err });
        })
        .screenshots({
            count: 3,
            folder: 'uploads/thumbnails',
            size: '320*240',
            filename: 'thumbnail-%b.png'
        })
})
module.exports = router;