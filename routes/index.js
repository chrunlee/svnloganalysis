const express = require('express')

const router = express.Router();
const query = require('simple-mysql-query')

router.get('/',(req,res,next)=>{
	
	//获得repo
	const list = {sql : 'select * from repo',params : []};
	query(list).then( list => {
		const rs = list[0];
		res.render('index',{repo : rs});
	})
})

router.get('/list/:id',(req,res,next) => {
	const sql = [{
		sql : "select * from repo where id=?",
		params : [req.params.id]
	},{
		sql : 'select author from commits where repoid=? group by author',
		params : [req.params.id]
	}];
	query(sql).then(function(list){
		var rs = list[0];
		var authors = list[1];
		res.render('view',{repo : rs[0],authors : authors})
	})
})

//获得所有信息
router.post('/repo',(req,res,next) => {
	const id = req.body.id;
	const type = req.body.type;
	const sql = {
		sql : type=='C' ? "select count(z.version) as count,z.committime from (select DATE_FORMAT(committime,'%Y-%m-%d') as committime,version from commits where repoid=? group by DATE_FORMAT(committime,'%Y-%M-%D'),version) z group by z.committime order by committime asc" : "SELECT DATE_FORMAT(committime, '%Y-%m-%d') AS committime, count(1) AS count FROM commits WHERE repoid = ? AND modetype = ? GROUP BY DATE_FORMAT(committime, '%Y-%M-%D') ORDER BY committime ASC",
		params : type=='C' ? [id] : [id,type]
	};
	query(sql).then(function(list){
		var rs = list[0];
		res.end(JSON.stringify(rs));
	});
})
//贡献者
router.post('/author',(req,res,next) => {
	const id = req.body.id;
	const author = req.body.author;
	const type = req.body.type;
	//获得一个作者的所有信息，包括：所有提交量+删除+添加+修改
	const sql = [{
		sql : type == 'C' ? "select count(z.version) as count,committime from (select DATE_FORMAT(committime,'%Y-%m-%d') as committime,version from commits where repoid=? and author =? group by DATE_FORMAT(committime,'%Y-%m-%d'),version) z group by committime order by committime asc" : "SELECT DATE_FORMAT(committime, '%Y-%m-%d') AS committime, count(1) AS count FROM commits WHERE repoid = ? AND modetype = ? and author=? GROUP BY DATE_FORMAT(committime, '%Y-%M-%D') ORDER BY committime ASC",
		params : type == 'C' ? [id,author] : [id,type,author]
	},{
		sql : 'select count(distinct version) as commits,count(modetype) as count,modetype from commits where repoid=? and author = ? group by MODEtype',
		params : [id,author]
	}];
	query(sql).then( list =>{
		const all = list[0];
		const rs = list[1];
		res.end(JSON.stringify({data : all,info : rs}));
	});
})

module.exports = router;