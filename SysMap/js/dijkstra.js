/**
 * Implementação do algoritmo de Dijkstra para encontrar o caminho mais curto em um grafo
 */
class Dijkstra {
    constructor(grafo) {
        this.grafo = grafo;
    }

    /**
     * Encontra o caminho mais curto entre dois nós
     * @param {string} origem - ID do nó de origem
     * @param {string} destino - ID do nó de destino
     * @param {string} criterio - Critério de peso ('distancia', 'tempo' ou 'custo')
     * @returns {Object} Objeto contendo o caminho e o custo total
     */
    encontrarCaminhoMaisCurto(origem, destino, criterio = 'distancia') {
        // Verifica se os nós de origem e destino existem
        if (!this.grafo.nos.has(origem) || !this.grafo.nos.has(destino)) {
            console.error('Nó de origem ou destino não encontrado no grafo');
            return { caminho: [], custo: Infinity };
        }

        // Inicialização
        const distancias = new Map();  // Distância da origem para cada nó
        const anteriores = new Map();  // Nó anterior no caminho ótimo
        const naoVisitados = new Set(); // Conjunto de nós não visitados

        // Inicializa todas as distâncias como infinito e anteriores como null
        for (const no of this.grafo.nos.keys()) {
            distancias.set(no, Infinity);
            anteriores.set(no, null);
            naoVisitados.add(no);
        }

        // A distância da origem para ela mesma é 0
        distancias.set(origem, 0);

        // Enquanto houverem nós não visitados
        while (naoVisitados.size > 0) {
            // Encontra o nó não visitado com a menor distância
            let noAtual = this.encontrarNoMenorDistancia(distancias, naoVisitados);
            
            // Se o nó atual for o destino, retorna o caminho
            if (noAtual === destino) {
                return this.reconstruirCaminho(anteriores, origem, destino, distancias.get(destino));
            }

            // Remove o nó atual do conjunto de não visitados
            naoVisitados.delete(noAtual);

            // Para cada vizinho do nó atual
            for (const [vizinho, atributos] of this.grafo.vizinhos(noAtual).entries()) {
                // Se o vizinho já foi visitado, continua
                if (!naoVisitados.has(vizinho)) continue;

                // Escolhe o peso baseado no critério
                let peso;
                switch (criterio) {
                    case 'tempo':
                        peso = atributos.tempo;
                        break;
                    case 'custo':
                        peso = atributos.custo;
                        break;
                    case 'distancia':
                    default:
                        peso = atributos.distancia;
                        break;
                }

                // Calcula a nova distância até o vizinho
                const novaDistancia = distancias.get(noAtual) + peso;

                // Se a nova distância for menor que a atual
                if (novaDistancia < distancias.get(vizinho)) {
                    // Atualiza a distância e o nó anterior
                    distancias.set(vizinho, novaDistancia);
                    anteriores.set(vizinho, noAtual);
                }
            }
        }

        // Se chegou aqui, não há caminho até o destino
        return { caminho: [], custo: Infinity };
    }

    /**
     * Encontra o nó não visitado com a menor distância
     * @param {Map} distancias - Mapa de distâncias atuais
     * @param {Set} naoVisitados - Conjunto de nós não visitados
     * @returns {string} ID do nó com menor distância
     */
    encontrarNoMenorDistancia(distancias, naoVisitados) {
        let menorDistancia = Infinity;
        let noMenorDistancia = null;

        // Percorre todos os nós não visitados
        for (const no of naoVisitados) {
            const distanciaAtual = distancias.get(no);
            if (distanciaAtual < menorDistancia) {
                menorDistancia = distanciaAtual;
                noMenorDistancia = no;
            }
        }

        return noMenorDistancia;
    }

    /**
     * Reconstrói o caminho a partir do destino até a origem
     * @param {Map} anteriores - Mapa de nós anteriores
     * @param {string} origem - ID do nó de origem
     * @param {string} destino - ID do nó de destino
     * @param {number} custoTotal - Custo total do caminho
     * @returns {Object} Objeto com o caminho e o custo total
     */
    reconstruirCaminho(anteriores, origem, destino, custoTotal) {
        const caminho = [];
        let atual = destino;

        // Reconstrói o caminho de trás para frente
        while (atual !== null) {
            caminho.unshift({
                id: atual,
                ...this.grafo.nos.get(atual)
            });
            atual = anteriores.get(atual);
        }

        // Verifica se o caminho é válido (começa na origem)
        if (caminho.length > 0 && caminho[0].id === origem) {
            return {
                caminho: caminho,
                custo: custoTotal
            };
        }

        // Se não for válido, retorna um caminho vazio
        return { caminho: [], custo: Infinity };
    }
}

// Exporta a classe para uso em outros arquivos
window.Dijkstra = Dijkstra; 