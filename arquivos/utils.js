
function tocarSom(arquivo, volume = 100) {

	var som = new Audio(arquivo);
	som.volume = volume / 100;
	som.play();

}

function pushTextoUI(texto_ui, pos_x, pos_y) {

	array_extras_ui.push( { texto: texto_ui, x: pos_x, y: pos_y } );

}

var indice_falas_level = 0;

function falarTextoLevel() {

	console.log('executou');

	jogador.falar(current_level.falar[indice_falas_level], 200);
	indice_falas_level++;

	if (indice_falas_level < current_level.falar.length) {

		setTimeout(falarTextoLevel, 5000);

	} else {

		trigger_ativado = true;

	}

}

function getCoordenadasCanvas(ponto) {

	var coluna = Math.floor(ponto[0] / block_width);
	var linha  = Math.floor(ponto[1] / block_height);

	var coordenada = [coluna, linha];
	return coordenada;

}

function getBlock(coordenada) {

	if (current_level != null) {

		var fx = coordenada[0], fy = coordenada[1];

		if (fx >= cols) {

			fx = cols - 1;

		} else if (fx < 0) {

			fx = 0;

		}

		if (fy >= linhas) {

			fy = linhas - 1;

		} else if (fy < 0) {

			fy = 0;

		}

		return current_level.mapa[fy][fx];

	} else {

		return 0;

	}

}

function getDanoByTipo(tipo) {

	switch (tipo) {

		case 's':

			return InimigoEstatico.dano;
			break;

		default:

			return Inimigo.dano;
			break;

	}

}

function getColisoes(x, y, w, h) {

	var array_colisoes = [];
	var c_acima, c_acima_direita, c_direita, c_abaixo_direita, c_abaixo, c_abaixo_esquerda, c_esquerda, c_acima_esquerda;

	for (var i = 0; i < h; i++) {

		for (var j = 0; j < w; j++) {

			//console.log(y);

			c_esquerda        =	getCoordenadasCanvas([x+block_width*j, y+block_height*i + block_height/2]);
			c_acima_esquerda  = getCoordenadasCanvas([x+block_width*j, y+block_height*i]);
			c_acima 		  = getCoordenadasCanvas([x+block_width*j + block_width/2, y+block_height*i]);
			c_acima_direita   = getCoordenadasCanvas([x+block_width*j + block_width, y+block_height*i]);
			c_direita         =	getCoordenadasCanvas([x+block_width*j + block_width, y+block_height*i + block_height/2]);
			c_abaixo_direita  =	getCoordenadasCanvas([x+block_width*j + block_width, y+block_height*i + block_height]);
			c_abaixo 	 	  = getCoordenadasCanvas([x+block_width*j + block_width/2, y+block_height*i + block_height]);
			c_abaixo_esquerda = getCoordenadasCanvas([x+block_width*j, y+block_height*i + block_height]);

			array_colisoes.push( { colisao_acima: c_acima, colisao_acima_direita: c_acima_direita, colisao_direita: c_direita, colisao_abaixo_direita: c_abaixo_direita, colisao_abaixo: c_abaixo, colisao_abaixo_esquerda: c_abaixo_esquerda, colisao_esquerda: c_esquerda, colisao_acima_esquerda: c_acima_esquerda } );

		}

	}

	return array_colisoes;

}

function gerarId() {

	return Math.random().toString(16).slice(2);

}

function getModa(array) {

    if (array.length == 0) {

        return null;

    }

    var modeMap = {};
    var maxEl = array[0], maxCount = 1;

    for (var i = 0; i < array.length; i++) {

        var el = array[i];

        if( modeMap[el] == null) {
            
            modeMap[el] = 1;

        } else {
    
            modeMap[el]++;  
        }

        if (modeMap[el] > maxCount) {

            maxEl = el;
            maxCount = modeMap[el];
        
        }

    }

    return maxEl;
    
}