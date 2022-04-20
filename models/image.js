var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ImageSchema = new Schema({
	wallet:{
		type: String,
		required: true
	},
	image: {
        data: Buffer,
        contentType: String
    },
	type:{
		type: String,
		required: true
	},
	uid: {
		type: String,
		default: ''
	},
},{
	timestamps: true
});

var Image = mongoose.model('Image', ImageSchema);

module.exports = Image;