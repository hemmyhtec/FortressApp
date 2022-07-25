require('dotenv').config()

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../models/User')
const secretCode = process.env.SECRET_CODE;

module.exports = function(passport) {
    var opts = {}

    opts.secretOrKey = secretCode
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('jwt')

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.find({
            id: jwt_payload.id
        }, function(err, user) {
            if (err) {
                return done(err, false)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
    }))
}