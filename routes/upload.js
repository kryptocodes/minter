var express = require('express');
var router = express.Router();
var Image = require('./../models/image');
var multer = require('multer');
const path = require("path");
const fs = require("fs");

const { check, validationResult } = require('express-validator');
const { NFTStorage, File } = require('nft.storage')
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY


const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, "uploads");
	},
	filename: function (req, file, cb) {
	  cb(
		null,
		file.fieldname + "-" + Date.now() + path.extname(file.originalname)
	  );
	},
  });

  const upload = multer({ storage: storage });

router.post("/upload",
upload.single("nft"), (req, res) => {
	
    const obj = {
        img: {
            data: fs.readFileSync(path.join(__dirname, "./../uploads/" + req.file.filename)),
            contentType: "image/png"
        }
    }
	var uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newImage = new Image({
        wallet: req.body.wallet,
		image: obj.img,
		uid: uid
    });

    newImage.save((err, data) => {
		if (err) {
			res.status(500).send({
				message: err.message || "Some error occurred while uploading the image."
			});
		} else {
			// remove file from uploads folder
			fs.unlink(path.join(__dirname, "./../uploads/" + req.file.filename), (err) => {
				if (err) {
					console.log(err);
				}
			});
			return res.status(200).json({
				message: "Image uploaded successfully",
				uid: uid
			});
		}
	});
});

router.post("/mint",
[
	check('wallet').notEmpty().withMessage('Wallet is required'),
	check('uid').notEmpty().withMessage('UID is required'),
	check('name').notEmpty().withMessage('Name is required'),
	check('description').notEmpty().withMessage('Description is required'),
],
	async(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { wallet, uid,name,description } = req.body;
		try {
		const image = await Image.findOne({wallet: wallet, uid: uid});

		const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })
		const data = await nftstorage.store({
			image: new File(
				[image?.image.data],
				`${uid}.jpg`, {
					type: 'image/jpg',
				  }),
			name: name,
			description: description,
		});
		return res.status(200).json({
			message: "Image uploaded successfully",
			data: data
		});

	}
	catch (error) {
		return res.status(500).json({
			message: error.message 
		});
	}
} 
	)

module.exports = router;