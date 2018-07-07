const express = require('express')
const path = require('path')
const config = require('./config/db');
const app = express();


app.set('views',path.join(__dirname,'views'));

app.engine('html',require('express-art-template'));

app.set('view engine','html');

app.use(express.static(path.join(__dirname,'public')));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}))


//mysql config
const query = require('simple-mysql-query');
query(config);

const index = require('./routes/index')
app.get('/',index);
app.get('/list/:id',index);
app.post('/repo',index);

app.post('/author',index);
//404
app.use(function(req,res,next){

});

app.listen(3000,()=>{
	console.log(`server was running at port 3000`)
})