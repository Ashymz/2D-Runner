        /* 
    Class:      Timer()
    Desc:       Normalização do tempo entre frames
    Metodos:    tick()          - Calcula o tempo entre os frames e retorna em millesegundos
    Status:     [//////////] 100%     
    */
    function Timer() {
        this.deltaTime = 0;
        var lastFrameTime = 0;
        var thisFrameTime = 0;
        var MAXDELTA = 1000 / 60;
        Timer.prototype.tick = function() {
          //Retorna o tempo entre o ultimo frame e o frame atual, ou o valor máximo, o que for maior (evita pulo em troca de abas/janelas)
          this.deltaTime = Math.min((thisFrameTime - lastFrameTime), MAXDELTA);
          lastFrameTime = thisFrameTime;
          thisFrameTime = new Date().getTime(); // milliseconds  
        }
      }
      /*
      Class:      AnimatedSprite(image, List<object>)
      Desc:       Anima os sprites passados
      Metodos:    play(String, Function)  - Define animação
                  update(Timer)           - Atualiza quadro do sprite          
                  getFrame()              - Retorna o quadro do sprite
      Status:     [//////////] 100%                    
      */
      function AnimatedSprite(image, animationList) {
        //Armazenar animação que está sendo reproduzida
        var animation = null; //Inicializa animação
        //Recebe nome da animação e opções
        AnimatedSprite.prototype.play = function(name, options) {
          if (options == null)
            options = {
              loop: true,
              onFinish: function() {}
            };
          //Procura animação na lista de animações (animationList) passada pelo "name"
          for (i = 0; i < animationList.length; i++) {
            //Caso encontrar atribui os valores do valor encontrado para variavel animation
            if (animationList[i].name == name) {
              animation = animationList[i];
              animation.timePerFrame = animation.time / animation.numFrames; //Tempo de cada quadro
              animation.frameTime = 0; //Tempo percorrido pelo quadro atual
              animation.index = 0; //Define frame reproduzido
              animation.loop = options.loop; //Recebe valor de "loop"
              animation.onFinish = options.onFinish; //Recebe função de "onFinish"
              animation.frame = {}; //Novo objeto para receber informações de cada frame
              animation.frame.image = image; //Quadro atual recebe imagem passada
              animation.frame.x = animation.x; //Recebe posição Horizontal do quadro
              animation.frame.y = animation.y; //Recebe posição Verfica do quadro
              animation.frame.w = animation.w; //Recebe largura do quadro
              animation.frame.h = animation.h; //Recebe altura do quadro
              return;
            }
          }
        };
        //Atualiza frame
        AnimatedSprite.prototype.update = function(t) {
          //Se animação ainda for vazia, não fazer nada
          if (animation == null) {
            return;
          }
          //Converte t(millisegundos) para segundos e define tempo entre quadros
          deltaSeconds = t * 0.001;
          animation.frameTime += deltaSeconds;
          //Caso o quadro da animação seja o ultimo e o Loop = false, não continuar.
          if ((animation.index == animation.numFrames - 1) && !animation.loop) {
            return;
          }
          //Se o tempo do quadro for maior ou igual o tempo do quadro definido, passa para o próximo
          if (animation.frameTime >= animation.timePerFrame) {
            //Se loop for verdadeiro aumenta o indice da imagem para +1
            if (animation.loop) {
              animation.index = ((animation.index + 1) % animation.numFrames);
            } else {
              animation.index = Math.min((animation.index + 1), animation.numFrames - 1);
            }
            animation.frameTime = animation.frameTime - animation.timePerFrame; //Compensa tempo perdido se o tempo que o quadro percorreu for maior que o tempo estimado
            animation.frame.x = animation.x + animation.w * animation.index; //Atualiza o quadro
            if (animation.index == animation.numFrames - 1 && animation.onFinish) {
              animation.onFinish();
            }
          }
        };
        //Retorna quadro
        AnimatedSprite.prototype.getFrame = function() {
          return animation.frame;
        }
      }
      /*
      Class:      Hero(context, image, rect, ground)
                       Contexto que será exibido, Imagem a ser renderizada, Estrutura que contem tamanho e posição, Posição do chão
      Desc:       Define o heroi e os atributos
      Metodos:    update(Timer)           - Atualiza estado do heroi          
                  draw()                  - Renderiza heroi
      Status:     [//////////] 100%                    
      */
      function Hero(context, image, rect, ground) {
        //Definições dos atributos do objeto Herói
        this.rect = rect;
        //Lista de estados
        HeroState = {
          WALKING: 1,
          JUMPING: 2,
          FALLING: 3
        };
        //Lista de animações 
        var sprite = new AnimatedSprite(image, [{
          name: "walk",
          x: 0,
          y: 0,
          w: 180,
          h: 248,
          time: 0.3,
          numFrames: 10
        }, {
          name: "jump",
          x: 0,
          y: 248,
          w: 180,
          h: 247,
          time: 0.1,
          numFrames: 4
        }, {
          name: "land",
          x: 720,
          y: 248,
          w: 180,
          h: 247,
          time: 0.1,
          numFrames: 4
        }]);
        boundsSize = this.rect.w * 0.3
          //Atributos referentes ao pulo
        var FALLSPEED = 600; //Velocidade de descida
        var JUMPSPEED = 700; //Velocidade de subida
        var MAXJUMPTIME = .5; //Tempo que o botão pode ficar pressionado
        var MAXJUMPHEIGHT = rect.h * 1.1; //Altura máxima que pode subir
        var canJump = true; //Se botão de pulo é pressionavel
        var jumpTime = 0; //Tempo que está pulando
        var state = HeroState.FALLING; //Estado inicial do heroi
        sprite.play("jump"); //Animação inicial
        /* MÉTODO: UPDATE(T) */
        //Metodo update para verificar as condições e atualizar o estado do heroi a cada quadro
        Hero.prototype.update = function(t) {
          sprite.update(t);
          deltaSeconds = t * 0.001;
          //Caso o estado for JUMPING (pulando)
          if (state == HeroState.JUMPING) {
            jumpTime += deltaSeconds; //Calcula o tempo de pulo atual
            if (jumpTime < MAXJUMPTIME) { //Se for menor que o tempo máximo
              rect.y = Math.max(ground - MAXJUMPHEIGHT, rect.y - (JUMPSPEED * deltaSeconds)); //Inicia pulo, diminuindo o valor de Y * quadros por segundo 
              return;
            }
            jumpTime = 0; //Reseta tempo de pulo
            state = HeroState.FALLING; //Muda estado do heroi para FALLING (queda)
            return;
          }
          //Caso o estado for FALLING (queda)
          if (state == HeroState.FALLING) {
            if (rect.y < ground) { //Se a base do sprite estiver acima do chão
              rect.y = Math.min(ground, rect.y + (FALLSPEED * deltaSeconds)); //Executa queda até a base do sprite tocar no chão 
              return;
            }
            state = HeroState.WALKING; //Muda o estado do heroi para WALKING (caminhando)
            sprite.play("land", { //Muda a animação para pouso
              loop: false, //Informa que a animação não terá loop
              onFinish: function() {
                sprite.play("walk"); //Ao finalizar a animação de "land" muda animação para "walk"
              }
            });
          }
        };
        /* MÉTODO: DRAW() */
        //Renderiza sprite no canvas, getFrame atual da classe animatedSprite e renderiza no canvas, com as informações passadas na classe game();
        Hero.prototype.draw = function() {
          frame = sprite.getFrame();
          context.drawImage(frame.image, frame.x, frame.y, frame.w, frame.h, rect.x - rect.w / 2, rect.y - rect.h, rect.w, rect.h); //context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
        };
        Hero.prototype.collide = function(p_rect) {
            if (this.rect.x < p_rect.x + p_rect.w &&
              this.rect.x + boundsSize > p_rect.x &&
              this.rect.y < p_rect.y + p_rect.h &&
              this.rect.y + boundsSize > p_rect.y) {
              return true;
            }
            return false;
          }
          //Função acionada ao pressionar o botão de pulo
        function jumpStart(event) {
          if (canJump && state == HeroState.WALKING) { //Se o heroi puder pular e o estado for WALKING (caminhar)
            canJump = false; //Desativa o pulo para evitar que pule no ar
            state = HeroState.JUMPING;
            jumpTime = 0; //Inicia um novo tempo de pulo
            sprite.play("jump", {
              loop: true, //Caso possua animação propria para pulo setar false
              onFinish: function() {
                //state = HeroState.JUMPING;                            //Caso animação comece só apos final do pulo
              }
            });
          }
        }
        //Função acionada ao soltar o botão de pulo
        function jumpEnd(event) {
          canJump = true; //Ativa pulo novamente
          state = HeroState.FALLING;
        }
        //Adiciona listener para quando teclas foram pressionadas ou a tela tocada
        document.addEventListener("keydown", jumpStart, false);
        document.addEventListener("touchstart", jumpStart, false);
        document.addEventListener("keyup", jumpEnd, false);
        document.addEventListener("touchend", jumpEnd, false);
      };
      //Retorna um numero aleatorio entre min e max, inclusive eles.
      function getRandomInt(min, max) {
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
      }
      function game() {
        //Seleciona o canvas a ser usado e define o contexto
        canvas = document.getElementById("gameCanvas");
        context = canvas.getContext('2d');
        context.font = "40px Georgia";
        //Cria uma nova imagem e define o caminho do arquivo
        characterSpriteSheet = new Image();
        characterSpriteSheet.src = "https://s31.postimg.cc/ggfwhspft/hero_sprite.png";
        //Ao carregar imagem, instancia um novo 'Heroi'
        characterSpriteSheet.onload = function() {
          var hero = new Hero(context, characterSpriteSheet, {
            x: 200,
            y: 200,
            w: 180,
            h: 248
          }, canvas.height);
          var obstaclePool = [{
              x: -1,
              y: canvas.height - 5,
              w: 50,
              h: 0,
              active: false
            }, //Propriedades do obstaculo - x: todos começam fora da tela, y: todos começam no chão, w: todos tem largura de 30, h: altura, active: todos começam com false
            {
              x: -1,
              y: canvas.height - 5,
              w: 80,
              h: 0,
              active: false
            }, {
              x: -1,
              y: canvas.height - 5,
              w: 30,
              h: 0,
              active: false
            }, {
              x: -1,
              y: canvas.height - 5,
              w: 90,
              h: 0,
              active: false
            }, {
              x: -1,
              y: canvas.height - 5,
              w: 40,
              h: 0,
              active: false
            }
          ];
          var inactiveObstacleCount = obstaclePool.length; //Conta obstaculos inativos
          var frame = 0;
          var timer = new Timer();
          var minObstacleH = 40;
          var maxObstacleH = 180;
          var gameSpeed = 700;
          var score = 0;
          var gameOver = false;
          var intervalID = setInterval(function() {
            timer.tick();
            context.clearRect(0, 0, canvas.width, canvas.height);
            //Renderiza Score
            context.fillStyle = 'blue';
            context.fillText(score, 10, 100);
            //Renderiza o chão
            context.beginPath();
            context.strokeStyle = 'black';
            context.moveTo(0, canvas.height - 1);
            context.lineTo(canvas.width, canvas.height - 1);
            context.stroke();
            context.strokeStyle = 'black';
            context.moveTo(0, canvas.height - 80);
            context.lineTo(canvas.width, canvas.height - 80);
            context.stroke();
            //Randomiza obstaculos
            if (inactiveObstacleCount == obstaclePool.length) {
              lastX = canvas.width;
              for (i = 0; i < obstaclePool.length; i++) {
                console.log("obstaculos");
                obstacle = obstaclePool[i];
                obstacle.x = lastX + getRandomInt(hero.rect.w * 2, canvas.width * 0.8);
                obstacle.h = getRandomInt(minObstacleH, maxObstacleH);
                obstacle.active = true;
                lastX = obstacle.x;
                inactiveObstacleCount--;
              }
              gameSpeed += 3;
              hero.rect.x = Math.min(canvas.width * 0.7, hero.rect.x + 10);
            }
            hero.update(timer.deltaTime); //Atualiza Heroi
            for (i = 0; i < obstaclePool.length; i++) {
              obstacle = obstaclePool[i];
              if (!obstacle.active)
                continue;
              obstacle.x -= gameSpeed * timer.deltaTime * 0.001;
              if (obstacle.x - obstacle.w / 2 < 0) {
                obstacle.active = false;
                inactiveObstacleCount++;
                score++;
              }
              context.fillStyle = 'red';
              context.fillRect(obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h, obstacle.w, obstacle.h);
              if (hero.collide(obstacle)) {
                gameOver = true;
                break;
              }
            }
            hero.draw();
            if (gameOver) {
              clearInterval(intervalID);

              context.fillText("Game Over - PRESS F5", canvas.width / 2, canvas.height / 2, 300);
            }
          }, 1000 / 30);
        };
      }
      //Carrega função Game ao carregar janela
      window.onload = game;