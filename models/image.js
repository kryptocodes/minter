var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ImageShcema = new Schema({
	wallet:{
		type: String,
		required: true
	},
	image: {
        data: Buffer,
        contentType: String
    },
	uid: {
		type: String,
		default: ''
	},
});

var Image = mongoose.model('Image', ImageShcema);

module.exports = Image;