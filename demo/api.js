
const CALL_DIRECTION_INCOMING = 0;
const CALL_DIRECTION_OUTGOING = 1;

var pause = 0;
var msgLog = new Array;
var msgId = 0;
var msgError = null;
var debugStatus = 1;
var connected = false;
var logged = false;
var socket = null;
var permissions = 0;
var debugenable = false;
var ag_logged = false;
var gcallid = null;
var in_transfer = false;
var onlycallevts = false;

function debug(message) {
    if (debugStatus) {
        if(onlycallevts == false)
            console.log(message);
    }
}

function websocket_connetc(url) {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
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
        debug('Connect to ' + url);
    } catch (err) {
        debug('Websocket error ' + err);
    }
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
    if (!connected) {
        alert("Sent..But disconnected!");
        return;
    }
    debug('=> ' + msg);
    msg += "\r\n\r\n";
    socket.send(msg);
}

function disconnect() {
    if (socket != false) {
        socket.close();
    }

}

function onopen() {
    debug('Connected');
    connectionStatus.text('Conectado');
    requestButton.removeAttr('disabled');
    requestMessagearea.removeAttr('disabled');
    dialArea.removeAttr('disabled');
    requestDialOrigem.prop( "disabled", false );
    requestDialNumber.removeAttr('disabled');
    requestDialButton.removeAttr('disabled');
    commandsArea.removeAttr('disabled');
    cmdContatos.removeAttr('disabled');
    cmdCallHist.removeAttr('disabled');
    cmdRecords.removeAttr('disabled');
    cmdAgents.removeAttr('disabled');

    $("#contentt").show();
    $('#debug').trigger('click');

    connected = true;

    var user = serverUser.val();
    var pass = serverPass.val();
    var ext = serverExt.is(":checked") ? true : false;
    login(user,pass, ext);
}

function onclose(e) {
    debug('Disconnected');
    clearLog();
    connected = false;
    logged = false;
    socket = false;

    $('#debug').trigger('click');
    connectionStatus.text('Desconectado');
    requestButton.attr('disabled', 'disabled');
    requestMessagearea.attr('disabled', 'disabled');
    dialArea.attr('disabled', 'disabled');
    requestDialOrigem.prop('disabled', true);
    requestDialNumber.attr('disabled', 'disabled');
    requestDialButton.attr('disabled', 'disabled');
    commandsArea.attr('disabled', 'disabled');
    cmdContatos.attr('disabled', 'disabled');
    cmdCallHist.attr('disabled', 'disabled');
    cmdRecords.attr('disabled', 'disabled');

    serverUrl.removeAttr('disabled');
    connectButton.show();
    disconnectButton.hide();
    messageArea.attr('disabled', 'disabled');
    requestButton.attr('disabled', 'disabled');
    cmdAgents.attr('disabled', 'disabled');

    $("#contentt").hide();

     ag_logged = false;

    // Try to reconnect ??
};

function onerror(e) {
    debug('Error ');
    debug(e);

    // Try to reconnect ??
}

function function_call_end(){
    dialStatus.text("Chamada finalizada!");
    gcallid = null;
    $("#requestXferButton").attr('disabled', 'enabled');
    $("#TransferModal").modal('hide');
}

function call_tab_status(callid,caller,called,state)
{
        const ctab = document.getElementById("tbcalls");

	if (ctab.rows[callid]) {

		let row = ctab.rows[callid];
		if(state == 'cleared') {
			row.parentNode.removeChild(row);
		}else {
			let st = row.cells[3];
			st.innerHTML = state;
		}

	} else {
		if(state == 'cleared')
			return;

		let row = ctab.insertRow();
		row.id = callid;
		let id = row.insertCell(0);
		id.innerHTML = callid;

		let src = row.insertCell(1);
		src.innerHTML = caller;

		let dst = row.insertCell(2);
		dst.innerHTML = called;

		let st = row.insertCell(3);
		st.innerHTML = state;
	}
}

