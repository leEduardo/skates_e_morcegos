
var projeteis = ['Projetil', 'Missil'];

class Inimigo {

	static tipo = 'd';
	static saude_inicial = 100;
	static dano = 10; 		// Dano fornecido pelo inimigo quando tocado.
	static tamanho = [1,1];	// Array [x,y] indicando o tamanho, em blocos, do inimigo. 
	static danificavel = false;
	static afetado_pela_gravidade = false;

	constructor(posicao_x, posicao_y) {

		this.id = gerarId();
		this.setPosicaoX(posicao_x);
		this.setPosicaoY(posicao_y);
		this.posicao_inicial = [posicao_x, posicao_y];
		this.saude = this.constructor.saude_inicial;
		this.hit_player = false;
		this.last_sprite = '';
		this.setSprite('img_morcego_idle_1');
		this.cooldown = false;
		this.som_dano = 'audio/esqueleto_dano.wav';

		array_entidades.push(this);

		this.hitbox();
		this.behave();
		
	}

	behave() {

		return;

	}

	aplicarDano(valor) {

		if (!this.cooldown) {

			this.cooldown = true;
			this.saude -= valor;

			tocarSom(this.som_dano, 50);

			setTimeout(() => { this.cooldown = false; }, 100);

			if (this.saude <= 0) {

				for (var i = array_entidades.length - 1; i >= 0; i--) {

					if (array_entidades[i].id == this.id) {

						array_entidades.splice(i, 1);

					}

				}

				var explosao = new Explosao(this.posicao_x, this.posicao_y, this.constructor.tamanho[0], this.constructor.tamanho[1], 50);

			}

		}

	}

	hitbox() {

		var centro_x = this.getPosicaoX() + this.constructor.tamanho[0] * block_width  / 2;
		var centro_y = this.getPosicaoY() + this.constructor.tamanho[1] * block_height / 2;

		var centro_player_x = jogador.pos_x + jogador.largura * block_width  / 2;
		var centro_player_y = jogador.pos_y + jogador.altura  * block_height / 2;

		if (this.constructor.afetado_pela_gravidade) {

			var colisoes = getColisoes(this.posicao_x, this.posicao_y, this.constructor.tamanho[0], this.constructor.tamanho[1]);

			for (var i = 0; i < colisoes.length; i++) {

				if (i > colisoes.length - this.constructor.tamanho[0] - 1) {

					if (!solidos.includes(getBlock(colisoes[i].colisao_abaixo_esquerda)) && !solidos.includes(getBlock(colisoes[i].colisao_abaixo)) && !solidos.includes(getBlock(colisoes[i].colisao_abaixo_direita))) {

						this.posicao_y += 3;

					} else {

						this.posicao_y = getCoordenadasCanvas([this.posicao_x, this.posicao_y])[1] * block_height;

					}

				}

			}

		}

		if (this.constructor.danificavel) {

			for (var i = 0; i < array_extras.length; i++) {

				if (typeof array_extras[i].classe != 'undefined' && projeteis.includes(array_extras[i].classe)) {

					var centro_projetil_x = array_extras[i].x + array_extras[i].w / 2;
					var centro_projetil_y = array_extras[i].y + array_extras[i].h / 2;

					if (Math.abs(centro_x - centro_projetil_x) < this.constructor.tamanho[0] * block_width / 2 + array_extras[i].w / 2 && Math.abs(centro_y - centro_projetil_y) < this.constructor.tamanho[1] * block_height / 2 + array_extras[i].h / 2) {

						this.aplicarDano(eval(array_extras[i].classe).dano);
						blacklist_extras.push(array_extras[i].id);

					}

				}

			}

		}


		if (Math.abs(centro_x - centro_player_x) < jogador.largura * block_width / 2 + this.constructor.tamanho[0] * block_width / 2 && Math.abs(centro_y - centro_player_y) < jogador.altura * block_height / 2 + this.constructor.tamanho[1] * block_height / 2) {

			this.hit_player = true;
			jogador.aplicarDano(this.constructor.dano, this.posicao_x);

		} else {

			this.hit_player = false;

		}

		if (this.saude > 0) {

			requestAnimationFrame(this.hitbox.bind(this));

		}

	}

