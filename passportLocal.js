const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MemberTempDAO = require('./models/MemberTempDAO');
const memberTempDAO = new MemberTempDAO();

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser((id, done) => {
        // memberTempDAO.findById2(id, (err, user) => {
        //     done(null, user);
        // })
        done(null, user);
    })
    passport.use(new LocalStrategy({
        usernameField: 'useremail',
        passwordField: 'password',
        session: true,
        passReqToCallback: true,
    }, (req, id, pw, done) => {
        memberTempDAO.findById(id, (err, doesExist) => {
            if (err) return done(err);
            if (!doesExist) return done(null, false, { message: err });
            return memberTempDAO.matchPw(id, pw, (err, result) => {
                if (result) return done(null, result);
                return done(null, false, { message: err });
            })
        })
    }))
}