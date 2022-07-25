const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


const userSchema = new Schema({
    fullname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        required: 'Your email is required',
        trim: true
    },
    profileImage: {
        type: String,
        required: false,
    },
    imagePublicId: {
        type: String,
        required: false,
    },

    isVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        required: false
    },
    dob: {
        type: Date,
        required: false
    },
    mobileno: {
        type: Number,
        required: false
    }

}, { timestamps: true });

userSchema.pre('save', function(next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err)
                }
                user.password = hash;
                next()
            })
        })
    } else {
        return next()
    }
})


userSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, IsMatch) {
        if (err) {
            return cb(err)
        }
        cb(null, IsMatch)
    })
};

const User = mongoose.model('User', userSchema)
module.exports = User;