/*const FRAMERATE = 60;
const GRAVIDADE = 10;
const ACELERACAO_CORRIDA = 1;
const VEL_MAX   =  8;
const VEL_MAX_QUEDA = 99;
const VEL_PULO = 21;
const VEL_QUEDA_MORTE = 50;
const TEMPO_COOLDOWN = 1500;*/

var frames = 0;
var canvas, ctx, canvas_entidades, ctx_entidades, canvas_player, ctx_player, canvas_ui, ctx_ui;

var current_level;
var rodando = false;

var hMain, wMain, linhas, cols, block_height, block_width, blocks;
var hMain_inicial, wMain_inicial;

var array_entidades = [];
var array_extras = [];
var array_extras_ui = [];
var blacklist_extras = [];

var solidos = ['1', '4', '5', '6', '7', '9', 's', 'g'];
var blocos_dano = ['3', 'L']
var inimigos = ['s', 'f', 'T', 'p'];
var triggers = ['t'];

var trigger_ativado = false;

var blocos_brilhantes = ['0', '2', 'a'];

var key_up, key_right, key_down, key_left;

var jogador = new Jogador(0, 0);

canvas = document.getElementById('canvas_fundo');
ctx = canvas.getContext('2d');

canvas_entidades = document.getElementById('canvas_entidades');
ctx_entidades = canvas_entidades.getContext('2d');

canvas_player = document.getElementById('canvas_player');
ctx_player = canvas_player.getContext('2d');

canvas_ui = document.getElementById('canvas_ui');
ctx_ui = canvas_ui.getContext('2d');

var musica_tocando = false;

setWindowSize();

block_offset = 0.1;
block_offset_vertical = 0.1;

canvas.style.border = '1px solid black';
ctx.lineWidth = 0;

window.onload = function () {

	setKeyListeners();
	setWindowResizeListener();

	var url = new URL(window.location.href);

	if (url.searchParams.get('acao') != null && url.searchParams.get('acao') == 'continuar' && window.localStorage.getItem('skates_morcegos_level') != null && window.localStorage.getItem('skates_morcegos_level') != '') {

		startLoadLevel(window.localStorage.getItem('skates_morcegos_level'));

	} else {

		if (url.searchParams.get('level') == null) {

			startLoadLevel('level0');

		} else {

			startLoadLevel(url.searchParams.get('level'));

		}

	}

}

function setWindowSize() {

	canvas.height = 2 * Math.floor(window.innerHeight * 0.97) / 2;
	canvas.width = 2 * Math.floor(window.innerWidth * 0.99) / 2;

	canvas_entidades.height = canvas.height;
	canvas_entidades.width = canvas.width;

	canvas_player.height = canvas.height;
	canvas_player.width = canvas.width;

	canvas_ui.height = canvas.height;
	canvas_ui.width = canvas.width;

	ctx_ui.font = 'bold 15px sans-serif';

	hMain = canvas.height;
	wMain = canvas.width;

	if (wMain != wMain_inicial) {

		jogador.pos_x *= wMain / wMain_inicial;

		for (var i = 0; i < array_entidades.length; i++) {

			array_entidades[i].posicao_inicial[0] *= wMain / wMain_inicial;
			array_entidades[i].setPosicaoX(array_entidades[i].getPosicaoX() * wMain / wMain_inicial);

		}

		wMain_inicial = wMain;

	}

	if (hMain != hMain_inicial) {

		jogador.pos_y *= hMain / hMain_inicial;

		for (var i = 0; i < array_entidades.length; i++) {

			array_entidades[i].posicao_inicial[1] *= hMain / hMain_inicial;
			array_entidades[i].setPosicaoY(array_entidades[i].getPosicaoY() * hMain / hMain_inicial);

		}

		hMain_inicial = hMain;

	}

	block_height = Math.round(hMain / linhas);
	block_width  = Math.round(wMain / cols);

	desenharFundo();

}

