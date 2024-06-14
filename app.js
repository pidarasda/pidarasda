var express = require("express");
var path = require("path");
const fs = require('fs');
const path2 = 'save.json';
var app = express();
app.use(express.static('/views/png' + '/public'));

const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' }, allowEIO3: true});
const agents = ['brimstone','viper','omen','jett','phoenix','raze','reyna','yoru','breach', 'skye', 'sova', 'cypher', 'killjoy', 'sage'];
var routes = require("./routes");
var socket;

io.on("connection", (socket) => {
  console.log("connect");
});
var routes = require("./routes");
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
app.set("port", process.env.PORT || 3000);
function save(obj)
{
  if(obj != null)
    arr.push(obj);
  fs.writeFileSync(path2, JSON.stringify(arr));
}
app.use(express.json());
app.post("/save", function (request, response) {
    var obj = request.body;
    obj.date = new Date();
    obj.agent = agents[getRandomInt(agents.length)];
	if(arr.length != 0)
    obj.id = arr[arr.length - 1].id + 1;
	else
		obj.id = 0;
    obj.check = '0';
    io.emit('message', JSON.stringify(obj));
    save(obj);
});
app.post("/deletedonate", function (request, response) {
    var obj = request.body;
    for(let i = 0; i < arr.length; i++){
      if(arr[i].id == obj.id){
        arr.splice(i, 1);
      }
    }
    save(null);
});
app.post("/setcheck", function (request, response) {
    var obj = request.body;
    console.log(obj);
    obj.id;
    for(let i = 0; i < arr.length; i++){
      if(arr[i].id == obj.id){
        if(arr[i].check == '1'){
          console.log(123);
          arr[i].check = '0';
        }
          else {
            console.log(123);
            arr[i].check = '1';
          }
      }
    }
    fs.writeFileSync(path2, JSON.stringify(arr));
});
app.get("/gettable", function(req, res){
  res.send(JSON.stringify(arr));
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(routes);
app.use(express.static('views'));
var arr = [];
if(fs.existsSync(path2))
{
  fs.readFile(path2, "utf8",
            function(error,data){
                console.log("Асинхронное чтение файла");
                if(data != ''){
                  arr = JSON.parse(data);
                }
              });
}
server.listen('3000');