	getSprite() {

		return this.sprite;

	}

	setSprite(valor) {

		if (this.last_sprite != '') {

			this.last_sprite = this.getSprite();

		} else {

			this.last_sprite = valor;

		}

		this.sprite = valor;

	}

	getSaude() {

		return this.saude;

	}

	setSaude(valor) {

		this.saude = valor;

	}

	getTamanho() {

		return this.tamanho;

	}

	getPosicaoX() {

		return this.posicao_x;

	}

	getPosicaoY() {

		return this.posicao_y;

	}

	setPosicaoX(valor) {

		this.posicao_x = valor;

	}

	setPosicaoY(valor) {

		this.posicao_y = valor;

	}

}

class InimigoEstatico extends Inimigo {

	constructor(posicao_x, posicao_y) {

		super(posicao_x, posicao_y);

	}

	behave() {

		return;

	}

	static tipo = 's';
	static saude_inicial = 500;
	static dano = 25;
	static tamanho = [1,2];

}

class InimigoGiratorio extends Inimigo {

	constructor(posicao_x, posicao_y) {

		super(posicao_x, posicao_y);

		this.setSprite('img_bloco_inimigo_giratorio');
		this.deg   = Math.random() * 359;

	}

	behave() {

		var rad = this.deg * (Math.PI / 180);
		var obj = this;

		for (var i = 0; i < this.constructor.tamanho_raio; i++) {

			var bola_x = obj.posicao_x + Math.cos(rad) * (i+1) * block_width;
			var bola_y = obj.posicao_y + Math.sin(rad) * (i+1) * block_height;

			var tamanho_bola_x = obj.constructor.tamanho[0] * block_width;
			var tamanho_bola_y = obj.constructor.tamanho[1] * block_height;

			var centro_bola_x = bola_x + tamanho_bola_x / 2;

			array_extras.push({ id: this.id, acao: 'drawImage', img: obj.constructor.sprite_bola_fogo, rotacao: 0, x: bola_x, y: bola_y, w: tamanho_bola_x, h: tamanho_bola_y });

			var colisoes = getColisoes(bola_x, bola_y, 1, 1);

			if ((Math.abs(bola_x - jogador.pos_x) < jogador.largura * block_width / 2 + tamanho_bola_x / 2) && (Math.abs(bola_y - jogador.pos_y) < jogador.altura * block_height / 2 + tamanho_bola_y / 2)) {

				jogador.aplicarDano(50, centro_bola_x);

			}

		}

		this.deg += this.constructor.velocidade;

		if (this.deg >= 360) {

			this.deg = 0;

		} 

		requestAnimationFrame(this.behave.bind(this));

	}

	static tipo = 'g';
	static saude_inicial = 1000;
	static dano = 0;
	static tamanho = [1,1];
	static tamanho_raio = 3;
	static velocidade = 2;
	static sprite_bola_fogo = document.getElementById('img_bola_fogo');

}

class InimigoTorre extends Inimigo {

	constructor(posicao_x, posicao_y) {

		super(posicao_x, posicao_y);

		this.setSprite('img_base_inimigo_giratorio');
		this.counter_missil = 0;

	}