function start() {

	linhas = current_level.mapa.length;
	cols = current_level.mapa[0].length;

	ctx.filter = 'brightness(' + current_level.luz + ')';
	ctx_entidades.filter = 'brightness(' + current_level.luz + ')';
	ctx_player.filter = 'brightness(' + current_level.luz + ')';

	block_height = Math.round(hMain / linhas);
	block_width  = Math.round(wMain / cols);

	blocks = linhas * cols;

	jogador.pos_x = block_width  * current_level.pos_inicial[1];
	jogador.pos_y = block_height * current_level.pos_inicial[0];

	key_up = key_right = key_down = key_left = false;

	var inimigos = ['s', 'f', 'g', 'p', 'T'];

	for (var l = 0; l < linhas; l++) {

		for (var c = 0; c < cols; c++) {

			let tipo_block = getBlock([c, l]);

			//if (inimigos.includes(tipo_block)) {

				switch (tipo_block) {

					case 's':

						var inimigo = new InimigoEstatico(c * block_width, l * block_height);
						break;

					case 'f':

						var inimigo = new InimigoVoador(c * block_width, l * block_height);
						break;

					case 'g':

						var inimigo = new InimigoGiratorio(c * block_width, l * block_height);
						break;

					case 'T':

						var inimigo = new InimigoTorre(c * block_width, l * block_height);
						break;

					case 'p':

						var inimigo = new InimigoPerseguidor(c * block_width, l * block_height);
						break;

				}

			//}

		}

	}

	desenharFundo();

	if (typeof current_level.falar != 'undefined') {

		setTimeout(falarTextoLevel, 1500);

	} else {

		trigger_ativado = true;

	}

	window.requestAnimationFrame(main);

}

function setWindowResizeListener() {

	window.onresize = () => {

		setWindowSize();

	}

}

function setKeyListeners() {

	window.onkeydown = (e) => {

		if (!musica_tocando) {

			musica_tocando = true;

			var musica = new Audio('audio/musica.ogg');
			musica.volume = 0.2;
			musica.loop = true;
			musica.play();

		}

		tempo_parado = 0;

		switch (e.keyCode) {

			case 32:

				jogador.usarItemEquipado();
				break;

			case 39:

				if (!key_right || jogador.direcao != 'right') {

					key_right = true;
					jogador.direcao = 'right';

				}

				break;

			case 37:

				if (!key_left || jogador.direcao != 'left') {

					key_left = true;
					jogador.direcao = 'left';

				}

				break;

			case 38:

				key_up = true;
				jogador.pular();
				break;

			case 40:

				if (!jogador.agachado && !jogador.no_ar) {

					jogador.agachado = true;
					jogador.altura = Jogador.tamanho_inicial[1] / 2;
					jogador.pos_y += jogador.altura * block_height * Jogador.tamanho_inicial[1] / 2;

					tocarSom('audio/duck1.wav', 15);

				}

				break;

		}

	}

	window.onkeyup = (e) => {

		switch (e.keyCode) {

			case 39:

				key_right = false;
				break;

			case 37:

				key_left = false;
				break;

			case 38:

				key_up = false;
				break;

			case 40:

				if (jogador.agachado) {

					jogador.agachado = false;
					jogador.pos_y -= jogador.altura * block_height * Jogador.tamanho_inicial[1] / 2;
					jogador.altura = Jogador.tamanho_inicial[1];

					tocarSom('audio/levantar1.wav', 15);

				}

		}

	}

}

/*var img_fumaca_1_dir = document.getElementById('img_fumaca_1_dir');
var img_fumaca_1_esq = document.getElementById('img_fumaca_1_esq');
var img_fumaca_2_dir = document.getElementById('img_fumaca_2_dir');
var img_fumaca_2_esq = document.getElementById('img_fumaca_2_esq');
var img_fumaca_3_dir = document.getElementById('img_fumaca_3_dir');
var img_fumaca_3_esq = document.getElementById('img_fumaca_3_esq');*/

var last_sound = 0;
var tempo_parado = 0;

