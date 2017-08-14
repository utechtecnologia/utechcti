<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"/>
	<title>uTech Web Socket Client</title>
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
                    <td> <input type="text" id="serverUrl" value="ws://10.0.0.200:3000" style="width: 300px;"> </td>
                  </tr>
                  <tr>
                    <td> Login: </td>
                    <td> <input type="text" id="serverUser" value="2001" style="width: 300px;"> </td>
                  </tr>
                  <tr>
                    <td> Senha: </td>
                    <td> <input type="text" id="serverPass" value="1q2w3e" style="width: 300px;"> </td>
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
	<fieldset id="commandsArea">
		<legend>Comandos</legend>
		<div>
			<button id="cmdContatos" disabled="disabled">Contatos</button>
			<button id="cmdCallHist" disabled="disabled">Historico</button>
			<button id="cmdRecords"  disabled="disabled">Gravacoes</button>
			<button id="cmdAgents"   disabled="disabled">Agentes</button>
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
		<legend>Message Log <button id="clearMessage">Limpar</button></legend>
		<div id="messages"></div>
	</fieldset>

</div>
<script type="text/javascript" src="jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="api.js?tok=2309234938493"></script>
</body>
</html>
