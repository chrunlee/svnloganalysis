//扫描SVN log信息，并保存到数据库
const query = require('simple-mysql-query');

query(require('./config/db'))

const SVN = require('svnlog');

// edit
const filepath = 'E:/东华项目资料/代码仓库/byyResource',
	des = '资源学习';

const client = new SVN(filepath);//name ?

const async = require('async');

var repoInfomation = null;
//First : insert svn info to db
client.info().then( info => {
	repoInfomation = info;
	let sql = {
		sql : 'insert into repo (id,version,repo,name) values (?,?,?,?)',
		params : [info.id,info.version,info.repo,des]
	};
	let ssql = {
		sql : 'select * from repo where id=? ',
		params : [info.id]
	};
	let usql = {
		sql : 'update repo set version=?,repo=?,name=? where id=? ',
		params : [info.version,info.repo,des,info.id]
	};
	return query(ssql).then(function(rs){
		if(rs[0].length > 0){
			//update
			return query(usql);
		}else{
			//insert
			return query(sql);
		}
	})
})
//get log
.then( rs => {
	return client.getLog()
})
//Second : fetch log information and insert it
.then( data => {
	async.mapLimit(data,10,function(item,cb){
		let sql = {
			sql : 'insert into commits (repoid,author,filepath,committime,version,modetype) values (?,?,?,?,?,?) ',
			params : [repoInfomation.id,item.author,item.path,item.time,item.version,item.mode]
		};
		query(sql).then(rs=>{
			cb(null);
		}).catch(e=>{
			cb(e)
		})
	},function(err){
		console.log('infomation of log has been inserted')
		process.exit();
	})
})
.catch(e => console.log(e))