	behave() {

		var dist_x = (jogador.pos_x + block_width * jogador.largura / 2) - (this.posicao_x + block_width / 2);
		var dist_y = (jogador.pos_y + block_height * jogador.altura / 2) - (this.posicao_y + block_height / 2);

		var dist_z = Math.sqrt(dist_x**2 + dist_y**2);

		var sen = dist_x / dist_z;
		var cos = dist_y / dist_z;

		if (cos < 0 && sen < 0) {

			array_extras.push( { id: this.id, acao: 'drawImage', img: document.getElementById('img_topo_inimigo_giratorio'), rotacao: Math.asin(sen) - Math.PI / 2, x: this.posicao_x + block_width / 2, y: this.posicao_y + block_height / 4, w: block_width, h: block_height } );

		} else if (cos >= 0 && sen >= 0) {

			array_extras.push( { id: this.id, acao: 'drawImage', img: document.getElementById('img_topo_inimigo_giratorio'), rotacao: Math.acos(sen) * 2, x: this.posicao_x + block_width / 2, y: this.posicao_y + block_height / 4, w: block_width, h: block_height } );

		} else if (cos >= 0 && sen < 0) {

			array_extras.push( { id: this.id, acao: 'drawImage', img: document.getElementById('img_topo_inimigo_giratorio'), rotacao: Math.acos(cos) + Math.PI / 2, x: this.posicao_x + block_width / 2, y: this.posicao_y + block_height / 4, w: block_width, h: block_height } );

		} else {

			array_extras.push( { id: this.id, acao: 'drawImage', img: document.getElementById('img_topo_inimigo_giratorio'), rotacao: Math.asin(sen) - Math.PI / 2, x: this.posicao_x + block_width / 2, y: this.posicao_y + block_height / 4, w: block_width, h: block_height } );

		}

		//array_extras.push( { acao: 'drawImage', img: document.getElementById('img_topo_inimigo_giratorio'), rotacao: Math.acos(cos), x: this.posicao_x + block_width / 2, y: this.posicao_y + block_height / 4, w: block_width, h: block_height } );

		this.counter_missil++;

		if (this.counter_missil >= 120) {

			var missil = new Missil(this.posicao_x + block_width * sen, this.posicao_y + block_height / 4, this.constructor.velocidade * sen, this.constructor.velocidade * cos);
			this.counter_missil = 0;

		}

		if (this.saude > 0) {

			requestAnimationFrame(this.behave.bind(this));

		}

	}

	static tipo = 'T';
	static saude_inicial = 500;
	static dano = 0;
	static danificavel = true;
	static tamanho = [1,2];

	static velocidade = 3;

}

class InimigoPerseguidor extends Inimigo {

	constructor(posicao_x, posicao_y) {

		super(posicao_x, posicao_y);

		this.velocidade = 0;
		this.frame = 0;
		this.frame_change = this.frame;
		this.last_som = 0;
		this.som_dano = 'audio/esqueleto_dano.wav';
		this.setSprite('img_esqueleto_1_dir');
		this.velocidade_maxima = Math.random() * (1.5 - 1) + 1

	}

