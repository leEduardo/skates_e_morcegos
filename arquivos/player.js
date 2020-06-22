
class Jogador {

	constructor(jogador_pos_x, jogador_pos_y) {

		this.saude = this.constructor.saude_inicial;
		this.municao = 30;

		this.largura = this.constructor.tamanho_inicial[0];
		this.altura  = this.constructor.tamanho_inicial[1];

		this.pos_x = jogador_pos_x;
		this.pos_y = jogador_pos_y;

		this.vel_x = 0;
		this.vel_y = 0;

		this.direcao = 'right';

		this.inventario = [];
		this.equipado = 'pistola';

		this.colisao_acima = this.colisao_direita = this.colisao_abaixo = this.colisao_esquerda = false;
		this.no_ar = this.agachado = this.double_jump = this.cooldown = this.cooldown_move = false;

		this.frame = 0;

		this.falando = false;
		this.frame_fala = 0;
		this.frame_fala_final = 0;
		this.frame_fala_audio = 0;

	}

	static VEL_MAX = 10;
	static VEL_QUEDA_MORTE = 50;
	static TEMPO_COOLDOWN = 1500;
	static ACELERACAO_CORRIDA = 1;
	static VEL_PULO = 21;

	static saude_inicial = 100;
	static tamanho_inicial = [1,2];

	usarItemEquipado() {

		switch (this.equipado) {

			case 'pistola':

				if (this.municao > 0) {	

					if (this.direcao == 'right') {

						var projetil = new Projetil(this.pos_x + this.largura * block_width, this.pos_y + this.largura * block_height, 2, 0);		

					} else {

						var projetil = new Projetil(this.pos_x - block_width, this.pos_y + this.largura * block_height, -2, 0);

					}

					this.municao--;

					tocarSom('audio/tiro.wav', 20);

				}

				break;

		}

	}

	falar(texto, duracao) {

		this.frame_fala = this.frame;
		this.frame_fala_final = this.frame_fala + duracao;
		this.frame_fala_audio = this.frame;

		tocarSom('audio/falando.wav');

		var obj = this;

		requestAnimationFrame(() => { obj.requestFala(texto) });

	}

	requestFala(texto) {

		pushTextoUI(texto, jogador.pos_x - texto.length * 3.5, jogador.pos_y - block_height * 1.5);

		if (this.frame - this.frame_fala_audio >= 105) {

			this.frame_fala_audio = this.frame;
			tocarSom('audio/falando.wav');

		}

		var obj = this;

		if (this.frame <= this.frame_fala_final) {

			this.falando = true;
			requestAnimationFrame(() => { obj.requestFala(texto) });

		} else {

			this.falando = false;

		}

	}

	pular() {

		if (!this.colisao_acima) {

			if (!this.no_ar && !this.double_jump) {

				this.pos_y = getCoordenadasCanvas([this.pos_x, this.pos_y])[1] * block_height;
				this.vel_y = -this.constructor.VEL_PULO;
				this.no_ar = true;
				tocarSom('audio/pulo1.wav', 15);

			} else if (this.no_ar && !this.double_jump) {

				this.vel_y = -this.constructor.VEL_PULO;
				this.double_jump = true;
				tocarSom('audio/pulo2.wav', 15);

			}

		}

	}

	aplicarDano(valor, origem_x = this.pos_x) {

		if (!this.cooldown && valor > 0) {	

			this.saude -= valor;
			this.cooldown = true;
			this.cooldown_move = true;
			ctx_player.filter = 'invert(100%)';

			setTimeout(() => { this.cooldown_move = false }, this.constructor.TEMPO_COOLDOWN / 2);
			setTimeout(() => { this.cooldown = false }, this.constructor.TEMPO_COOLDOWN);
			setTimeout(() => { ctx_player.filter = 'invert(0%)' }, 200);

			this.vel_y = -this.constructor.VEL_PULO;
			this.no_ar = true;

			if (origem_x == this.pos_x) {

				if (this.direcao == 'right') {

					this.vel_x -= this.constructor.VEL_PULO / 4;

				} else {

					this.vel_x += this.constructor.VEL_PULO / 4;

				}

			} else {

				if (origem_x > this.pos_x) {

					this.vel_x -= this.constructor.VEL_PULO / 3;

				} else {

					this.vel_x += this.constructor.VEL_PULO / 3;

				}

			}

			if (this.saude <= 0) {

				tocarSom('audio/morte1.wav');
				
				jogador.saude = 100;
				jogador.municao = 30;
				var nome_level = current_level.nome;
				mudarLevel(nome_level);

			} else {

				tocarSom('audio/oof.wav');

			}

		}

	}

	aplicarDanoByTipo(tipo) {

		this.aplicarDano(getDanoByTipo(tipo));

	}
	
	colisao() {

		this.frame++;

		var colisoes = getColisoes(this.pos_x, this.pos_y, this.largura, this.altura);

		for (var i = 0; i < colisoes.length; i++) {

			if (blocos_dano.includes(getBlock(colisoes[i].colisao_acima)) || blocos_dano.includes(getBlock(colisoes[i].colisao_abaixo)) || blocos_dano.includes(getBlock(colisoes[i].colisao_direita)) || blocos_dano.includes(getBlock(colisoes[i].colisao_esquerda))) {

				this.aplicarDano(100);

			}

			if (triggers.includes(getBlock(colisoes[i].colisao_acima)) || triggers.includes(getBlock(colisoes[i].colisao_abaixo)) || triggers.includes(getBlock(colisoes[i].colisao_direita)) || triggers.includes(getBlock(colisoes[i].colisao_esquerda))) {

				if (trigger_ativado) {

					mudarLevel(current_level.trigger);

				}

			}

			if (solidos.includes(getBlock(colisoes[i].colisao_acima_esquerda)) && this.direcao == 'left') {

				this.vel_x = 1;

			} else if (solidos.includes(getBlock(colisoes[i].colisao_acima_direita)) && this.direcao == 'right') {

				this.vel_x = -1;

			}

			if (i < this.largura) {

				if ((solidos.includes(getBlock(colisoes[i].colisao_acima_esquerda)) || solidos.includes(getBlock(colisoes[i].colisao_acima_direita))) && solidos.includes(getBlock(colisoes[i].colisao_acima))) {

					this.colisao_acima = true;

					if (this.vel_y < 0) {

						this.vel_y = 0;

					}

				} else {

					this.colisao_acima = false;

				}

			}

			if (i >= colisoes.length - this.largura) {

				if (solidos.includes(getBlock(colisoes[i].colisao_abaixo))) {

					this.pos_y = getCoordenadasCanvas([this.pos_x, this.pos_y])[1] * block_height;

					if (this.vel_y > this.constructor.VEL_QUEDA_MORTE) {

						this.aplicarDano(100);

					}

					this.vel_y = 0;
					this.no_ar = false;
					this.cooldown_move = false;
					this.double_jump = false;

				} else {

					this.vel_y += 1;

				}

			}

		}

	}

}