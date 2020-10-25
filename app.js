const http = require('http');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passportLocal');
const cors = require('cors');
const router = express.Router();
const static = require('serve-static');
const app = express();
// const url = require('url');
const mysql = require('mysql');
app.use(session({ secret: 'secret secretary', resave: true, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
passportConfig();


// please enter your mysql local username and its password below
var yourLocalMySQLUsername = 'root2';
var yourLocalMySQLPassword = '1234';

var sql_createUser = "create user if not exists poolmanager identified by '1234';";
var sql_grantPrivileges = "grant all privileges on pooldb.* to 'poolmanager'@'%';";
var sql_flush = "flush privileges;";
var sql_alterUser = "alter user poolmanager identified with mysql_native_password by '1234';";
var sqls1 = sql_createUser + sql_grantPrivileges + sql_flush + sql_alterUser;

var sql_createDB = "create database if not exists pooldb;";

var sql_createTable = "create table if not exists pooltable(poolId int not null, poolName varchar(20) not null, poolAddress varchar(60) not null, poolPhone varchar(20),poolTypeMask int,poolOpentime int,poolOption int,primary key(poolId));";
var sql_insertValues1 = "insert into pooltable(poolId,poolName,poolAddress,poolPhone,poolTypeMask,poolOpentime,poolOption) select * from (select 1 as poolId,'가나다 스포츠' as poolName,'서울 압구정동' as poolAddress,'010-1111-1111' as poolPhone,19 as poolTypeMask,1 as poolOpentime,101 as poolOption) as tmp where not exists(select poolName from pooltable where poolName = '가나다 스포츠') limit 1;";
var sql_insertValues2 = "insert into pooltable(poolId,poolName,poolAddress,poolPhone,poolTypeMask,poolOpentime,poolOption) select * from (select 2 as poolId,'미니미 수영장' as poolName,'대전 둔산동' as poolAddress,'010-2222-2222' as poolPhone,9 as poolTypeMask,1 as poolOpentime,11 as poolOption) as tmp where not exists(select poolName from pooltable where poolName = '미니미 수영장') limit 1;";
var sql_insertValues3 = "insert into pooltable(poolId,poolName,poolAddress,poolPhone,poolTypeMask,poolOpentime,poolOption) select * from (select 3 as poolId,'건강미 센터' as poolName,'대구 용산동' as poolAddress,'010-3333-3333' as poolPhone,18 as poolTypeMask,0 as poolOpentime,110 as poolOption) as tmp where not exists(select poolName from pooltable where poolName = '건강미 센터') limit 1;";
var sql_insertValues4 = "insert into pooltable(poolId,poolName,poolAddress,poolPhone,poolTypeMask,poolOpentime,poolOption) select * from (select 4 as poolId,'앗차거 호텔' as poolName,'부산 부전동' as poolAddress,'010-4444-4444' as poolPhone,7 as poolTypeMask,0 as poolOpentime,1 as poolOption) as tmp where not exists(select poolName from pooltable where poolName = '앗차거 호텔') limit 1;";
var sqls2 = sql_createTable + sql_insertValues1 + sql_insertValues2 + sql_insertValues3 + sql_insertValues4;

var randomWords = "가나다라마바사아자차카타파하";
var randomOptions = [0, 100, 10, 1, 101, 110, 111, 11]

var randomSz = 8000;
for (var i = 5; i < randomSz; ++i) {
    var poolNameRandom = "";
    for (var charCnt = 0; charCnt < 3; ++charCnt)poolNameRandom += randomWords[parseInt(Math.random() * 14)];
    var poolPhoneRandom = "010-" + poolNameRandom + "-0000";
    poolNameRandom = "'" + poolNameRandom + "'";
    poolPhoneRandom = "'" + poolPhoneRandom + "'";
    var poolMaskRandom = parseInt(Math.random() * 30) + 1
    var openTimeRandom = parseInt(Math.random() * 2)
    var optionRandom = randomOptions[parseInt(Math.random() * 8)]
    var sql_insertValuesRandom = "insert into pooltable(poolId,poolName,poolAddress,poolPhone,poolTypeMask,poolOpentime,poolOption) select * from (select " + i + " as poolId," + poolNameRandom + " as poolName," + poolNameRandom + " as poolAddress," + poolPhoneRandom + " as poolPhone," + poolMaskRandom + " as poolTypeMask," + openTimeRandom + " as poolOpentime," + optionRandom + " as poolOption) as tmp where not exists(select poolId from pooltable where poolId = " + i + ") limit 1;";
    // console.log(sql_insertValuesRandom)
    sqls2 += sql_insertValuesRandom;
}


function db_initSetting() {
    return new Promise((resolve, reject) => {
        const conn_init1 = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: yourLocalMySQLUsername,
            password: yourLocalMySQLPassword,
            multipleStatements: true,
        })
        conn_init1.connect();
        conn_init1.query(sqls1, (err) => {
            conn_init1.destroy();
            if (err) {
                throw err;
                return;
            }
            const conn_init2 = mysql.createConnection({
                host: 'localhost',
                port: 3306,
                user: 'poolmanager',
                password: '1234',
                multipleStatements: true,
            })
            conn_init2.connect()
            conn_init2.query(sql_createDB, (err) => {
                conn_init2.destroy();
                if (err) {
                    throw err;
                    return;
                }
                const conn_init3 = mysql.createConnection({
                    host: 'localhost',
                    port: 3306,
                    user: 'poolmanager',
                    password: '1234',
                    database: 'pooldb',
                    multipleStatements: true,
                })
                conn_init3.connect()
                conn_init3.query(sqls2, (err) => {
                    conn_init3.destroy()
                    if (err) {
                        reject(err)
                    }
                    resolve();
                })
            })
        })
    })
}

var dbpool = null;
async function dbpoolCreater() {
    await db_initSetting();
    dbpool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: 'poolmanager',
        password: '1234',
        database: 'pooldb',
        multipleStatements: true,
        connectionLimit: 100,
    })
}
dbpoolCreater();
// console.log(dbpool); // promise<pending>

