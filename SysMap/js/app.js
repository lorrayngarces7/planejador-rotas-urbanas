/**
 * Arquivo principal que coordena as funcionalidades do aplicativo
 */
class RotasUrbanas {
    constructor() {
        // Inicializa as propriedades
        this.grafo = new Grafo();
        this.dijkstra = new Dijkstra(this.grafo);
        this.elementosDOM = {
            origem: document.getElementById('origem'),
            destino: document.getElementById('destino'),
            ordenacao: document.getElementById('ordenacao'),
            buscarRota: document.getElementById('buscar-rota'),
            distancia: document.getElementById('distancia'),
            tempo: document.getElementById('tempo'),
            custo: document.getElementById('custo'),
            infoPanel: document.getElementById('info-panel'),
            routeDetails: document.getElementById('route-details'),
            origemDetalhe: document.getElementById('origem-detalhe'),
            destinoDetalhe: document.getElementById('destino-detalhe'),
            tabs: document.querySelectorAll('.tab')
        };

        // Registra os eventos da interface
        this.registrarEventos();
        
        // Inicializa estado da UI
        this.atualizarStatusOrigem("Aguardando origem...");
        this.atualizarStatusDestino("Aguardando destino...");
    }

    /**
     * Registra os eventos dos elementos da página
     */
    registrarEventos() {
        // Evento de clique no botão de buscar rota
        this.elementosDOM.buscarRota.addEventListener('click', () => this.buscarRota());
        
        // Evento de mudança no critério de ordenação
        this.elementosDOM.ordenacao.addEventListener('change', () => {
            // Se já tiver dados de rota, recalcula a melhor rota
            if (this.rotaAtual) {
                this.processarRotas(this.rotaAtual);
            }
        });
        
        // Eventos para os campos de origem e destino
        this.elementosDOM.origem.addEventListener('change', () => {
            if (this.elementosDOM.origem.value) {
                this.atualizarStatusOrigem(this.elementosDOM.origem.value);
            } else {
                this.atualizarStatusOrigem("Aguardando origem...");
            }
        });
        
        this.elementosDOM.destino.addEventListener('change', () => {
            if (this.elementosDOM.destino.value) {
                this.atualizarStatusDestino(this.elementosDOM.destino.value);
            } else {
                this.atualizarStatusDestino("Aguardando destino...");
            }
        });
        
        // Eventos para as tabs
        this.elementosDOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.elementosDOM.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    /**
     * Atualiza o status de origem no painel
     * @param {string} texto - O texto do status
     */
    atualizarStatusOrigem(texto) {
        this.elementosDOM.origemDetalhe.textContent = texto;
    }
    
    /**
     * Atualiza o status de destino no painel
     * @param {string} texto - O texto do status
     */
    atualizarStatusDestino(texto) {
        this.elementosDOM.destinoDetalhe.textContent = texto;
    }

    /**
     * Busca uma rota entre a origem e o destino especificados
     */
    async buscarRota() {
        const origem = this.elementosDOM.origem.value;
        const destino = this.elementosDOM.destino.value;

        // Verifica se os campos estão preenchidos
        if (!origem || !destino) {
            this.mostrarMensagem('Por favor, preencha os campos de origem e destino.');
            return;
        }

        try {
            // Mostra mensagem de carregamento
            this.mostrarMensagem('Buscando rotas, por favor aguarde...');
            
            // Atualiza os status
            this.atualizarStatusOrigem(origem);
            this.atualizarStatusDestino(destino);
            
            // Busca a rota usando a API do Google Maps
            const resultadoRota = await mapsService.obterRota(origem, destino);
            
            // Armazena o resultado para uso posterior
            this.rotaAtual = resultadoRota;
            
            // Processa as rotas encontradas
            this.processarRotas(resultadoRota);
        } catch (erro) {
            this.mostrarMensagem(`Erro ao buscar rota: ${erro}`);
        }
    }

    /**
     * Processa as rotas encontradas pela API do Google Maps
     * @param {Object} resultadoRota - Resultado da API de direções
     */
    processarRotas(resultadoRota) {
        // Converte a rota do Google Maps para um grafo
        this.grafo.criarGrafoDeRotaGoogleMaps(resultadoRota);

        // Obtém os pontos de origem e destino da rota
        const rota = resultadoRota.routes[0];
        const leg = rota.legs[0];
        const origem = `${leg.start_location.lat()},${leg.start_location.lng()}`;
        const destino = `${leg.end_location.lat()},${leg.end_location.lng()}`;

        // Obtém o critério de ordenação selecionado
        const criterio = this.elementosDOM.ordenacao.value;

        // Calcula a melhor rota usando o algoritmo de Dijkstra
        const resultado = this.dijkstra.encontrarCaminhoMaisCurto(origem, destino, criterio);

        // Se não encontrou uma rota válida
        if (!resultado.caminho.length) {
            this.mostrarMensagem('Não foi possível encontrar uma rota entre os pontos especificados.');
            return;
        }

        // Desenha a rota no mapa
        mapsService.desenharRotaDijkstra(resultado.caminho, criterio);

        // Exibe as informações da rota
        this.exibirInformacoesDaRota(resultado, leg);

        // Mostra uma mensagem de sucesso
        this.mostrarMensagem(`Rota encontrada com sucesso! Ordenação: ${this.getNomeCriterio(criterio)}`);
        
        // Atualiza os detalhes com os endereços completos
        this.atualizarStatusOrigem(leg.start_address);
        this.atualizarStatusDestino(leg.end_address);
    }

    /**
     * Obtém o nome amigável para o critério de ordenação
     * @param {string} criterio - Código do critério
     * @returns {string} Nome amigável do critério
     */
    getNomeCriterio(criterio) {
        switch (criterio) {
            case 'tempo': return 'Menor tempo';
            case 'custo': return 'Menor custo';
            case 'distancia': return 'Menor distância';
            default: return 'Personalizado';
        }
    }

    /**
     * Exibe as informações da rota calculada
     * @param {Object} resultadoDijkstra - Resultado do algoritmo de Dijkstra
     * @param {Object} legOriginal - Trecho original da rota do Google Maps
     */
    exibirInformacoesDaRota(resultadoDijkstra, legOriginal) {
        // Exibe os detalhes da rota
        this.elementosDOM.routeDetails.classList.remove('hidden');

        // Formata e exibe a distância
        const distanciaTexto = legOriginal.distance.text;
        this.elementosDOM.distancia.textContent = distanciaTexto.replace(' km', '');

        // Formata e exibe o tempo
        const tempoTexto = legOriginal.duration.text;
        this.elementosDOM.tempo.textContent = tempoTexto.replace('minutos', 'min').replace('min', 'min');

        // Calcula e exibe o custo estimado (exemplo simples)
        const custoEstimado = (legOriginal.distance.value / 1000 * 0.5).toFixed(2);
        this.elementosDOM.custo.textContent = `${custoEstimado}`;
    }

    /**
     * Exibe uma mensagem no painel de informações
     * @param {string} mensagem - Mensagem a ser exibida
     */
    mostrarMensagem(mensagem) {
        this.elementosDOM.infoPanel.innerHTML = `<p>${mensagem}</p>`;
    }
}

// Inicializa o aplicativo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RotasUrbanas();
}); 