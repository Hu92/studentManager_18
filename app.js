let express = require('express');
let svgCaptcha = require('svg-captcha');
let path = require('path');
let session = require('express-session');
let bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'SZHM19';
let app = express();

app.use(express.static('static'));
app.use(session({
    secret: 'keyboard cat love west blue flower hahahaha'
}))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})
app.listenerCount('/login',(req,res) => {
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let code = req.body.code;
    if (code == req.session.captcha) {
        req.session.userInfo = {
            userName,
            userPass
        }
        res.redirect('/index');
    } else {
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("验证码失败)";window.location.herf="/login"</script>');
    }
})

app.get('/login/captchaImg', (req, res) => {
    var captcha = svgCaptcha.create();
    console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);
});

app.get('/index',(req,res) => {
    if(req.session.userInfo) {
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    } else {
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登录");window.location.href="/login"</script>');
    }
})
app.get('/logout', (req,res) => {
    delete req.session.userInfo;
    res.redirect('/login');
})

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, 'static/views/regiter.html'));  
})

app.post('/register', (req,res) => {
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    console.log(userName);
    console.log(userPass);

    MongoClient.connect(url, (err,client) => {
        const db = client.db(dbName);
        let collection = db.collection('userList');
        collection.find({
            userName
        }).toArray((err,doc)=>{
            console.log(doc);
            if(doc.length==0) {
                collection.insertOne({
                    userName,
                    userPass
                },(err,result)=>{
                    console.log(err);
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('欢迎入坑');window.location='/login'</script>");
                    client.close();
                })
            }
        })
    })
})

app.listen(7878,'127.0.0.1', () => {
    console.log('success');
})