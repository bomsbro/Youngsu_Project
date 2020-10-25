function Member(id, pw) {
    this.id = id;
    this.pw = pw;
}
Member.prototype.toJSON = function () {
    return {
        id: this.id,
        pw: this.pw
    }
}
const member1 = new Member('hgd@hgd.com', '123456')
const member2 = new Member('kim@kim.com', '123456')

var members = {
    [member1.id]: member1.toJSON(),
    [member2.id]: member2.toJSON()
}

module.exports = class MemberTempDAO {
    constructor() { }
    findById = (id, cb) => {
        if (members[id] != null) cb(null, true);
        else cb("this ID does not exist", false);
    }
    matchPw = (id, pw, cb) => {
        if (members[id].pw == pw) cb(null, members[id])
        else cb("this PW is incorrect", false);
    }
}