function main() {

	if (rodando) {

		frames++;
		tempo_parado++;

		var random_range = Math.random() * 99;

		if (tempo_parado > 18000) {

			if (random_range < 33) {

				tocarSom('audio/idle1.wav');

			} else if (random_range < 66) {

				tocarSom('audio/idle2.wav');

			} else {

				tocarSom('audio/idle3.wav');

			}

			tempo_parado = 0;

		}

		// Gerenciamento de controles e vetores

		jogador.pos_x += Math.round((block_width  / 80) * jogador.vel_x);
		jogador.pos_y += Math.round((block_height / 80) * jogador.vel_y);

		if (key_right) {

			jogador.direcao = 'right';

			if (jogador.vel_x > Jogador.VEL_MAX) {

				jogador.vel_x = Jogador.VEL_MAX;

			}

			if (frames > last_sound + 10 && !jogador.no_ar) {

				tocarSom('audio/skate1.wav', 15);
				last_sound = frames;

			}

			if (!jogador.cooldown_move) {

				if (jogador.vel_x < 0) {

					jogador.vel_x = 0;

				}

				if (jogador.vel_x < Jogador.VEL_MAX) {

					if (jogador.vel_x + Jogador.ACELERACAO_CORRIDA > Jogador.VEL_MAX) {

						jogador.vel_x = Jogador.VEL_MAX;

					} else {

						jogador.vel_x += Jogador.ACELERACAO_CORRIDA;

					}

				}

			}

		} else if (key_left) {

			jogador.direcao = 'left';

			if (jogador.vel_x < -Jogador.VEL_MAX) {

				jogador.vel_x = -Jogador.VEL_MAX;

			}

			if (frames > last_sound + 10 && !jogador.no_ar) {

				tocarSom('audio/skate1.wav', 15);
				last_sound = frames;

			}

			if (!jogador.cooldown_move) {

				if (jogador.vel_x > 0) {

					jogador.vel_x = 0;

				}

				if (jogador.vel_x > -Jogador.VEL_MAX) {

					if (jogador.vel_x - Jogador.ACELERACAO_CORRIDA < -Jogador.VEL_MAX) {

						jogador.vel_x = -Jogador.VEL_MAX;

					} else {

						jogador.vel_x -= Jogador.ACELERACAO_CORRIDA;

					}

				}

			}

		} else if ((!key_right || !key_left) && !jogador.cooldown_move) {

			jogador.vel_x = 0;

		}

		jogador.colisao();

		desenharEntidades();
		desenharJogador();
		desenharUI();

		var raf = window.requestAnimationFrame(main);

		if (!rodando) {

			window.cancelAnimationFrame(raf);

		}

	}

}

function desenharUI() {

	ctx_ui.clearRect(0, 0, canvas_ui.width, canvas_ui.height);
	ctx_ui.fillText('HP: ' + String(jogador.saude), 50, 50);
	ctx_ui.fillText('Munição: ' + String(jogador.municao), 125, 50);

	for (var i = 0; i < array_extras_ui.length; i++) {

		ctx_ui.fillStyle = 'white';
		ctx_ui.fillRect(array_extras_ui[i].x, array_extras_ui[i].y, array_extras_ui[i].texto.length * 8.5, block_height);
		ctx_ui.fillStyle = 'black';
		ctx_ui.fillText(array_extras_ui[i].texto, array_extras_ui[i].x + block_width / 3, array_extras_ui[i].y + block_height / 1.5);

	}

	array_extras_ui = [];

}

var img_player_dir = document.getElementById('img_cola_dir');
var img_player_esq = document.getElementById('img_cola_esq');
var img_player_run_dir = document.getElementById('img_cola_run_dir');
var img_player_run_esq = document.getElementById('img_cola_run_esq');
var img_player_jump_dir = document.getElementById('img_cola_jump_dir');
var img_player_jump_esq = document.getElementById('img_cola_jump_esq');
var img_player_duck_dir = document.getElementById('img_bruna_duck_dir');
var img_player_duck_esq = document.getElementById('img_bruna_duck_esq');

function desenharJogador() {

	ctx_player.clearRect(0, 0, canvas_player.width, canvas_player.height);

	switch (jogador.direcao) {

		case 'right':

			if (jogador.no_ar) {

				var img = img_player_jump_dir;

			} else if (jogador.agachado) {

				var img = img_player_duck_dir;

			} else {

				if (jogador.vel_x > 0) {

					var img = img_player_run_dir;

				} else {

					var img = img_player_dir;

				}

			}

			break;

		case 'left':

			if (jogador.no_ar) {

				var img = img_player_jump_esq;

			} else if (jogador.agachado) {

				var img = img_player_duck_esq;

			} else {

				if (jogador.vel_x < 0) {

					var img = img_player_run_esq;

				} else {

					var img = img_player_esq;

				}

			}

			break;

	}

	ctx_player.drawImage(img, jogador.pos_x, jogador.pos_y, jogador.largura * block_width, jogador.altura * block_height);

}

