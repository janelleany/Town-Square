var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const fs = require('fs');
var app = express();

const pg = require('pg-promise')(); // immediately invoke
const readline = require('readline');
const promisify = require('util').promisify;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



var staticPath = path.join(__dirname, '/public');

//Sets up static folder with html,css,js 
app.use(express.static(staticPath));

app.listen(3000, function() {
  console.log('Server running on port 3000');
});

app.post('*', upload.single('video'), function (req, res, next) {
  // req.file is the `avatar` file 
  // req.body will hold the text fields, if there were any 

})







//            ##########  Kyle ######


let userid = 1; // WORKING VALUE FOR USER ID to be changed to actual user's id

// database stuff
const dbConfig = 'postgres://kboot@localhost:5432/townsquare_db';
const db = pg(dbConfig);


// search threads by id
let findPostById = id => {
    console.log(id);
    return db.query(`select * from posts where id = '${id}'`);
};

// get all threads from db
let getAllThreads = () => {
    return db.query(`select * from threads;`)
};
// let getAllThreadsAsPromise = promisify(getAllThreads);

// insert new post
let insertNewPost = post => {
    db.query(`insert into posts (videopath, timestamp, user_id, thread_id)
        VALUES('${post.videopath}', '${post.timestamp}, '${post.userid}, '${post.threadid}')`);
};

// delete post by id
let deletePost = id => {
    db.query(`DELETE from townsquare_db.posts where id = ${id};`);
};

// convert readline to promise form
let rlQuestionAsPromise = function(question) {
    return new Promise(function(resolve) {
        rl.question(question, resolve);
    });
}

let lookupEntry = function () {
    rl.question('Post id: ', function (id) {
        findPostById (id);
        mainMenu();
    });
}

let setEntry = function () {
    var post = {};
    rlQuestionAsPromise('Video path: ')
        .then(function(data) {
            post.videopath = data.toString();
            
            return rlQuestionAsPromise('user_id, thread_id: ')
        }).catch((error)=>{console.log('error: ', error);
        })
        .then(function(data) {
            post.userid = data.split(',')[0];
            console.log('userid: ', post.userid);
            
            post.threadid = data.split(',')[1];
            post.timestamp = ( new Date().getTime() ).toString();
        }).catch((error)=>{console.log('error: ', error);
    })
        .then(function() {
            insertNewPost(post);
            mainMenu();
        }).catch((error)=>{console.log('error: ', error);
    });
};

let deleteEntry = function () {
    rlQuestionAsPromise('Post id: ')
        .then( (id) => {
            findPostById(id);
        })
        .then( data => {
            deletePost(data);
        })
        .then( () => {
            mainMenu();
        });
}

let displayEntries = function () {
    getAllThreads()
    .then((results) => console.log(results))
    .then( () => {
        mainMenu();
    });
};


let mainMenu = function () {
    rl.question(`
    
    
    ` +      '1. Look up an entry\n' +
             '2. Set an entry\n' +
             '3. Delete an entry\n' +
             '4. List all entries\n' +
             '5. Quit\n' +
             'What do you want to do (1-5)?\n', function (choice) {
        parsedInt = parseInt(choice);
        switch (parsedInt) {
            case 1:
                //console.log('look up entry');
                lookupEntry();
                break;
            case 2:
                setEntry();
                //console.log('set an entry');
                break;
            case 3:
                deleteEntry();
                //console.log('delete entries');
                break;
            case 4:
                displayEntries();
                //console.log('list all entries');
                break;
            case 5:
                rl.close();
                break;
            default:
                console.log('That\'s not one of the options.');
                mainMenu();
                break;
        }
    });
}

mainMenu();