/* 
    유저 생성
    유저 권한 부여
    테이블 삭제시 truncate까지 확인
    transaction, commit 확인
    limit활용 must come with order by, 모듈화
*/

app.set('port', 3000 || process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cors());
// app.use('/', static(__dirname + '/public'));
app.use('/', static(__dirname + '/'));

function maskMaker(number) {
    var ret = 0;
    var temp = 1;
    while (number) {
        ret += temp * (number % 10)
        temp *= 2;
        number = Math.floor(number / 10)
    }
    return ret;
}

router.route('/pools/search').get((req, res) => {
    // var filters = {
    //     searchWord: req.query.searchWord,
    //     'poolPublic': req.query.poolPublic,
    //     'poolPrivate': req.query.poolPrivate,
    //     'poolHotel': req.query.poolHotel,
    //     'poolIndoor': req.query.poolIndoor,
    //     'poolOutdoor': req.query.poolOutdoor,
    //     'poolOpentime': req.query.poolOpentime,
    //     'poolForChild': req.query.poolForChild,
    //     'poolForWoman': req.query.poolForWoman,
    //     'poolForDisabled': req.query.poolForDisabled,
    // }
    var filters = req.query;
    // console.log(filters);

    var checked = '1';
    var itemsPerPage = 4;
    var pageNumber = req.query.pageNumber;
    var searchWord = '%' + req.query.searchWord + '%';

    // poolTypeMask와 row의 AND연산 후에 row면 true
    var poolTypeArray = [
        req.query.poolOutdoor,
        req.query.poolIndoor,
        req.query.poolHotel,
        req.query.poolPrivate,
        req.query.poolPublic,
    ];
    var poolTypeMask = 0;
    for (var i in poolTypeArray) {
        if (poolTypeArray[i] == checked) poolTypeMask |= (1 << i);
    }

    // opentime은 AND연산 후에 search opentime과 같으면 true
    var poolOpentime = req.query.poolOpentime;

    // child,woman,disabled는 =로 확인
    var poolOption = req.query.poolForChild + req.query.poolForWoman + req.query.poolForDisabled;

    // console.log(poolTypeMask, poolOpentime, poolOption)

    var sql_select_totalCount = "select count(*) as cnt from pooltable where (poolName like ? or poolAddress like ?) and (poolTypeMask&?)=poolTypeMask and (poolOpentime&?)=? and poolOption=?;"
    var sql_select = "select * from pooltable where (poolName like ? or poolAddress like ?) and (poolTypeMask&?)=poolTypeMask and (poolOpentime&?)=? and poolOption=? order by poolId limit ?,?;"
    function sqlHandler() {
        return new Promise((resolve, reject) => {
            dbpool.getConnection((err, conn) => {
                if (err) {
                    if (conn) conn.release();
                    console.log('ERR: getConnection in sqlHandler');
                    return;
                }
                conn.query(sql_select_totalCount, [searchWord, searchWord, poolTypeMask, poolOpentime, poolOpentime, poolOption], (error, rows, fields) => {
                    if (error) {
                        if (conn) conn.release();
                        reject(error);
                        return;
                    }
                    var ret = [];
                    ret.push(rows[0].cnt);
                    // conn.query(sql_select, [searchWord, searchWord, poolTypeMask, poolOpentime, poolOpentime, poolOption, (pageNumber - 1) * itemsPerPage, (pageNumber - 1) * itemsPerPage + itemsPerPage], (error, rows, fields) => {
                    conn.query(sql_select, [searchWord, searchWord, poolTypeMask, poolOpentime, poolOpentime, poolOption, (pageNumber - 1) * itemsPerPage, itemsPerPage], (error, rows, fields) => {
                        conn.release();
                        if (error) {
                            reject(error);
                            return;
                        }
                        var pools = []
                        for (var row of rows) {
                            pools.push(row)
                        }
                        ret.push(pools);
                        resolve(ret);
                    })
                })
            })
        })
    }
    async function resultSender() {
        let ret = await sqlHandler();
        let result = {
            'filters': filters,
            'totalCount': ret[0],
            'pools': ret[1],
        }
        // console.log(result)
        req.app.render('pool_list', { result: result }, (err, html) => {
            if (err) {
                console.log(err)
                res.end('<h1>ejs error!</h1>');
                return;
            }
            res.end(html);
        })
    }
    resultSender();
})

