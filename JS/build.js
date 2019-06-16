const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require("escodegen");
const fs = require("fs");


fs.exists("source",function (exists) {
	if(exists){
		console.log("该文件夹已经存在");
	}else {
		fs.mkdir("source",0777,function (err) {
			if(err){
				return console.log(err);
			}else {
				console.log("创建成功");
			}
		})
	}
})

fs.readdir("./",function (err,data) {
	if(err){
		console.log(err);
	}else {

		let files = JSON.parse(JSON.stringify(data));
		if (files){
			console.log("----------------------遍历JS源文件------------");
			files.forEach((filename)=>{

				if (filename.endsWith(".js") && filename === "main.js"){
					if(filename === "build.js"){return}
					if(filename === "TTPatch.js"){return}

					console.log("->"+filename.toString());
					let filePath = "./source/"+filename;
					fs.unlink(filePath,function (err) {
						if(err){
							console.log(filename+"删除失败");
							return console.log(err);
						}else {
							console.log(filePath+"删除成功");
						}
					})
					fs.readFile(filename.toString(),function (err,data) {
						if(err){
							console.log("----------------------读取"+filename);
							return console.log(err);
						}else {

							//toString() 将buffer格式转化为中文
							let code = transformCode(data.toString());
							console.log("----------------------转换："+filename+
								"\n->路径："
								+filePath
							+"\n--------------"
							);
							//       要写入的文件   要写入的内容       a追加|w写入（默认）|r（读取）  回调函数
							fs.writeFile(filePath,code.toString(),{flag:"w"},function (err) {
								if(err){
									console.log("----------------------写入失败"+filename);
									return console.log(err);
								}else {
									console.log(filename+" 转换完成~！");
								}
							})
						}
					})

				}
			})
		}
	}
})

const ast = "";
// 转换JS代码为可执行代码
function transformCode(code) {
	console.log(code+"\n code------");
	const ast = esprima.parseScript(code);
	console.log(ast+"\n AST---------");
	const transformCode = escodegen.generate(ast)
	console.log(transformCode+"\n ---------");
	return transformCode
}




//AST解析
estraverse.traverse(ast, {
	enter: function (node) {
		const name = node.name;
		// console.log('----------------\n' + JSON.stringify(node) + '\n')
		switch (node.type){
			case "Identifier":{
				if (name === "view"){
					node.name = "call('view')"
				}
				// node.name = "call("+name+")";
			}break;
			case "MemberExpression":{

			}break;
			case "CallExpression":{
				if (node.callee && node.callee.object){

					console.log('*******'+JSON.stringify(node));
					let newCallee = node.callee;
						// JSON.parse(JSON.stringify(node.callee));

					node.arguments.splice(0,0,createNode(node.callee.property.name))
					node.callee.property.name = "call";
						// {
						// 	"type":"Identifier",
						// 	"name":"call"
						// }
				}
			}break;
		}
	},
	Identifier(path) {
		const name = path.node.name;
		console.log('Identifier-----' + JSON.stringify(path.node))
		if (path.node.name === 'call') {
			console.log('Identifier-----' + JSON.stringify(path.node))
			path.findParent((superPath) => {
				// console.log('-----'+superPath.node.name)
			});

		}

		if (path.key === 'property') {
			let name = path.node.name;
			path.node.name = "call";
			path.node.loc.identifierName = "call";
		}
	}
});


function createNode(func) {
	return  {
		"type":"Literal",
		"value":func,
		"raw":func
	}
}


// Js 判断后缀
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Js 判断前缀
if (typeof String.prototype.startsWith != 'function') {
	// see below for better implementation!
	String.prototype.startsWith = function (str){
		return this.indexOf(str) == 0;
	};
}

// Js 判空(含全部是空格)
String.prototype.IsNullEmptyOrSpace = function()
{
	if (this== null) return true;
	return this.replace(/s/g, '').length == 0;
};