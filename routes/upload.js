const express = require('express');
const router = express.Router();

const Image = require('./../models/image');
const User = require('./../models/user');
const Web3 = require("web3")

const multer = require('multer');
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { NFTStorage, File } = require('nft.storage');
const AuthCheck = require('../middleware/API');
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

router.post("/upload", AuthCheck,
upload.single("nft"), (req, res) => {
	const fileType = req.file.mimetype
	console.log(fileType);
	const supportedFileTypes = ["JPG"," PNG","GIF"," SVG"," MP4,","WEBM","MP3"," WAV"," OGG","GLB","GLTF"];
	if(fileType.includes(supportedFileTypes) ){
		return res.status(400).json({
			message: "Invalid file type"
		});
	}
	
    const obj = {
        img: {
            data: fs.readFileSync(path.join(__dirname, "./../uploads/" + req.file.filename)),
            contentType: req.file.contentType
        }
    }
	var uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newImage = new Image({
        wallet: req.body.wallet,
		image: obj.img,
		type: fileType,
		uid: uid
    });

    newImage.save((err, data) => {
		if (err) {
			res.status(500).send({
				message: err.message || "Some error occurred while uploading the image."
			});
		} else {
			return res.status(200).json({
				message: "File uploaded successfully",
				uid: uid
			});
		}
	});
});

router.post("/mint",
[
	check('wallet').notEmpty().withMessage('Wallet is required'),
	check('uid').notEmpty().withMessage('UID is required'),
	check('metadata').notEmpty().withMessage('Metadata is required')
],
AuthCheck,
	async(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { wallet, uid,metadata } = req.body;
		try {
		const image = await Image.findOne({wallet: wallet, uid: uid});
		const fileType = image.type;
		const fileName = fileType.substring(fileType.indexOf("/") + 1);
		const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

		const data = await nftstorage.store({
			image: new File(
				[image?.image.data],
				`${uid}.${fileName}`, {
					type: fileType,
				  }),
			name: metadata.name,
			description: metadata.description,
			external_url: metadata?.external_url ? metadata.external_url : "",
			attributes: metadata?.attributes ? metadata.attributes : "",
			background_color: metadata?.background_color ? metadata.background_color : "",
			animation_url: metadata?.animation_url ? metadata.animation_url : "",
			youtube_url: metadata?.youtube_url ? metadata.youtube_url : "",
		});
		return res.status(200).json({
			message: "File uploaded successfully",
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

router.post("/auth",[
	check('wallet').notEmpty().withMessage('Wallet is required'),
	check('signature').notEmpty().withMessage('Signature is required'),
], async(req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	const { wallet,signature } = req.body;
	const web3 = new Web3('https://rpc-mumbai.matic.today/');
	try {
		const user = await User.findOne({wallet: wallet});
		const UserID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		if(!user){
		   const newUser = new User({
			   	wallet: wallet,
				userID: UserID,
		   });
		   await newUser.save();
		}
		const address = web3.eth.accounts.recover("gm",signature);
		if(address === wallet){
			const token = jwt.sign({
				wallet: wallet,
				userID: user.userID ? user.userID !== '' : UserID
		}, process.env.JWT_SECRET);
		return res.status(200).json({
			message: "Authentication successful",
			APIKey: token
		});
	} else {
		return res.status(401).json({
			message: "Authentication failed"
		});
	}
	}
	catch (error) {
		return res.status(500).json({
			error: error.message 
		});
	}
})

router.get("/user/:wallet",[
	check('wallet').notEmpty().withMessage('Wallet is required'),
], async(req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	const { wallet } = req.params;
	try {
		const user = await User.findOne({wallet: wallet});
		if(!user){
			return res.status(404).json({
				message: "User not found"
			});
		}
		return res.status(200).json({
			wallet: user.wallet,
			UserID: user.userID
		});
	}
	catch (error) {
		return res.status(500).json({
			message: error.message
		});
	}
})


module.exports = router;