var img_morcego_idle_1 = document.getElementById('img_morcego_idle_1');

function desenharEntidades() {

	ctx_entidades.clearRect(0, 0, canvas_entidades.width, canvas_entidades.height);

	for (var i = 0; i < array_entidades.length; i++) {

		var entidade = array_entidades[i];
		var img = document.getElementById(entidade.getSprite());

		if (array_entidades[i].constructor.danificavel && array_entidades[i].cooldown) {

			ctx_entidades.filter = 'invert(100%)';

		} else {

			ctx_entidades.filter = 'invert(0%)';

		}

		ctx_entidades.drawImage(img, entidade.getPosicaoX(), entidade.getPosicaoY(), entidade.constructor.tamanho[0] * block_width, entidade.constructor.tamanho[1] * block_height);

	}

	for (var i = 0; i < array_extras.length; i++) {

		if (!blacklist_extras.includes(array_extras[i].id)) {

			if (array_extras[i].acao == 'drawImage') {

				if (array_extras[i].rotacao != 0) {

					ctx_entidades.save();

					ctx_entidades.translate(array_extras[i].x, array_extras[i].y);
					ctx_entidades.rotate(array_extras[i].rotacao);

					ctx_entidades.drawImage(array_extras[i].img, 0, -block_height / 2, array_extras[i].w, array_extras[i].h);

					ctx_entidades.restore();

				} else {

					ctx_entidades.drawImage(array_extras[i].img, array_extras[i].x, array_extras[i].y, array_extras[i].w, array_extras[i].h);

				}

			}

		}

	}

	array_extras = [];

}

function desenharFundo() {

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas_fundo.width, canvas_fundo.height);

	var offset = 2;
	var linha_atual = 0;

	for (linha_atual; linha_atual < linhas; linha_atual++) {

		var col_atual = 0;

		for (col_atual; col_atual < cols; col_atual++) {

			var block = new Path2D();

			var x = col_atual * block_width;
			var y = linha_atual * block_height;

			var centro_x = x + block_width / 2;
			var centro_y = y + block_height / 2;

			var bloco_esquerda = getBlock([getCoordenadasCanvas([centro_x, centro_y])[0]-1, getCoordenadasCanvas([centro_x, centro_y])[1]]);
			var bloco_direita = getBlock([getCoordenadasCanvas([centro_x, centro_y])[0]+1, getCoordenadasCanvas([centro_x, centro_y])[1]]);

			if (solidos.includes(current_level.mapa[linha_atual][col_atual])) {

				if (!solidos.includes(bloco_esquerda)) {

					block.moveTo(x + block_width / 4, y);

				} else {

					block.moveTo(x, y);

				}

				if (!solidos.includes(bloco_direita)) {

					block.lineTo(x + block_width - block_width / 4 + offset, y);
					block.lineTo(x + block_width - block_width / 4 + offset, y + block_height + offset);

				} else {

					block.lineTo(x + block_width + offset, y);
					block.lineTo(x + block_width + offset, y + block_height + offset);

				}

				if (!solidos.includes(bloco_esquerda)) {

					block.lineTo(x + block_width / 4, y + block_height + offset);

				} else {

					block.lineTo(x, y + block_height + offset);

				}

			} else {

				if (solidos.includes(bloco_esquerda)) {

					block.moveTo(x - block_width / 4, y);

				} else {

					block.moveTo(x, y);

				}

				if (solidos.includes(bloco_direita)) {

					block.lineTo(x + block_width + block_width / 4 + offset, y);
					block.lineTo(x + block_width + block_width / 4 + offset, y + block_height + offset);

				} else {

					block.lineTo(x + block_width + offset, y);
					block.lineTo(x + block_width + offset, y + block_height + offset);

				}

				if (solidos.includes(bloco_esquerda)) {

					block.lineTo(x - block_width / 4, y + block_height + offset);

				} else {

					block.lineTo(x, y + block_height + offset);

				}

			}

			var bloco_atual = current_level.mapa[linha_atual][col_atual];

			if (inimigos.includes(bloco_atual)) {

				var array_blocos = [];

				array_blocos.push(current_level.mapa[linha_atual-1][col_atual]);
				array_blocos.push(current_level.mapa[linha_atual-1][col_atual+1]);
				array_blocos.push(current_level.mapa[linha_atual][col_atual+1]);
				array_blocos.push(current_level.mapa[linha_atual+1][col_atual+1]);
				array_blocos.push(current_level.mapa[linha_atual+1][col_atual]);
				array_blocos.push(current_level.mapa[linha_atual+1][col_atual-1]);
				array_blocos.push(current_level.mapa[linha_atual][col_atual-1]);
				array_blocos.push(current_level.mapa[linha_atual-1][col_atual-1]);

				bloco_atual = getModa(array_blocos);

			}

			if (triggers.includes(bloco_atual)) {

				bloco_atual = current_level.mapa[linha_atual][col_atual-1];

			}

			switch (bloco_atual) {

				case '0':

					ctx.fillStyle = 'rgb(89, 216, 255)'
					break;

				case '1':

					ctx.fillStyle = 'rgb(102, 53, 0)';
					break;

				case '2':

					ctx.fillStyle = 'rgb(227, 252, 249)';
					break;

				case '3':

					ctx.fillStyle = 'rgb(0, 98, 173)';
					break;

				case '4':

					ctx.fillStyle = 'rgb(37, 184, 56)';
					break;

				case '5':

					ctx.fillStyle = 'rgb(227, 219, 113)';
					break;

				case '6':

					ctx.fillStyle = 'rgb(71, 71, 71)';
					break;

				case '7':

					ctx.fillStyle = 'rgb(115, 67, 28)';
					break;

				case '8':

					ctx.fillStyle = 'rgb(110, 110, 110)';
					break;

				case 'm':

					ctx.fillStyle = 'rgb(120, 72, 48)';
					break;

				case 'v':

					ctx.fillStyle = 'rgb(46, 133, 15)';
					break;

				case 'V':

					ctx.fillStyle = 'rgb(194, 23, 0)';
					break;

				case 'P':

					ctx.fillStyle = 'rgb(0, 0, 0)';
					break;

				case 'L':

					ctx.fillStyle = 'rgb(255, 106, 0)';
					break;

				case 'a':

					ctx.fillStyle = 'rgb(255, 255, 36)';
					break;

				default:

					ctx.fillStyle = 'rgb(89, 216, 255)'
					break;

			}

			if (!solidos.includes(bloco_atual) && !blocos_brilhantes.includes(bloco_atual)) {

				ctx.filter = 'brightness(75%)';

			} else {

				ctx.filter = 'brightness(100%)';

			}

			ctx.fill(block);

		}

	}

}

