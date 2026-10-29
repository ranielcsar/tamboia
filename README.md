> - [Trello](https://trello.com/b/ft4tlqL5/tamboia) contendo sprints (Scrum);
> - [Figma](https://www.figma.com/design/FvqAk3cyCMq6SUEQDKd2yG/Tamboia?node-id=0-1&t=6b0yew7qqc1UCv4x-1) contendo as telas pensadas para o jogo;
> - [Versão online](https://ranielcsar.github.io/tamboia/) para jogar :D

# **Sobre o jogo**

“Tamboia” é um jogo matemático no qual foi usado como base o famoso “jogo da cobrinha”. O nome vem de "ta" \- **tabuada** e **mboia** \- "cobra" em tupi. O diferencial está na jogabilidade, cujo objetivo é ajudar com a tabuada. Nele a “cobrinha” se movimenta pela tela, na qual existirá uma “fruta” com um número aleatório entre 1 e 9\. Assim que a cobrinha pegar uma fruta, aparecerá outra com um número aleatório também entre 1 e 9\. Após isso, aparecerão duas frutas, uma com o valor correto da multiplicação e outra com um valor próximo ao correto. Caso o jogador acerte, ganha-se mais pontos e o tamanho da cobrinha aumenta, caso contrário, perde-se pontos e diminui a cobrinha. O fim de jogo ocorre quando a cobrinha diminui por completo (até o mínimo) ou quando o jogador morde a própria cauda.

# **Tabela de Requisitos Funcionais**

| Código | Requisito |
| :---: | ----- |
| RF01 | O sistema deve apresentar uma cobra que se move na tela. |
| RF02 | O jogador controla a direção da cobra com as setas do teclado. |
| RF03 | A cobra deve se teletransportar ao tocar as bordas da tela. |
| RF04 | Frutas com números de 1 a 9 aparecem aleatoriamente. |
| RF05 | Ao comer uma fruta, o número é armazenado para formar uma multiplicação (primeiro e segundo fator). |
| RF06 | Após coletar dois números, surge uma fruta com o resultado correto e outra com resultado incorreto. |
| RF07 | O jogador deve escolher a fruta com o valor correto da multiplicação. |
| RF08 | Acertar aumenta o tamanho da cobra. |
| RF09 | Errar diminui o tamanho da cobra. |
| RF10 | Pontuação deverá ter como total de acertos. |
| RF11 | O jogo termina se a cobra chegar ao valor abaixo do mínimo (3) ou morder a própria cauda. |
| RF12 | O jogo poderá ser pausado e continuado a qualquer momento. |
| RF13 | O jogo deverá mostrar uma tela de "Fim de Jogo" com a opção de jogar novamente. |
| RF14 | O jogo deve aumentar o número de frutas normais adicionais (distratores) na tela conforme o tamanho da cobra (nível) aumenta. |
| RF15 | A velocidade do movimento da cobra deve aumentar um pouco a cada nível; existe um limite para não deixar muito rápido. |
| RF16 | As frutas não devem ser geradas em posições ocupadas por outras frutas na tela. |
| RF17 | Na versão mobile, o jogo deverá apresentar controles direcionais na tela. |
| RF18 | O jogo deve apresentar um tutorial automatizado integrado, sem necessidade de explicações orais. |
| RF19 | O jogo deve incluir animações visuais para feedback de ações (acertos, erros, coleta de frutas, fim de jogo). |
| RF20 | O jogo deve incluir efeitos sonoros para as ações do jogador e eventos do jogo. |
| RF21 | O jogo deve oferecer um tema de cores baseado no Dalton's Game, voltado para pessoas com daltonismo. |
| RF22 | O jogo deve permitir a seleção de módulos de conteúdo (tabuada, frações, quatro operações básicas). |
| RF23 | O módulo de frações deve utilizar o "gráfico de pizza" (setores) como elemento visual das frutas. |
| RF24 | O módulo de frações deve apresentar interação baseada no conceito de frações (ex.: seleção/identificação de frações representadas graficamente). |
| RF25 | O módulo das quatro operações básicas deve abordar adição, subtração, multiplicação e divisão. |

# **Tabela de Requisitos Não Funcionais**

| Código | Requisito |
| :---: | ----- |
| RNF01 | O sistema deve responder aos comandos do teclado em no máximo 100 milissegundos. |
| RNF02 | A geração dos números das frutas "numero" e "resultado" deve seguir regras para evitar discrepâncias. |
| RNF03 | O sistema deve funcionar em navegadores desktop modernos (Chrome, Firefox, Edge). |
| RNF04 | A interface deve apresentar cores contrastantes para facilitar a leitura dos números nas frutas. |
| RNF05 | O jogo deve manter o estado da partida (pontuação e tamanho da cobra) sem perda de dados durante a execução. |
| RNF06 | O sistema deve ser desenvolvido em linguagem compatível com execução no navegador (ex.: JavaScript/HTML5). |
| RNF07 | Fontes personalizadas para que o visual fique mais agradável/amigável. |
| RNF08 | A dimensão das células (pixels do jogo) e do Canvas deve se ajustar dinamicamente de acordo com a largura e altura do elemento principal da tela. |
| RNF09 | O tutorial deve ser executado automaticamente no próprio jogo, dispensando mediação oral. |
| RNF10 | As animações devem contribuir para o feedback sem comprometer a responsividade dos comandos (RNF01). |
| RNF11 | Os efeitos sonoros devem ser controláveis (ativação/desativação) pelo jogador. |
| RNF12 | O tema de cores deve atender aos princípios de acessibilidade para daltonismo, garantindo contraste e distinção entre elementos (complementando RNF04). |
| RNF13 | A arquitetura do jogo deve permitir a extensão modular de conteúdo sem impactar os módulos existentes. |
| RNF14 | A representação de frações por setores deve manter proporcionalidade matemática correta. |

# **Aspectos de Qualidade conforme ISO/IEC 25000 (SQuaRE)**

1. **Desempenho (Eficiência de Desempenho)** – O sistema deve manter taxa de quadros estável (mínimo de 30 FPS) durante toda a partida, mesmo com o aumento do tamanho da cobra, garantindo fluidez nos movimentos e na resposta aos comandos.  
2. **Usabilidade** – O feedback visual (acerto/erro) deve ser imediato, de modo que o jogador entenda rapidamente o resultado de sua escolha.  
3. **Confiabilidade** – O sistema deve estar livre de falhas que causem travamentos ou comportamento inesperado, como números duplicados ou posições inválidas para as frutas, assegurando que a partida siga sem interrupções até o fim de jogo.
