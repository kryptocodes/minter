var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	wallet:{
		type: String,
		required: true
	},
	userID: {
        type: String,
        default: '',
        required: true
    }
},{
    timestamps: true
});

var User = mongoose.model('User', UserSchema);

module.exports = User;