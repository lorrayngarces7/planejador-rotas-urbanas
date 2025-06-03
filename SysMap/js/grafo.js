/**
 * Classe que representa um grafo para armazenar a rede viária
 */
class Grafo {
    constructor() {
        // Mapa de nós: chave é o ID do nó (pode ser um endereço ou coordenada)
        // e valor é um objeto com informações do nó, como coordenadas lat/lng
        this.nos = new Map();
        
        // Mapa de arestas: chave é o ID da origem e valor é um Map de destinos
        // onde a chave é o ID do destino e o valor são os atributos da aresta (distância, tempo, etc.)
        this.arestas = new Map();
    }

    /**
     * Adiciona um nó ao grafo
     * @param {string} id - Identificador único do nó
     * @param {Object} atributos - Propriedades do nó, como coordenadas
     */
    adicionarNo(id, atributos) {
        this.nos.set(id, atributos);
        if (!this.arestas.has(id)) {
            this.arestas.set(id, new Map());
        }
    }

    /**
     * Adiciona uma aresta direcionada entre dois nós
     * @param {string} origem - ID do nó de origem
     * @param {string} destino - ID do nó de destino
     * @param {Object} atributos - Atributos da aresta (distância, tempo, custo)
     */
    adicionarAresta(origem, destino, atributos) {
        // Se algum dos nós não existir, não adiciona a aresta
        if (!this.nos.has(origem) || !this.nos.has(destino)) {
            console.error(`Um dos nós não existe: ${origem} -> ${destino}`);
            return;
        }

        // Adiciona a aresta
        this.arestas.get(origem).set(destino, atributos);
    }

    /**
     * Adiciona uma aresta bidirecional (duas arestas direcionadas)
     * @param {string} no1 - ID do primeiro nó
     * @param {string} no2 - ID do segundo nó
     * @param {Object} atributos - Atributos da aresta (distância, tempo, custo)
     */
    adicionarArestaBidirecional(no1, no2, atributos) {
        this.adicionarAresta(no1, no2, atributos);
        this.adicionarAresta(no2, no1, atributos);
    }

    /**
     * Retorna todos os vizinhos (destinos) de um nó
     * @param {string} id - ID do nó
     * @returns {Map} Mapa com os vizinhos e seus atributos
     */
    vizinhos(id) {
        return this.arestas.get(id) || new Map();
    }

    /**
     * Converte um endereço em um ID para o grafo
     * @param {string} endereco - Endereço completo
     * @returns {string} ID formatado para o grafo
     */
    enderecoParaId(endereco) {
        // Simplifica o endereço para uso como ID
        return endereco.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Cria nós e arestas a partir dos resultados da API do Google Maps
     * @param {Object} resultado - Objeto contendo detalhes da rota do Google Maps
     */
    criarGrafoDeRotaGoogleMaps(resultado) {
        const rota = resultado.routes[0];
        
        // Limpa o grafo anterior
        this.nos.clear();
        this.arestas.clear();

        // Percorre cada perna da rota
        rota.legs.forEach(leg => {
            let noAnterior = null;
            let idAnterior = null;

            // Adiciona o ponto de origem
            const origemId = `${leg.start_location.lat},${leg.start_location.lng}`;
            this.adicionarNo(origemId, {
                lat: leg.start_location.lat,
                lng: leg.start_location.lng,
                endereco: leg.start_address
            });
            
            noAnterior = leg.start_location;
            idAnterior = origemId;

            // Adiciona cada ponto da rota detalhada com suas conexões
            leg.steps.forEach(step => {
                const atualId = `${step.end_location.lat},${step.end_location.lng}`;
                
                this.adicionarNo(atualId, {
                    lat: step.end_location.lat,
                    lng: step.end_location.lng,
                    instrucao: step.instructions
                });

                // Adiciona uma aresta entre o ponto anterior e o atual
                this.adicionarAresta(idAnterior, atualId, {
                    distancia: step.distance.value, // em metros
                    tempo: step.duration.value, // em segundos
                    // Estimativa de custo baseada na distância (exemplo)
                    custo: step.distance.value * 0.002
                });

                noAnterior = step.end_location;
                idAnterior = atualId;
            });

            // Adiciona o ponto de destino
            const destinoId = `${leg.end_location.lat},${leg.end_location.lng}`;
            this.adicionarNo(destinoId, {
                lat: leg.end_location.lat,
                lng: leg.end_location.lng,
                endereco: leg.end_address
            });

            // Conecta o último ponto da rota com o destino
            this.adicionarAresta(idAnterior, destinoId, {
                distancia: 0,
                tempo: 0,
                custo: 0
            });
        });
    }
}

// Exporta a classe para uso em outros arquivos
window.Grafo = Grafo; 