	behave() {

		this.frame++;

		if (this.frame - this.last_som > Math.random() * (250 - 150) + 150) {

			this.last_som = this.frame;
			tocarSom('audio/esqueleto_andando.wav', 50);

		}

		var colisoes = getColisoes(this.posicao_x, this.posicao_y, this.constructor.tamanho[0], this.constructor.tamanho[1]);

		for (var i = 0; i < colisoes.length; i++) {

			if (jogador.pos_x - this.posicao_x < -5) {

				if (this.frame - this.frame_change > 30 / this.velocidade) {

					this.frame_change = this.frame;

					if (this.getSprite() == 'img_esqueleto_1_esq' || this.getSprite() == 'img_esqueleto_1_dir') {

						this.setSprite('img_esqueleto_2_esq');

					} else if (this.getSprite() == 'img_esqueleto_2_esq' || this.getSprite() == 'img_esqueleto_2_dir') {

						if (this.last_sprite == 'img_esqueleto_1_esq' || this.last_sprite == 'img_esqueleto_1_dir') {

							this.setSprite('img_esqueleto_3_esq');

						} else if (this.last_sprite == 'img_esqueleto_3_esq' || this.last_sprite == 'img_esqueleto_3_dir') {

							this.setSprite('img_esqueleto_1_esq');

						}

					} else if (this.getSprite() == 'img_esqueleto_3_esq' || this.getSprite() == 'img_esqueleto_3_dir') {

						this.setSprite('img_esqueleto_2_esq');

					}

				}

				if (blocos_dano.includes(getBlock(colisoes[i].colisao_acima)) || blocos_dano.includes(getBlock(colisoes[i].colisao_abaixo)) || blocos_dano.includes(getBlock(colisoes[i].colisao_direita)) || blocos_dano.includes(getBlock(colisoes[i].colisao_esquerda))) {

					this.aplicarDano(this.constructor.saude_inicial);

				}

				if (!solidos.includes(getBlock(colisoes[i].colisao_acima_esquerda)) && i == 0) {

					if (this.velocidade < this.velocidade_maxima) {

						this.velocidade += this.constructor.aceleracao;

					} else {

						this.velocidade = this.velocidade_maxima;

					}

					if (this.velocidade != null) {

						this.posicao_x -= this.velocidade;

					}

				} else if ((solidos.includes(getBlock(colisoes[i].colisao_acima_esquerda)) && i == 0) || this.hit_player) {

					this.velocidade = 0;

				}

			} else if (jogador.pos_x - this.posicao_x > 5) {

				if (this.frame - this.frame_change > 30 / this.velocidade) {

					this.frame_change = this.frame;

					if (this.getSprite() == 'img_esqueleto_1_esq' || this.getSprite() == 'img_esqueleto_1_dir') {

						this.setSprite('img_esqueleto_2_dir');

					} else if (this.getSprite() == 'img_esqueleto_2_esq' || this.getSprite() == 'img_esqueleto_2_dir') {

						if (this.last_sprite == 'img_esqueleto_1_esq' || this.last_sprite == 'img_esqueleto_1_dir') {

							this.setSprite('img_esqueleto_3_dir');

						} else if (this.last_sprite == 'img_esqueleto_3_esq' || this.last_sprite == 'img_esqueleto_3_dir') {

							this.setSprite('img_esqueleto_1_dir');

						}

					} else if (this.getSprite() == 'img_esqueleto_3_esq' || this.getSprite() == 'img_esqueleto_3_dir') {

						this.setSprite('img_esqueleto_2_dir');

					}

				}

				if (!solidos.includes(getBlock(colisoes[i].colisao_acima_direita)) && i == this.constructor.tamanho[0] - 1) {

					if (this.velocidade < this.velocidade_maxima) {

						this.velocidade += this.constructor.aceleracao;

					}

					if (this.velocidade != null) {

						this.posicao_x += this.velocidade;

					} else {

						this.velocidade = this.velocidade_maxima;

					}

				} else if ((solidos.includes(getBlock(colisoes[i].colisao_acima_direita)) && i == this.constructor.tamanho[0] - 1) || this.hit_player) {

					this.velocidade = 0;

				}

			} else {

				this.velocidade = 0;

			}

		}

		if (this.saude > 0) {

			requestAnimationFrame(this.behave.bind(this));

		}

	}

	static tipo = 'p';
	static saude_inicial = 100;
	static dano = 50;
	static danificavel = true;
	static afetado_pela_gravidade = true;
	static tamanho = [1,2];

	static aceleracao = 0.02;

}

class InimigoVoador extends Inimigo {

	constructor(posicao_x, posicao_y) {

		super(posicao_x, posicao_y);

		this.setSprite('img_morcego_idle_1');
		this.deg = Math.random() * 359;
		this.som_dano = 'audio/morcego_dano.wav';

	}

	behave() {

		var rad = this.deg * (Math.PI / 180);

		this.setPosicaoX(this.posicao_inicial[0] + Math.cos(rad) * this.constructor.raio_voo * block_width);
		this.setPosicaoY(this.posicao_inicial[1] - Math.sin(rad) * this.constructor.raio_voo * block_height);

		this.deg += this.constructor.velocidade;

		if (this.deg >= 360) {

			this.deg = 0;

		} 

		if (Math.abs(Math.sin(rad)) > 0.5) {

			this.setSprite('img_morcego_idle_1');

		} else {

			this.setSprite('img_morcego_idle_2');

		}

		if (this.saude > 0) {

			requestAnimationFrame(this.behave.bind(this));

		}

	}

	static tipo = 'f';
	static saude_inicial = 25;
	static dano = 50;
	static danificavel = true;
	static tamanho = [1,1];

	static velocidade = 3;
	static raio_voo   = 2;

}

class Explosao {

	static velocidade_change = 5;

	constructor(posicao_x, posicao_y, largura, altura, duracao) {

		this.posicao_x 	= posicao_x;
		this.posicao_y 	= posicao_y;
		this.largura 	= largura;
		this.altura 	= altura;
		this.duracao 	= duracao;

		this.frame = 0;
		this.last_change = 0;
		this.last_som = 0;
		this.sprite = 'img_explosao1';

		this.behave();

	}

