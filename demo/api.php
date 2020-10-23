<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"/>
	<title>uTech Web Socket Client</title>

	<script type="text/javascript" src="jquery-3.2.1.min.js"></script>
	<script type="text/javascript" src="bootstrap-3.3.7.min.js"></script>
	<link rel="stylesheet" href="bootstrap-3.3.5.min.css" >

	<link rel="stylesheet" type="text/css" href="reset.css"/>
	<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
<div id="content">
	<fieldset>
		<legend>Conex&atilde;o / Login</legend>
		<table border=1>
                  <tr>
                    <td> URL: </td>
                    <td> <input type="text" id="serverUrl" value="ws://10.0.0.1:3000" style="width: 300px;"> </td>
                  </tr>
                  <tr>
                    <td> Login: </td>
                    <td> <input type="text" id="serverUser" value="1111" style="width: 300px;"> </td>
                  </tr>
                  <tr>
                    <td> Senha: </td>
                    <td> <input type="text" id="serverPass" value="2222" style="width: 300px;"> </td>
                  </tr>
                  <tr>
                    <td> Acesso externo: </td>
                    <td> <input type="checkbox" id="serverExt" value="" style="width: 300px;"> </td>
                  </tr>

		</table>
		<table border=0 width="100%">
                  <tr>
                    <td colspan=1 width="100%">
                        <br>
			<button id="connectButton">Conectar</button>
			<button id="disconnectButton">Desconectar</button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan=2> <BR>
			<label>Status:</label>
			<span id="connectionStatus">Desconectado</span>
                    </td>
                  </tr>
		</table>
	</fieldset>

<div id="contentt">

	<fieldset id="dialArea">
		<legend>Gerar chamada</legend>
		<div>
			Ramal Origem: <select id="requestDialOrigem" disabled>
				      </select>
			<!--<input type=text id="requestDialOrigem" disabled="disabled">-->
			Numero:<input type=text id="requestDialNumber" disabled="disabled">
			<button id="requestDialButton" disabled="disabled">Discar</button>
			<label>&nbsp;&nbsp;Status:</label>
			<span id="dialStatus"></span>
		</div>
	</fieldset>


    <ul id="tabs" class="nav nav-tabs" data-tabs="tabs">
        <li class="active"><a href="#debug" data-toggle="tab">Debug</a></li>
        <li onclick="javascript:$('#cmdContatos').click();"><a href="#contatct" data-toggle="tab">Contato</a></li>
        <li><a href="#calls" data-toggle="tab">Chamadas</a></li>
        <li onclick="javascript:$('#cmdRecords').click();"><a href="#records" data-toggle="tab">Grava&ccedil;&otilde;es</a></li>
        <li><a href="#queues" data-toggle="tab">Filas</a></li>
    </ul>
    <div id="my-tab-content" class="tab-content">
        <div class="tab-pane active" id="debug">

	<br>
	  <fieldset id="commandsArea">
		<legend>Comandos</legend>
		<div>
			<button id="cmdContatos" disabled="disabled">Contatos</button>
			<button id="cmdCallHist" disabled="disabled">Historico</button>
			<button id="cmdRecords"  disabled="disabled">Gravacoes</button>
		</div>
	  </fieldset>

	  <fieldset id="requestArea">
		<legend>Enviar comandos</legend>
		<div>
			<textarea id="requestMessagearea" disabled="disabled"></textarea>
		</div>
		<div>
			<button id="requestButton" disabled="disabled">Enviar</button>
		</div>
	  </fieldset>
	  <fieldset id="messageArea">
		<legend>Message Log <button id="clearMessage">Limpar</button> - Debug: <input type="checkbox" id="msgdebug"/></legend>
		<div id="messages"></div>
	  </fieldset>
        </div>
        <div class="tab-pane" id="contatct">
	  <br>
	  <table class=table>
            <thead class="thead-dark">
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tipo</th>
                <th scope="col">Número</th>
                <th scope="col">Empresa</th>
              </tr>
            </thead>
            <tbody id="tbcontacts">
            <tbody>
	  </table>
        </div>
        <div class="tab-pane" id="calls">

	  <br>
	  <table class=table>
            <thead class="thead-dark">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Origem</th>
                <th scope="col">Destino</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody id="tbcalls">
            <tbody>
	  </table>


        </div>
        <div class="tab-pane" id="records">

	  <br>
	  <table class=table>
            <thead class="thead-dark">
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Origem</th>
                <th scope="col">Destino</th>
                <th scope="col">Direção</th>
                <th scope="col">Duração</th>
                <th scope="col">Gravação</th>
              </tr>
            </thead>
            <tbody id="tbrecs">
            <tbody>
	  </table>

        </div>
        <div class="tab-pane" id="queues">
	  <br>
	  <table class=table>
            <thead class="thead-dark">
              <tr>
                <th scope="col">Fila</th>
                <th scope="col">Agentes Ativos</th>
                <th scope="col">Total de Chamadas</th>
                <th scope="col">Chamadas Atendidas</th>
                <th scope="col">Chamadas Não Atendidas</th>
                <th scope="col">Tempo Total</th>
                <th scope="col">Tempo em Espera</th>
                <th scope="col">Tempo em Atendimento</th>
              </tr>
            </thead>
            <tbody id="tbqueues">
            <tbody>
	  </table>

        </div>
    </div>
</div>


<script type="text/javascript" src="jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="api.js?tok=11rrrr4123a1493"></script>
<script>
$("#contentt").hide();
$('#debug').trigger('click');
</script>
</body>
</html>