function mudarLevel(nome_lvl) {

	//rodando = false;

	if (nome_lvl == 'fim') {

		window.location.href = 'cutscenes/fim.html';

	} else {

		window.location.href = 'index.html?level=' + nome_lvl;

	}

	/*if (current_level != null) {

		unloadCurrentLevel();

	} */

	/*loadLevel(nome_lvl).then(() => { 

		window.localStorage.setItem('skates_morcegos_level', current_level.nome);

		rodando = true; 
		start();

	});*/

}

function startLoadLevel(nome_lvl) {

	loadLevel(nome_lvl).then(() => { 

		window.localStorage.setItem('skates_morcegos_level', current_level.nome);

		rodando = true; 
		start();

	});

}

async function loadLevel(nome_lvl) {

	var script_lvl = document.createElement('script');

	script_lvl.type = 'text/javascript';
	script_lvl.src = 'lvl/' + nome_lvl + '.js';
	script_lvl.id = 'script_' + nome_lvl;

	document.body.appendChild(script_lvl);

	return await onLevelLoad(script_lvl);

}

function onLevelLoad(element) {

	return new Promise(resolve=>{

		element.onload = function() {

			current_level = JSON.parse(lvl);
			resolve(element);

		}

	});

}

function unloadCurrentLevel() {

	rodando = false;

	if (current_level != null) {

		var id = window.setTimeout(function() {}, 0);

		while (id--) {

		    window.clearTimeout(id);
		    
		}

		var id_raf = window.requestAnimationFrame(function(){});

	   while(id_raf--){

	     window.cancelAnimationFrame(id_raf);

	   }

		var script_lvl = document.getElementById('script_' + current_level.nome);
		script_lvl.parentNode.removeChild(script_lvl);

		array_entidades = [];
		array_extras = [];

		current_level = null;

	}

}