	behave() {

		this.frame++

		if (this.frame - this.last_som > 10) {

			this.last_som = this.frame;
			tocarSom('audio/explosao.wav', 15);

		}

		for (var i = 0; i < this.largura; i++) {

			for (var j = 0; j < this.altura; j++) {

				array_extras.push( { id: gerarId, acao: 'drawImage', img: document.getElementById(this.sprite), x: this.posicao_x + block_width * i, y: this.posicao_y + block_height * j, w: block_width, h: block_height } );

			}

		}

		if (this.frame - this.last_change > this.constructor.velocidade_change) {

			this.last_change = this.frame;

			if (this.sprite == 'img_explosao1') {

				this.sprite = 'img_explosao2';

			} else {

				this.sprite = 'img_explosao1';

			}

		}

		if (this.frame < this.duracao) {

			requestAnimationFrame(this.behave.bind(this));

		}

	}

}


class Missil {

	constructor(missil_pos_x, missil_pos_y, missil_vel_x, missil_vel_y) {

		this.id = gerarId();
		this.posicao_x = missil_pos_x;
		this.posicao_y = missil_pos_y;
		this.vel_x     = missil_vel_x;
		this.vel_y     = missil_vel_y;

		this.behave();

	}

	static dano = 25;

	behave() {

		var coord = getCoordenadasCanvas([this.posicao_x + block_width / 2, this.posicao_y + block_height / 2]);
		var colisao_solido = solidos.includes(getBlock(coord));

		if (Math.abs(this.posicao_x - jogador.pos_x) < jogador.largura * block_width / 2 + block_width / 2 && Math.abs(this.posicao_y - jogador.pos_y) < jogador.altura * block_height / 2 + block_height / 2) {

			jogador.aplicarDano(25);

			if (!jogador.cooldown) {

				colisao_solido = true;

			}

		}

		array_extras.push({ id: this.id, acao: 'drawImage', img: document.getElementById('img_corona'), x: this.posicao_x, y: this.posicao_y, w: block_width, h: block_height, classe: this.constructor.name });

		this.posicao_x += this.vel_x;
		this.posicao_y += this.vel_y;

		if (this.posicao_x > 0 && this.posicao_x < wMain && this.posicao_y > 0 && this.posicao_y < hMain && !colisao_solido && !blacklist_extras.includes(this.id)) {

			requestAnimationFrame(this.behave.bind(this));

		}

	}

}

class Projetil {

	constructor(projetil_pos_x, projetil_pos_y, projetil_vel_x, projetil_vel_y) {

		this.id = gerarId();
		this.posicao_x = projetil_pos_x;
		this.posicao_y = projetil_pos_y;
		this.vel_x     = projetil_vel_x;
		this.vel_y     = projetil_vel_y;

		this.behave();

	}

	static dano = 10;

	behave() {

		var coord = getCoordenadasCanvas([this.posicao_x + block_width / 2, this.posicao_y + block_height / 2]);
		var colisao_solido = solidos.includes(getBlock(coord));

		if (Math.abs(this.posicao_x - jogador.pos_x) < jogador.largura * block_width / 2 + block_width / 2 && Math.abs(this.posicao_y - jogador.pos_y) < jogador.altura * block_height / 2 + block_height / 2) {

			//jogador.aplicarDano(25);

			if (!jogador.cooldown) {

				colisao_solido = true;

			}

		}

		array_extras.push({ id: this.id, acao: 'drawImage', img: document.getElementById('img_bola_fogo'), x: this.posicao_x, y: this.posicao_y, w: block_width / 2, h: block_height / 2, classe: this.constructor.name });

		this.posicao_x += this.vel_x * 4;
		this.posicao_y += this.vel_y * 4;

		if (this.posicao_x > 0 && this.posicao_x < wMain && this.posicao_y > 0 && this.posicao_y < hMain && !colisao_solido && !blacklist_extras.includes(this.id)) {

			requestAnimationFrame(this.behave.bind(this));

		} else {

			var explosao = new Explosao(this.posicao_x, this.posicao_y - block_height / 2, 0.3, 0.3, 10);

		}

	}

}