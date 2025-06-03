# Planejador de Rotas Urbanas

Um aplicativo web para planejamento e visualização de rotas urbanas utilizando o algoritmo de Dijkstra para encontrar os melhores trajetos com base em diferentes critérios (tempo, distância e custo).

![Imagem do aplicativo](https://github.com/placeholder/screenshot.png)

## Funcionalidades

- Busca de rotas entre dois endereços
- Autocompletar de endereços usando a API do Google Maps
- Ordenação de rotas por:
  - Tempo estimado
  - Distância
  - Custo estimado
- Visualização do caminho mais curto usando algoritmo de Dijkstra
- Interface moderna e responsiva com tema escuro

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript puro
- Google Maps JavaScript API
- Algoritmo de Dijkstra implementado em JavaScript
- Estrutura de dados de grafos para representação da rede viária

## Como Usar

1. Clone o repositório
2. Obtenha uma chave de API do Google Maps na [Google Cloud Platform](https://console.cloud.google.com/)
3. Edite o arquivo `index.html` e substitua `SUA_CHAVE_API_AQUI` pela sua chave de API do Google Maps
4. Abra o arquivo `index.html` em um navegador web moderno

## Implementação do Algoritmo de Dijkstra

O projeto utiliza o algoritmo de Dijkstra para encontrar o caminho mais curto em um grafo ponderado, aplicando diferentes critérios:

1. O mapa da cidade é modelado como um grafo, onde:
   - Nós representam interseções ou pontos de interesse
   - Arestas representam vias que conectam esses pontos
   - Pesos das arestas podem ser distância, tempo ou custo estimado

2. O algoritmo de Dijkstra é executado para encontrar o caminho mais eficiente entre origem e destino

3. O resultado é visualizado no mapa com diferentes cores dependendo do critério escolhido:
   - Vermelho para menor distância
   - Laranja para menor tempo
   - Azul para menor custo

## Estrutura do Projeto

- `index.html` - Estrutura principal da aplicação
- `css/style.css` - Estilos e layout
- `js/`
  - `app.js` - Coordena as funcionalidades da aplicação
  - `grafo.js` - Implementação da estrutura de dados de grafo
  - `dijkstra.js` - Implementação do algoritmo de Dijkstra
  - `maps.js` - Integrações com a API do Google Maps

## Requisitos

- Navegador com suporte a JavaScript moderno
- Conexão com internet para acessar a API do Google Maps
- Chave de API válida do Google Maps com as APIs de Maps JavaScript e Places habilitadas

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes. 