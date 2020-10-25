const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MemberTempDAO = require('./models/MemberTempDAO');
const memberTempDAO = new MemberTempDAO();

module.exports = () => {
    passport.serializeUser((member, done) => {
        done(null, member.id);
    })
    passport.deserializeUser((id, done) => {
        memberTempDAO.findById(id, (err, member) => {
            done(err, member);
        })
        // done(null, id);
    })
    passport.use(new LocalStrategy({
        usernameField: 'useremail',
        // passwordField: 'password',
        session: true,
        passReqToCallback: true,
    }, (req, id, pw, done) => {
        memberTempDAO.findById(id, (err, member) => {
            if (err) return done(err);
            if (!member) {
                return done(null, false, { message: err });
            }
            if (member.pw == pw) return done(null, member);
            return done(null, false, { message: err });
        })
    }))
}