/**
 * Lineのようなチャットシステム
 */

// 1.モジュールオブジェクトの初期化
var fs = require('fs');
var server = require('http').createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var output = fs.readFileSync('./index.html', 'utf-8');
  res.end(output);
}).listen(1080);

var io = require('socket.io').listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on('connection', function (socket) {

// 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on('connected', function (name) {
    userHash[socket.id] = name;
    for (var i in userHash) {
      io.sockets.emit('publish', {mode: 'user-add',socket_id: i,name: userHash[i]});
    }
  });

  // メッセージ送信カスタムイベント
  socket.on('publish', function (data) {
    io.sockets.emit('publish', {mode: 'message', socket_id: socket.id, name: data.name, value: data.value});
  });

  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on('disconnect', function () {
    if (userHash[socket.id]) {
      delete userHash[socket.id];
      io.sockets.emit('publish', {mode: 'user-del', socket_id: socket.id});
    }
  });
});

console.log('Run ...');
