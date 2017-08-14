    var msgLog = new Array;
    var msgId = 0;
    var msgError = null;
    var debugStatus = 1;
    var connected = false;
    var logged = false;

    function debug(message) {
        if (debugStatus) {
            console.log(message);
        }
    }

    var url = "ws://10.0.0.1:3000";
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    try {
        var socket = new WebSocket(url, ['websocket-protocol']);
        socket.onopen = onopen;
        socket.onopen.bind(this);
        socket.onclose = onclose;
        socket.onclose.bind(this);
        socket.onerror = onerror;
        socket.onerror.bind(this);
        socket.onmessage = onmessage;
        socket.onmessage.bind(this);
        debug('Connect to ' + url);
    } catch (err) {
        debug('Websocket error ' + err);
    }

    function parser(cmd, len) {
        const READING_COMMAND = 0;
        const READING_ATTRIBUTE = 1;
        const READING_VALUE = 2;
        var state = READING_COMMAND;
        var p = new Array();
        var l = cmd;
        var v = null;
        var k = 0;
        var j = 0;

        for (i = 0; i <= len; i++) {
            if (cmd.charAt(i) == ' ' || i == len) {
                switch (state) {
                    case READING_COMMAND:
                        p[k++] = l.substr(0, i);
                        l = cmd.substr(i + 1);
                        state = READING_ATTRIBUTE;
                        j = i + 1;
                        break;
                    case READING_ATTRIBUTE:
                        l = cmd.substr(i + 1);
                        j = i + 1;
                        break;
                    case READING_VALUE:
                        if (v.charAt(0) != '"' || cmd.charAt(i - 1) == '"') {
                            p[k++] = l.substr(0, i - j);
                            l = cmd.substr(i + 1);
                            state = READING_ATTRIBUTE;
                            j = i + 1;
                        }
                        break;
                }
            } else if (cmd.charAt(i) == ':') {
                if (state == READING_ATTRIBUTE) {
                    v = cmd.substr(i + 1);
                    state = READING_VALUE;
                }
            }
        }

        return p;
    }

    // Socket
    function sendMessage(msg) {
        if (!connected) return;
        debug('=> ' + msg);
        msg += "\r\n\r\n";
        socket.send(msg);
    }

    function reconnect() {
        loginTimer = false;
        try {
            socket = new WebSocket(url, ['websocket-protocol']);
            socket.onopen = onopen;
            socket.onopen.bind(this);
            socket.onclose = onclose;
            socket.onclose.bind(this);
            socket.onerror = onerror;
            socket.onerror.bind(this);
            socket.onmessage = onmessage;
            socket.onmessage.bind(this);
            debug('Retry to connect to ' + url);
        } catch (err) {
            debug('Websocket error ' + err);
        }
    }

    function disconnect() {
        if (socket != false) {
            socket.close();
        }
    }

    function onopen() {
        debug('Connected');
        connected = true;

        //login
    }

    function onclose(e) {
        debug('Disconnected');

        connected = false;
        logged = false;
        socket = false;

        // Try to reconnect ??
    };

    function onerror(e) {
        debug('Error ');
        debug(e);

        // Try to reconnect ??
    }

    function onmessage(e) {
        var msg = e.data;
        msg = msg.replace(/\r\n\r\n/, '');


        var params = parser(msg, msg.length);
        debug('<= ' + params);

        var rdata = msg_to_json(params);

        switch(params[0]) {
          case 'STATUS':
              msg = "STATUS";
              sendMessage(msg);
              break;

          case 'LOGIN':
              debug(params[0]);
          break;

          default:
              debug("Comando: "+params[0]+" nao implementado!");
        }

        //debug('Parser: ' + JSON.stringify(params));
    }

    function login(user, pass, external) {
        if (!connected || logged) return;
        if (external) { 
            msg = 'LOGIN USER:'+user+' PASSWORD:'+pass+' EXTERNAL:TRUE';
        } else { 
            msg = 'LOGIN USER:'+user+' PASSWORD:'+pass;
        }
        debug("sendMessage: "+msg);
        sendMessage(msg);
    }


    function getDevices() {
        if (!logged) return;
        msg = 'DEVICES';
        sendMessage(msg);
    }

    function getContact(name, number) {
        if (!logged) return;
        if (name != '') {
            var msg = 'CONTACT NAME:'+name+' NUMBER:'+number;
        } else {
            var msg = 'CONTACT NUMBER:'+number;
        }
        sendMessage(msg);
    }

    function getHistory() {
        if (!logged) return;
        msg = "HISTORY LIMIT:50";
        sendMessage(msg);
    }



