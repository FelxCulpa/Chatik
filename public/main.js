(function() {
	var socket = io.connect();
	var $messageForm = $('#message-form');
	var $message = $('#message');
	var $chat = $('#chat');
	var $messageArea = $('#message-area');
	var $users = $('#users');
	var $onlineUsersHeader = $('#online-users-header');
	let typing = false;
    let timerID;

	function tmFunc() {
		typing = false;
		socket.emit("stop typing");
	}

	$messageForm.submit(function(e) {
		e.preventDefault();
		socket.emit('send message', $message.val());
		$message.val('');
	});
	$message.on('input', e => {
		if(!typing) {
			typing = true;
			socket.emit('ityping');
			timerID = setTimeout(tmFunc, 3000);
		} else {
			clearTimeout(timerID);
			timerID = setTimeout(tmFunc, 3000);
		}
	});
	
	socket.on('new message', function(data) {
		var currentHours = new Date().getHours() > 9 ? new Date().getHours() : ('0' + new Date().getHours())
		var currentMinutes = new Date().getMinutes() > 9 ? new Date().getMinutes() : ('0' + new Date().getMinutes())
		data.msg ? (
			$chat.append(`<li>[${currentHours}:${currentMinutes}]<strong> ${data.user}: </strong>${data.msg}</li>`) )
			: alert('Blank message not allow!');
	});
	
	socket.on('typing', (data) => {
		$chat.append(`<li id="typing"><em>${data}</em></li>`);
		
	})
	socket.on('stopped', () => $('#typing').remove());
	
	
	socket.on('get userList', function(data) {
		var html = '';
		for (i = 0; i < data.length; i++) {
			html += `<li class="list-item"><strong>${data[i]}</strong></li>`;
		}
		$onlineUsersHeader.html(`<span class="card-title"> Users in the room: </span><span class="label label-success">${data.length}</span>`);
		$users.html(html);
	});

	socket.on('logout', function(data) {
      socket.disconnect();
      alert("You logged out");
      window.location.reload();
    });

      let emit = socket.emit;
      socket.emit = function(event) {
      console.log(event);
      return emit.apply(this, arguments);
    };

})();