router.route('/login').get((req, res) => {
    res.sendFile(__dirname + '/views/login.html');
})
router.post('/login/check', passport.authenticate('local', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/');
})

router.route('/pools/input').get((req, res) => {
    var name = req.query.name;
    var location = req.query.location;
    var phone = req.query.phone;
    var description = req.query.description;
    pools.push({ 'idx': ++sz, "name": name, "location": location, "phone": phone, "description": description });

    req.app.render('pool_complete', {}, (err, html) => {
        if (err) {
            res.end('<h1>ejs error!</h1>');
            return;
        }
        res.end(html);
    })
})

// router.route('/pools/list').get((req, res) => {
//     req.app.render('pool_list', { pools: pools }, (err, html) => {
//         if (err) {
//             res.end('<h1>ejs error!</h1>');
//             return;
//         }
//         res.end(html);
//     })
// })

router.route('/pools/detail').get((req, res) => {
    var poolId = req.query.poolId;
    var pool = null;
    for (var p of pools) {
        if (p.poolId == poolId) {
            pool = p;
            break;
        }
    }
    req.app.render('pool_detail', { pool: pool }, (err, html) => {
        if (err) {
            res.end('<h1>ejs error!</h1>');
            return;
        }
        res.end(html);
    })
})

router.route('/pools/modify').get((req, res) => {
    var idx = req.query.idx;
    var pool = null;
    for (var p of pools) {
        if (p.idx == idx) {
            pool = p;
            break;
        }
    }
    req.app.render('pool_modify', { pool: pool }, (err, html) => {
        if (err) {
            res.end('<h1>ejs error!</h1>');
            return;
        }
        res.end(html);
    })
})

router.route('/pools/modifyDB/:idx').get((req, res) => {
    var idx = parseInt(req.params.idx);
    for (var p of pools) {
        if (p.idx == idx) {
            p.name = req.query.name;
            p.location = req.query.location;
            p.phone = req.query.phone;
            p.description = req.query.description;
            break;
        }
    }
    res.redirect('/pools/list');
})

router.route('/pools/delete').get((req, res) => {
    var idx = req.query.idx;
    pools = pools.filter(function (pool) {
        if (pool.idx == idx) return false;
        return true;
    })
    req.app.render('pool_complete', {}, (err, html) => {
        if (err) {
            res.end('<h1>ejs error!</h1>');
            return;
        }
        res.end(html);
    })
})

router.route('/').get((req, res) => {
    var host_name = null;
    if (req.query.host != null) {
        host_name = req.query.host;
    }
    req.app.render('home', { host: host_name }, (err, html) => {
        if (err) {
            res.end('<h1>ejs error!</h1>');
            return;
        }
        res.end(html);
    })
})

app.use('/', router);
const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log('http://localhost:%d', app.get('port'));
});
