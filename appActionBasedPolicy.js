var flash = require('connect-flash')
, express = require('express')
, passport = require('passport')
, util = require('util')
, LocalStrategy = require('passport-local').Strategy
, authorizator = require('authorizator')
, ActionBasedPolicy = authorizator.ActionBasedPolicy;

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com', role: 'admin' }
    , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com', role: 'user' }
];

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn) {
    var i
    , l;
    for (i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            findByUsername(username, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                if (user.password !== password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            });
        });
    }
));

var app = express();

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(authorizator.initialize({role: 'user.role'}));
    app.use(express.static(__dirname + '/../../public'));
});

// We use ActionBasedPolicy to authorize users
authorizator.use(ActionBasedPolicy);

// We add two roles, and we say what actions they can execute
var user = authorizator.addRole('user').can('view home page');
var admin = authorizator.addRole('admin').can('view account', 'delete users', 'add users');

// authorizing users
app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

// authorizing users
app.get('/account', authorizator.wants('view account'), function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.flash('error') });
});

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        res.redirect('/');
    }
);

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000, function() {
    console.log('ready on port 3000');
});