function recv_event_xfer(cmd, params) {

	     resp = "??";
             for (i = 1; i < params.length; i++) {   
                if (params[i].match(/RESP:/)) {
                    resp = params[i].substr(5);
                }
             }

             addMessage("Transfer: "+cmd+" Status: "+resp);

	     if(resp == "OK") {

	             if(cmd == 'BLIND_TRANSFER') {
        	        $("#TransferModal").modal('hide');
	             }else {
			if($("#TransferExec").val() == "desligar") {
				$("#TransferModal").modal('hide');
				$("#TransferExec").val("transferir");
				$("#TransferExec").text('Transferir');
				alert("Transferência realizada!!");
			} else {
				$("#TransferExec").text('Finalizar Chamada de Consulta');
				$("#TransferExec").prop('value','desligar');
			}
	             }
             } else {
			$("#TransferModal").modal('hide');
			$("#TransferExec").val("transferir");
			$("#TransferExec").text('Transferir');
			alert("Erro na transferência!");
             }

}

function recv_event_call(params) {

    var callid = null;
    var state = null;
    var caller = null;
    var called = null;
    var cause = 0;
    var conferencing = null;
    var added = null;
    var transferring = null;
    var transferred = null;
    var newCallID = null;
    var diverting = null;
    var newDestination = null;
    var releasing = null;
    for (i = 1; i < params.length; i++) {
        if (params[i].match(/CALLID:/)) {
            callid = params[i].substr(7);
        } else if (params[i].match(/STATE:/)) {
            state = params[i].substr(6);
        } else if (params[i].match(/CALLING:/)) {
            caller = params[i].substr(8);
        } else if (params[i].match(/CALLED:/)) {
            called = params[i].substr(7);
        } else if (params[i].match(/CAUSE:/)) {
            cause = params[i].substr(6);
        } else if (params[i].match(/CONFERENCING/)) {
            conferencing = params[i].substr(13);
        } else if (params[i].match(/ADDED:/)) {
            added = params[i].substr(6);
        } else if (params[i].match(/TRANSFERRING:/)) {
            transferring = params[i].substr(13);
        } else if (params[i].match(/TRANSFERRED:/)) {
            transferred = params[i].substr(12);
        } else if (params[i].match(/NEWCALLID/)) {
            newCallID = params[i].substr(10);
        } else if (params[i].match(/DIVERTING/)) {
            diverting = params[i].substr(10);
        } else if (params[i].match(/NEWDESTINATION/)) {
            newDestination = params[i].substr(15);
        } else if (params[i].match(/RELEASING/)) {
            releasing = params[i].substr(10);
        }
    }
    debug('OCall event callid:'+callid+' state:'+state+' caller:'+caller+' called:'+called);
    addMessage('OCall event callid:'+callid+' state:'+state+' caller:'+caller+' called:'+called);
    gcallid = callid;

    if (callid && state)
    	    call_tab_status(callid,caller,called,state);

    if (callid && state) {

        switch(state) {
            case 'initiated':
            dialStatus.text("Discando - " + state);
            break;

            case 'delivered':
            dialStatus.text("Discando - " + state);
            break;

            case 'established':
            dialStatus.text("Atendida - " + state);
            $("#requestXferButton").removeAttr('disabled');
            break;

            case 'queued':
            dialStatus.text("Atendida - " + state);
            break;

           case 'failed':
           dialStatus.text("Falha - " + state);
           break;

           case 'cleared':
           dialStatus.text("Finalizada - " + state);
           setTimeout(function_call_end, 2000);
           break;

            case 'conferenced':
            dialStatus.text("Atendida - " + state);
            break;

           case 'transferred':
           dialStatus.text("Atendida - " + state);
           setTimeout(function_call_end, 2000);
           break;

           case 'diverted':
           dialStatus.text("FWD - " + state);
           setTimeout(function_call_end, 2000);
           break;

           default:
        }
      }
    }

    function recv_event_login(params) {

            msgError = '';
            for (i = 1; i < params.length; i++) {
                if (params[i].match(/PERMISSIONS:/)) {
                    permissions = params[i].substr(12);
                } else if (params[i].match(/DIAL:/)) {
                    dialString = params[i].substr(5);
                } else if (params[i].match(/RESP:/)) {
                    logged = params[i].substr(5) == "OK" ? true : false;
                } else if (params[i].match(/ERROR:/)) {
                    msgError = params[i].substr(6);
                    msgError = msgError.replace(/\"/g, '');
                }
            }
            if(logged == false) {

                addMessage(msgError);
                alert(msgError);
                connectButton.show();
                connectionStatus.text('Desconectado');
                serverUrl.removeAttr('disabled');
                disconnectButton.hide();
                messageArea.attr('disabled', 'disabled');
                requestButton.attr('disabled', 'disabled');

                clearLog();
                disconnect();
            } else {
                if(permissions & 0x01) { // Operator...
                    sendMessage("DEVICES");
                } else {
                    $('#requestDialOrigem').append($('<option>', {
                        value: serverUser.val(),
                        text: serverUser.val()
                    }));
                }
                connectionStatus.text('Conectado / Logado');
                serverUrl.attr('disabled', 'disabled');
            }
    }

/**
    ami_req_agentLoggedOn = 0,
    ami_req_agentLoggedOff = 1,
    ami_req_agentNotReady = 2,
    ami_req_agentReady = 3,
    ami_req_agentWorkingAfterCall = 4

    ami_agentNotReady = 0,
    ami_agentNull = 1,
    ami_agentReady = 2,
    ami_agentBusy = 3,
    ami_agentWorkingAfterCall = 4

*/
    function agente_set_state(state) {

        if(state == 0)
            return "Pausa";
        if(state == 1)
            return "Desconectado";
        if(state == 2)
            return "Conectado";
        if(state == 3)
            return "Ocupado";
        if(state == 4)
            return "Pós atendimento";

        return "Desconhecido!";
    }

    function recv_event_send_message(params) {
        if(onlycallevts == false)
            console.log(params);
    }

    function recv_event_message(params) {
        if(onlycallevts == false)
            console.log(params);
        var dev = "";
        var id = "";
        var st = "";
        var error = "";
        var message = 0;
    for (i = 1; i < params.length; i++) {
        if (params[i].match(/DEV:/)) {
            dev = params[i].substr(4);
        } else if (params[i].match(/ID:/)) {
            id = params[i].substr(3);
        } else if (params[i].match(/STATUS:/)) {
            st = params[i].substr(7);
        } else if (params[i].match(/ERROR:/)) {
            error = params[i].substr(6);
        } else if (params[i].match(/MESSAGE:/)) {
            message = params[i].substr(8);
        }
    }
    if(onlycallevts == false) {
        debug('Message event DEV:'+dev+' ID:'+id+' STATUS:'+st+' ERR:'+error+' MESSAGE:'+message);
        addMessage('MSG STAUTS DEV:'+dev+' ID:'+id+' STATUS:'+st+' ERR:'+error+' MESSAGE:'+message);
    }
    }



    function recv_event_apause(params) {
        for (i = 1; i < params.length; i++) {
            if (params[i].match(/PAUSE:/)) {
                var h = params[i].substr(6);
                h = h.replace(/\"/g, '');
                h = h.replace(/\;/g, '');
                h = h.split(',');
                for (i = 0; i < h.length; i++) {
  	            $("#nomepausa").append(new Option(h[i+1], h[i]));
                    i++;
                }
            break;
            }
        }
    }

    function recv_event_agent(params) {

	    ag_logged = false;
            msgError = '';
	    var inst = null;
	    var state = 1;
	    pauseopt = null;
            for (i = 1; i < params.length; i++) {
                if (params[i].match(/ID:/))
                    id = params[i].substr(3);
                if (params[i].match(/STATE:/))
                    state = params[i].substr(6);
                if (params[i].match(/GROUP:/))
                    group = params[i].substr(6);
                if (params[i].match(/GROUP:/))
                    time = params[i].substr(5);
                if (params[i].match(/INST:/))
                    inst = params[i].substr(5);
                if (params[i].match(/PAUSE:/)) {
                    pauseopt = params[i].substr(6);
		}
                if (params[i].match(/RESP:/)) {
                    ag_logged = params[i].substr(5) == "OK" ? true : false;
                    if( params[i].substr(5) == "ERROR"){
                        alert("Agent login errro!");
                        $("#ag_connectButton").show();
                        $("#ag_disconnectButton").hide();
                    }
                }
            }
	    if(state != 1)
                ag_logged = true;

	    agst = agente_set_state(state);

            if(pauseopt != null)
                pause = pauseopt;

            if(ag_logged == false) {

                $("#ag_connectionStatus").text(agst);
                $("#ag_connectButton").show();
                $("#ag_disconnectButton").hide();
                $("input[name=agent_id]").removeAttr('disabled');
                $("input[name=agent_pass]").removeAttr('disabled');
                $("#ag_pauseButton").hide();
                $("#ag_unpauseButton").hide();
                $("#agentpause").hide();
            } else {
                $("#ag_connectButton").hide();
                $("#ag_disconnectButton").show();
                $("#ag_connectionStatus").text(agst);
                $("input[name=agent_id]").attr('disabled', 'enabled');
                $("input[name=agent_pass]").attr('disabled', 'enabled');
                $("#ag_pauseButton").show();
                $("#ag_unpauseButton").hide();
                $("#agentpause").show();

            }


	    if(state == 0) {
                $("#ag_pauseButton").hide();
                $("#ag_unpauseButton").show();
		$('#nomepausa').val(pause);
		$('#nomepausa').prop('disabled', 'disabled');
            } else {
		$('#nomepausa').removeAttr('disabled');
	    }
    }


    function recv_event_date(params) {

             var date = "00/00/0000";
             var time = "00:00:00";
             for (i = 1; i < params.length; i++) {   
                if (params[i].match(/DATE:/)) {
                    date = params[i].substr(5);
                } else if (params[i].match(/TIME:/)) {
                    time = params[i].substr(5);
                }
             }
             addMessage("TIME: "+time+" DATE: "+date);
    }

    function addTableContacts(contact) {
	//data[1],data[2],data[3],data[6]);
        const ctab = document.getElementById("tbcontacts");
	let row = ctab.insertRow();
	let name = row.insertCell(0);
	name.innerHTML = contact[1];
	let type = row.insertCell(1);
	type.innerHTML = contact[2];
	let num = row.insertCell(2);
	num.innerHTML = contact[3];
	let comp = row.insertCell(3);
	comp.innerHTML = contact[6];

    }

    function recv_event_contacts(params) {

            if (params[1].match(/CONTACTS:/)) {
                var p = params[1].substr(9);
                p = p.replace(/\"/g, '');
                p = p.split(';');
                var contacts = new Array();
                var k = 0;
                for (i = 0; i < p.length; i++) {
                    var data = p[i].split(',');
                    if (data.length < 11) {
                        continue;
                    }   
                    // Name
                    if (data[1].length > 27) {
                        data[1] = data[1].substring(0, 28) + '...';
                    }   
                    // Obs
                    var remark = '';
                    if (data.length > 11) {
                        remark = unescape(data[11]);
                        if (remark.length > 27) {
                            remark = remark.substring(0, 27)+'...';
                        }   
                    }   

                    addMessage("Nome:"+data[1]+" Numero:"+data[3]+" Email:"+data[4]);
                    addTableContacts(data);
                }                     
            } 
    }

    function change_queue_tab(id, aa, tc, ca, cna, tt, tee, tea)
    {

        const ctab = document.getElementById("tbqueues");

	if (ctab.rows[id]) {

		let row = ctab.rows[id];
		row.parentNode.removeChild(row);

	}
	let row = ctab.insertRow();
	row.id = id;

	let rid = row.insertCell(0);
	rid.innerHTML = id;
	let raa = row.insertCell(1);
	raa.innerHTML = aa;
	let rtc = row.insertCell(2);
	rtc.innerHTML = tc;
	let rca = row.insertCell(3);
	rca.innerHTML = ca;
	let rcna = row.insertCell(4);
	rcna.innerHTML = cna;
	let rtt = row.insertCell(5);
	rtt.innerHTML = tt;
	let rtee = row.insertCell(6);
	rtee.innerHTML = tee;
	let rtea = row.insertCell(7);
	rtea.innerHTML = tea;

    }


	function toHHMMSS(seconds) {
    	var h, m, s, result='';
	    h = Math.floor(seconds/3600);
    	seconds -= h*3600;
	    if(h){
    	    result = h<10 ? '0'+h+':' : h+':';
	    }
	    m = Math.floor(seconds/60);
    	seconds -= m*60;
	    result += m<10 ? '0'+m+':' : m+':';
	    s=seconds%60;
    	result += s<10 ? '0'+s : s;
	    return result;
	}

    function recv_event_queue(params) {

            if (params[0].match(/QUEUE/)) {


                var data = params;
		var n = Number(data[3].substr(4));
		var a = Number(data[4].substr(6))
		var t = n + a;
		str = "=========== Fila: " + data[1] + " ===========\n";
                str = str + "        Agentes Ativos:" + data[2].substr(4)+"\n";
                str = str + "     Total de chamadas:" + t + "\n";
                str = str + "    Chamadas Atendidas:" + data[3].substr(4)+"\n";
                str = str + "Chamadas não Atendidas:" + data[4].substr(6)+"\n";
                str = str + "           Tempo Total:" + toHHMMSS(data[5].substr(4)) + "\n";
                str = str + "      Tempo em Espera :" + toHHMMSS(data[6].substr(4)) + "\n";
                str = str + "  Tempo em Atendimento:" + toHHMMSS(data[7].substr(4)) + "\n";
		str = str + "\n";
                addMessage(str);

		var  aa = data[2].substr(4);
		var  tc = t;
		var  ca = data[3].substr(4);
		var cna = data[4].substr(6);
		var  tt = toHHMMSS(data[5].substr(4));
		var tee = toHHMMSS(data[6].substr(4));
		var tea = toHHMMSS(data[7].substr(4));

		change_queue_tab(data[1], aa, tc, ca, cna, tt, tee, tea);
            } 
    }


    function recv_event_history(params) {
            if (params[1].match(/CALLS:/)) {
                var size = history.length;
                var h = params[1].substr(6);
                h = h.replace(/\"/g, '');
                h = h.split(';');
                for (i = 0; i < h.length; i++) {
                    var c = h[i].split(',');
                    if (c.length < 7) {
                        continue;
                    }
                    // Direction
                    var direction;
                    if (c[2] == '-') {
                       var user = serverUser.val();
                        if (c[0] == user) {
                            direction = "Entrante";
                        } else {
                            direction = "Sainte";
                        }
                    } else if (c[2] == "IN") {
                        direction = "Entrante";
                    } else {
                        direction = "Sainte"; 
                    }

                    addMessage(c[0]+" - "+c[1]+" - "+direction+" - "+c[7]);
                }
            }
    }

    function rec_tab_add(data) {
        const ctab = document.getElementById("tbrecs");
	let row = ctab.insertRow();

	let name = row.insertCell(0);
	name.innerHTML = data[1];
	let src = row.insertCell(1);
	src.innerHTML = data[2];
	let dst = row.insertCell(2);
	dst.innerHTML = data[3];

	let dir = row.insertCell(3);
        if(data[4] == 'IN') {
           direcao='Recebida';
        } else if(data[4] == 'OUT'){
           direcao='Efetuada';
        }else
           direcao='Efetuada';
	dir.innerHTML = direcao;

	let dur = row.insertCell(4);
	dur.innerHTML = data[7];
	let rec = row.insertCell(5);
	var l = data[8].replace("utech/gravacoes","");;
	var lock = (data[7] == 0) ? " disabled " : "";
	var serv = serverUrl.val()
	serv = serv.replace("ws://","");
	serv = serv.replace(/:.*/, "");
        rec.innerHTML = '<a href="http://'+serv+'/storage' + l +'" target="_blank" class="btn btn-primary btn-sm active '+ lock +' " role="button" aria-pressed="true">Grav</a>';


    }


    function recv_event_records(params, msg) {

            if (params[1].match(/RECORDS:/)) {
                var splitMSG = msg.split('"');
                var splitRecords = splitMSG[1].split(';');
                var last = splitRecords.pop();
                lengthRecords = splitRecords.length;
                if(lengthRecords==0) {
                  addMessage('Nenhuma gravação encontrada para este número');
                  var records = new Array;
                } else {
                  var i2 = 0;
                  var records = new Array;
                  for (var i=0; i < splitRecords.length; i++){
                      splitDados = splitRecords[i].split(',');
                      if(splitDados[4]=='IN') {
                        descDirecao='Recebida';
                      } else {
                        descDirecao='Efetuada';
                      }
                      if(splitDados[1]=='') {
                        splitDados[1]='Não identificado';
                      }
                      addMessage(splitDados[1]+" - "+splitDados[2]+" - "+splitDados[3]+" - "+descDirecao+" - "+splitDados[8]);
                      rec_tab_add(splitDados);
                  }
                }
            } 
    }

    function recv_event_devices(params) {

            if (params[1].match(/DEV:/)) {
                var devices = params[1].substr(4);
                devices = devices.replace(/\"/g, '');
                devices = devices.split(',');
                for (i = 0; i < devices.length; i++) {
                    $('#requestDialOrigem').append($('<option>', {
                       value: devices[i],
                       text: devices[i]
                    }));
                }
            }
    }

    function recv_event_dial(params) {

        if (params[1].match(/RESP:OK/)) {
            dialStatus.text("Discando");
        } else {
            dialStatus.text("Erro na chamada");
        }
    }

    function onmessage(e) {
        var msg = e.data;
        var raw = msg;
        msg = msg.replace(/\r\n\r\n/, '');

        var params = parser(msg, msg.length);
        var t = getTimestampInSeconds();

    if(onlycallevts == true) {

        if(params[0] == "CALL" || params[0] == "ACALL" || params[0] == "OCALL") {
            console.log('[' + t + '] <= ' + msg);
        }

    } else {
        debug('[' + t + '] <= ' + params);
    	if(debugenable == true) {
	    	addMessage(params, "RECV");
    	}
    }
        switch(params[0]) {
          case 'STATUS':
              addMessage(params);
              msg = "STATUS";
              sendMessage(msg);
              break;

          case 'DATE':
              recv_event_date(params);
          break;

          case 'DEVICES':
              recv_event_devices(params);
          break;

          case 'LOGIN':
              addMessage(params);
              recv_event_login(params);
          break;

          case 'DIAL':
              addMessage(params);
              recv_event_dial(params);
          break;

          case 'CALL':
              recv_event_call(params);
          break;

          case 'HISTORY':
              recv_event_history(params);
          break;

          case 'RECORDS':
              recv_event_records(params, msg);
          break;

          case 'PHONEBOOK':
              recv_event_contacts(params);
          break;

          case "QUEUE":
              recv_event_queue(params);
          break;

          case "AGENT":
              recv_event_agent(params);
          break;

          case "APAUSE":
              recv_event_apause(params);
          break;

          case "BLIND_TRANSFER":
          case "ATTENDANT_TRANSFER":
              recv_event_xfer(params[0], params);
          break;

          case "MESSAGE":
              recv_event_message(params);
          break;

          case "SEND_MESSAGE":
              recv_event_send_message(params);
          break;

          default:
		debug("Comando: "+params[0]+" nao implementado!");
        }
    }

function login(user, pass, external) {
    if (!connected || logged) return;
    if (external) { 
        msg = 'LOGIN USER:'+user+' PASSWORD:'+pass+' EXTERNAL:TRUE';
    } else { 
        msg = 'LOGIN USER:'+user+' PASSWORD:'+pass;
    }
    if(onlycallevts == false)
        console.log("sendMessage: "+msg);
    addMessage(msg, 'SENT');
    sendMessage(msg);
}

function agent_login(inst, id, pass, dev, state, pause) {
    if (!connected || !logged) return;

    msg = 'AGENT INST:'+inst+' ID:'+id+' PASSWORD:'+pass+' GROUP: STATE:'+state+ ' PAUSE:'+pause;
    if(onlycallevts == false)
        console.log("sendMessage: "+msg);
    addMessage(msg, 'SENT');
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


function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');
}

function getCurrentTimestamp () {
  return Date.now()
}

function getTimestampInSeconds () {
  return Math.floor(Date.now() / 1000)
}

function startsWith(str, word) {
    return str.lastIndexOf(word, 0) === 0;
}

var clearLog = function() {
    $('#messages').html('');
}

var addMessage = function(data, type) {

    var t = getTimestampInSeconds();

    data = "[" + t + "] " + data;

    var msg = $('<pre>').text(data);
    if (type === 'SENT')
        msg.addClass('sent');
    else
        msg.addClass('recv');

    var messages = $('#messages');
    messages.append(msg);
    var msgBox = messages.get(0);
    while (msgBox.childNodes.length > 1000) {
        msgBox.removeChild(msgBox.firstChild);
    }
    msgBox.scrollTop = msgBox.scrollHeight;
}

// Server...
serverUrl = $('#serverUrl');
serverUser = $('#serverUser');
serverPass = $('#serverPass');
serverExt = $('#serverExt');
connectButton = $('#connectButton');
disconnectButton = $('#disconnectButton'); 
connectionStatus = $('#connectionStatus');

// Request commands...
requestButton = $('#requestButton');
requestMessagearea = $('#requestMessagearea');

// dial
dialArea = $('#dialArea');
dialStatus = $('#dialStatus');
requestDialOrigem = $('#requestDialOrigem');
requestDialNumber = $('#requestDialNumber');
requestDialButton = $('#requestDialButton');

// general commands...
commandsArea = $('#commandsArea');
cmdContatos = $('#cmdContatos');
cmdCallHist = $('#cmdCallHist');
cmdRecords = $('#cmdRecords');
cmdAgents = $('#cmdAgents');

// log area...
msgdebug = $('#msgdebug');
messageArea = $('#messageArea');
clearButton = $('');

$('#clearMessage').click(function(e) {
    clearLog();
});

$("#TransferExec").click(function(e) {
    var xferdst = $("input[name=TransferRml]").val();
    var xfertyp = $("select[name=TransferType]").val();

    if(xfertyp == 1) {
        sendMessage("BLIND_TRANSFER CALLID:" + gcallid + " TO:" + xferdst);
    }

    if(xfertyp == 2) {
	if($("#TransferExec").val() == "desligar") {
            sendMessage("ATTENDANT_TRANSFER CALLID:" + gcallid + " TO:" + xferdst);
	} else {
            sendMessage("ATTENDANT_TRANSFER CALLID:" + gcallid + " TO:" + xferdst);
        }
    }


});

$("#ag_pauseButton").click(function(e) {
    $("#ag_pauseButton").hide();
    $("#ag_unpauseButton").show();

    var ag_user = $("input[name=agent_id]").val();
    var ag_pass = $("input[name=agent_pass]").val();
    var pausa = $("select[name=nomepausa]").val();
    agent_login(1, ag_user, ag_pass, serverUser.val(), 2, pausa);
});


$("#ag_unpauseButton").click(function(e) {
    if(ag_logged = false) {
        alert("Agente não conectado!");
        return true;
    }

    $("#ag_pauseButton").show();
    $("#ag_unpauseButton").hide();

    var ag_user = $("input[name=agent_id]").val();
    var ag_pass = $("input[name=agent_pass]").val();
    agent_login(1, ag_user, ag_pass, serverUser.val(), 3, 0);
});


$("#ag_connectButton").click(function(e) {
    $("#ag_connectButton").hide();
    $("#ag_disconnectButton").show();

    var ag_user = $("input[name=agent_id]").val();
    var ag_pass = $("input[name=agent_pass]").val();
    agent_login(1, ag_user, ag_pass, serverUser.val(), 0, 0);
});

$("#ag_disconnectButton").click(function(e) {
    $("#ag_connectButton").show();
    $("#ag_disconnectButton").hide();

    if(ag_logged = false) {
        alert("Agente não conectado!");
        return true;
    }

    var ag_user = $("input[name=agent_id]").val();
    var ag_pass = $("input[name=agent_pass]").val();
    agent_login(1, ag_user, ag_pass, serverUser.val(), 1, 0);
});


connectButton.click(function(e) {
    var url = serverUrl.val();
    websocket_connetc(url);
    connectionStatus.text('Conectando ...');
    serverUrl.attr('disabled', 'disabled');
    connectButton.hide();
    disconnectButton.show();
});

disconnectButton.click(function(e) {
    disconnect();
    connectionStatus.text('Desconectado');
    serverUrl.removeAttr('disabled');
    connectButton.show();
    disconnectButton.hide();
    messageArea.attr('disabled', 'disabled');
    requestButton.attr('disabled', 'disabled');
});

requestButton.click(function(e) {
    var msg = $('#requestMessagearea').val();
    addMessage(msg, 'SENT');
    sendMessage(msg);
});

requestDialButton.click(function(e) {
    var num = $('#requestDialNumber').val();
    var src = $('#requestDialOrigem').val();
    dev = "";
    if(src)
       dev = src;
    msg = "DIAL DEV:"+$.trim(dev)+" TO:" + $.trim(num);
    addMessage(msg, 'SENT');
    sendMessage(msg);
});


cmdContatos.click(function(e) {
    msg = "PHONEBOOK NAME: NUMBER: LIMIT:10 OFFSET:0";
    addMessage(msg, 'SENT');
    sendMessage(msg);
});

cmdCallHist.click(function(e) {
    msg = "HISTORY LIMIT:10";
    addMessage(msg, 'SENT');
    sendMessage(msg);
});

cmdRecords.click(function(e) {
    msg = "RECORDS NUMBER: LIMIT:10 OFFSET:0";
    addMessage(msg, 'SENT');
    sendMessage(msg);
});

cmdAgents.click(function(e) {
    msg = "";
    addMessage(msg, 'SENT');
    sendMessage(msg);
});


msgdebug.change(function(e) {
	if(debugenable == false) {
		debugenable = true;
        	alert("Debug habilitado! Todos comandos serão mostrados...");
	}else{
		debugenable = false;
        alert("Debug desabilitado!");
    }
});


$('#calldebug').change(function(e) {
	if(onlycallevts == false) {
	    onlycallevts = true;
       	alert("Somente eventos de chamadas serão mostrados!");
	}else{
        alert("Debug de chamadas desabilitado!");
		onlycallevts = false;
    }
});

