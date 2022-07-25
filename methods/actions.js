require('dotenv').config()

const User = require('../models/User')
const Token = require('../models/Token')
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer')
const { uploadToCloudinary, removeFromCloudinary } = require('../config/cloudinary')
    // const uploadMulter = require('../ulit/index');
const EventCreator = require('../models/EventCreator')
const fs = require("fs");


const secretCode = process.env.SECRET_CODE;

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    }
});

const functions = {
    //Adding New User
    addNew: async function(req, res) {
        try {
            if ((!req.body.fullname) || (!req.body.email) || (!req.body.password)) {
                res.json({ success: false, msg: 'All fields required' })
            } else {
                const email = req.body.email
                const user = await User.findOne({ email });
                if (user) return res.status(401).json({ msg: 'Account already exiting.' });
                const newUser = User({
                    fullname: req.body.fullname,
                    email: req.body.email,
                    password: req.body.password
                })
                newUser.save(function(err, newUser) {
                    if (err) {
                        res.json({ success: false, msg: 'Failed to save' })
                    } else {
                        var token = jwt.encode(newUser, secretCode)
                        res.json({ sucess: true, token: token, msg: "User Created Successfull, Please check your eamil for Verification link!" })
                            // res.json({ screen: true, msg: 'Successfully saved' })
                        const currentUrl = 'http://localhost:3000/';
                        var id = newUser._id;
                        var email = newUser.email;

                        const uniqueString = token;
                        const mailOptions = {
                                from: process.env.AUTH_EMAIL,
                                to: email,
                                subject: 'Verify your Email',
                                html: `<p>Verify your email address to complet the signup and login into your account</p><p>This link <b>expires in 6hours</b>.</p><p>Click <a href=${currentUrl + "verify/" + id + "/" + uniqueString} here </a> to verify</p>`
                            }
                            //hash the unquiString
                            // const saltRounds = 10;

                        //set values in userVerification collections
                        const newVerification = new Token({
                            userId: id,
                            token: token,
                            createdAt: Date.now(),
                            expiresAt: Date.now() + 21600
                        })
                        newVerification
                            .save()
                            .then(() => {
                                transporter
                                    .sendMail(mailOptions)
                                    .then((result) => {
                                        //email sent and verifcation record saved.
                                        // console.log(result)
                                        return res.json({
                                            status: 'PENDING',
                                            msg: 'Verification email sent'
                                        });


                                    })
                                    .catch((err) => {
                                        // console.log(err)
                                        console.log(err)
                                        return
                                        // return res.header({
                                        //     success: false,
                                        //     msg: 'Verification email sending failed',
                                        // })
                                    })
                            })
                            .catch((err) => {
                                console.log(err)
                                return
                                // return res.json({
                                //     success: false,
                                //     msg: 'Couldnt save verification email data',
                                // })
                            })
                            // })


                    }
                })
            }

        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },


    //Authenticating New User
    login: async function(req, res) {
        try {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (err) throw err
                if (!user) {
                    res.status(403).send({ sucess: false, msg: 'Authentication failed, User not found' })
                } else {
                    user.comparePassword(req.body.password, function(err, IsMatch) {
                        if (IsMatch && !err) {
                            //Check is user is Verified
                            if (!user.isVerified) {
                                return res.status(403).send({ sucess: false, msg: 'User not Verified' })
                            } else {
                                return res.status(200).send({ sucess: true, msg: 'User Successfully Login' })
                            }
                            // var token = jwt.encode(user, secretCode)
                            // res.json({ sucess: true, token: token })
                        } else {
                            return res.status(403).send({ sucess: false, msg: 'Authentication failed' })
                        }
                    })
                }
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    //Getting New User Info with token header
    verify: function(req, res) {
        let { userId, uniqueString } = req.params;
        // var  = req.params;
        console.log('Loging UserId and UnquiID', userId, uniqueString)

        Token
            .find({ userId })
            .then((result) => {
                console.log('Logging Result: ', result)
                if (result.length > 0) {
                    const { expiresAt } = result[0];
                    const hashedUniqureString = result[0].uniqueString

                    if (expiresAt < Date.now()) {
                        Token
                            .deleteOne({ userId })
                            .then(result => {
                                User.deleteOne({ id: userId })
                                    .then(() => {
                                        return res.json({ success: false, msg: 'Link as expired. Please sign up again ' })
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        return res.json({ success: false, msg: 'Deleting user with expired token ' })
                                    })
                            })
                            .catch((err) => {
                                console.log(err)
                                return res.json({ success: false, msg: 'Error occured deleting data' })
                            })
                    } else {
                        //valid record exist
                        //first compare the hashed uniqye string 
                        User.updateOne({ id: userId }, { isVerified: true })
                            .then(() => {
                                Token.deleteOne({ userId })
                                    .then(() => {
                                        return res.json({ success: true, msg: 'Verification Successful' })
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        return res.json({ success: false, msg: 'Error occured while finalizing successful verification' })
                                    })
                            })
                            .catch((err) => {
                                console.log(err)
                                return res.json({ success: false, msg: 'Error occued while updating user record' })
                            })
                            // bcrypt.compare(uniqueString, hashedUniqureString)
                            //     .then(result => {
                            //         console.log('Logging hashedUnique', hashedUniqureString)
                            //         if (result) {
                            //             //string match
                            //         } else {
                            //             //exiting record but incorrect verification details passed.
                            //             return res.json({ success: false, msg: 'Invalid verfication details passed. Check your inbox' })
                            //         }
                            //     })
                            //     .catch((err) => {
                            //         console.log('Comparing err', err)
                            //         return res.json({ success: false, msg: 'Error occured while comparing unique string' })
                            //     })
                    }
                } else {
                    return res.json({ success: false, msg: 'Account record doest exist or already verified' })
                }
            })
            .catch((err) => {
                console.log(err)
                return res.json({ success: false, msg: 'Error checking exiting user verification record' })
            })
            // if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            //     var token = req.headers.authorization.split(' ')[1]
            //     var decodedtoken = jwt.decode(token, secretCode)
            //     return res.json({ success: true, msg: 'Hello' + decodedtoken.name })
            // } else {
            //     return res.json({ success: false, msg: 'No Headers' })
            // }
    },

    updateProfile: async function(req, res, next) {
        const id = req.params.id;
        const update = req.body;

        // console.log('Loging parameter', id)
        let getId = await User.findOne({ id });
        console.log('Loging getid', getId)

        let userId = getId._id


        //Make sure the passed id is that of the logged in user
        if (userId.toString() !== id.toString()) return res.status(401).json({ message: "Sorry, you don't have the permission to upd this data." });

        if (req.file) {
            try {
                const cloudFile = await uploadToCloudinary(req.file.path, "profileImage");
                console.log('Loging cloudfile', cloudFile)
                const profileImage = cloudFile.url
                const imagePublicId = cloudFile.public_id
                await User.updateOne({ id: id }, { $set: update, profileImage, imagePublicId, updateAt: Date.now() }, { new: true })
                    .then(() => {
                        return res.json({ success: true, msg: 'Update Successful with Picture' })
                    })
                    .catch((err) => {
                        console.log('Login Update error', err)
                        return res.json({ success: false, msg: 'Error occured while updating profile' })
                    })
            } catch (error) {
                console.log('Log error for with picture', error)
            }
        } else {
            try {
                const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true });
                return res.status(200).json({ user, message: 'User has been updated without picture' });
            } catch (error) {
                console.log(error)
            }
        }
    },

    eventCreator: async function(req, res) {

        let userId = req.params.id

        let getId = await User.findOne({ userId });
        // console.log('Loging getid', getId)

        let currentUser = getId._id

        //Make sure the passed id is that of the logged in user
        if (currentUser.toString() !== userId.toString()) return res.status(401).json({ message: "Sorry, you don't have the permission to upd this data." });

        const files = req.files
        try {
            const urls = []
            let multiple = async(path) => await uploadToCloudinary(path);

            for (const file of files) {
                const { path } = file;
                console.log("path", file);

                const newPath = await multiple(path);
                urls.push(newPath);
                fs.unlinkSync(path);
            }

            if (urls) {
                const eventCreator = new EventCreator({
                    userId: userId,
                    eventName: req.body.eventName,
                    eventType: req.body.eventType,
                    eventCategory: req.body.eventCategory,
                    eventAbout: req.body.eventAbout,
                    eventAttendees: req.body.eventAttendees,
                    eventLocation: req.body.eventLocation,
                    eventFlyers: urls,
                    eventDate: req.body.eventDate,
                    eventSchedules: req.body.eventSchedules,
                    eventVersion: req.body.eventVersion
                })

                eventCreator.save()
                    .then(() => {
                        return res.json({ success: true, msg: 'Event Created Successful' })
                    })
                    .catch((err) => {
                        console.log(err)
                        return res.json({ success: false, msg: 'Error occured while creating event' })
                    })
            } else if (!urls) {
                return res.json({ success: false, msg: 'Error occured' })
            }

        } catch (error) {
            console.log(error)
        }

    }


}


module.exports = functions;