/**
 * Classe responsável pela integração com a API do Google Maps
 */
class MapsService {
    constructor() {
        this.map = null;
        this.autocompleteOrigem = null;
        this.autocompleteDestino = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.marcadores = [];
        
        // Inicializa o mapa quando a página carregar
        window.addEventListener('load', () => this.inicializarMapa());
    }

    /**
     * Inicializa o mapa do Google e seus componentes
     */
    inicializarMapa() {
        // Estilo dark para o mapa
        const mapStyle = [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ];

        // Cria o mapa centralizado no Brasil
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -15.7801, lng: -47.9292 }, // Coordenadas de Brasília
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: mapStyle,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            }
        });

        // Inicializa os serviços de rotas
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true,
            preserveViewport: false,
            polylineOptions: {
                strokeColor: "#3498db",
                strokeWeight: 5,
                strokeOpacity: 0.7
            }
        });

        // Inicializa os campos de autocompletar endereços
        this.inicializarAutocompletar();
    }

    /**
     * Configura o autocomplete para os campos de origem e destino
     */
    inicializarAutocompletar() {
        const opcoesAutocomplete = {
            types: ['geocode', 'establishment'],
            fields: ['place_id', 'formatted_address', 'geometry', 'name'],
        };

        // Autocomplete para o campo de origem
        const inputOrigem = document.getElementById('origem');
        this.autocompleteOrigem = new google.maps.places.Autocomplete(
            inputOrigem,
            opcoesAutocomplete
        );

        // Autocomplete para o campo de destino
        const inputDestino = document.getElementById('destino');
        this.autocompleteDestino = new google.maps.places.Autocomplete(
            inputDestino,
            opcoesAutocomplete
        );

        // Evita envio de formulário quando selecionar um local
        inputOrigem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
        
        inputDestino.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
        
        // Atualiza os detalhes ao selecionar um local
        this.autocompleteOrigem.addListener('place_changed', () => {
            const place = this.autocompleteOrigem.getPlace();
            if (place.formatted_address) {
                document.getElementById('origem-detalhe').textContent = place.formatted_address;
            }
        });
        
        this.autocompleteDestino.addListener('place_changed', () => {
            const place = this.autocompleteDestino.getPlace();
            if (place.formatted_address) {
                document.getElementById('destino-detalhe').textContent = place.formatted_address;
            }
        });
    }

    /**
     * Obtém detalhes da rota entre dois pontos usando a API do Google Maps
     * @param {string} origem - Endereço de origem
     * @param {string} destino - Endereço de destino
     * @param {string} modoViagem - Modo de viagem (DRIVING por padrão)
     * @returns {Promise} Promise que resolve com os detalhes da rota
     */
    obterRota(origem, destino, modoViagem = 'DRIVING') {
        return new Promise((resolve, reject) => {
            const request = {
                origin: origem,
                destination: destino,
                travelMode: google.maps.TravelMode[modoViagem],
                provideRouteAlternatives: true,
                optimizeWaypoints: true,
            };

            this.directionsService.route(request, (resultado, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    // Exibe a rota no mapa
                    this.directionsRenderer.setDirections(resultado);
                    
                    // Adiciona marcadores de origem e destino
                    this.adicionarMarcadores(resultado);
                    
                    // Retorna o resultado para processamento adicional
                    resolve(resultado);
                } else {
                    reject(`Erro ao obter rota: ${status}`);
                }
            });
        });
    }

    /**
     * Adiciona marcadores para origem e destino no mapa
     * @param {Object} resultado - Resultado da API de direções
     */
    adicionarMarcadores(resultado) {
        // Limpa marcadores anteriores
        this.limparMarcadores();

        // Pega o primeiro trecho da rota
        const rota = resultado.routes[0];
        const leg = rota.legs[0];

        // Define ícones personalizados
        const origemIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3498db',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 7
        };

        const destinoIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#e74c3c',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 7
        };

        // Cria marcador para o ponto de origem
        const marcadorOrigem = new google.maps.Marker({
            position: leg.start_location,
            map: this.map,
            title: 'Origem: ' + leg.start_address,
            icon: origemIcon,
            zIndex: 2
        });
        this.marcadores.push(marcadorOrigem);

        // Cria marcador para o ponto de destino
        const marcadorDestino = new google.maps.Marker({
            position: leg.end_location,
            map: this.map,
            title: 'Destino: ' + leg.end_address,
            icon: destinoIcon,
            zIndex: 2
        });
        this.marcadores.push(marcadorDestino);
    }

    /**
     * Remove todos os marcadores do mapa
     */
    limparMarcadores() {
        this.marcadores.forEach(marcador => marcador.setMap(null));
        this.marcadores = [];
    }

    /**
     * Desenha uma rota calculada pelo algoritmo de Dijkstra no mapa
     * @param {Array} caminho - Array de pontos (nós) representando o caminho
     * @param {string} criterio - Critério usado na ordenação (para cor da linha)
     */
    desenharRotaDijkstra(caminho, criterio) {
        // Se não houver pontos suficientes, não desenha nada
        if (!caminho || caminho.length < 2) return;

        // Determina a cor baseada no critério
        let cor;
        switch (criterio) {
            case 'tempo':
                cor = '#ff7700'; // Laranja para tempo
                break;
            case 'custo':
                cor = '#0077ff'; // Azul para custo
                break;
            case 'distancia':
            default:
                cor = '#ff0000'; // Vermelho para distância
                break;
        }

        // Converte o caminho em um array de coordenadas para o polyline
        const pontos = caminho.map(ponto => {
            const [lat, lng] = ponto.id.split(',').map(parseFloat);
            return { lat, lng };
        });

        // Cria um polyline para desenhar o caminho
        const caminhoPoly = new google.maps.Polyline({
            path: pontos,
            geodesic: true,
            strokeColor: cor,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            strokeLinecap: "round",
            map: this.map,
            zIndex: 1
        });
        
        // Adiciona um efeito de brilho na linha
        const caminhoBrilho = new google.maps.Polyline({
            path: pontos,
            geodesic: true,
            strokeColor: cor,
            strokeOpacity: 0.3,
            strokeWeight: 8,
            strokeLinecap: "round",
            map: this.map,
            zIndex: 0
        });
        
        this.marcadores.push(caminhoPoly);
        this.marcadores.push(caminhoBrilho);
    }
}

// Inicializa e exporta a instância do serviço de mapas
window.mapsService = new MapsService(); 