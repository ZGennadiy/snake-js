const canvas = document.getElementById('game');

// Классическая змейка — двухмерная, сделаем такую же
const context = canvas.getContext('2d');

// Размер одной клеточки на поле — 16 пикселей
let grid = 16;

// Служебная переменная, которая отвечает за скорость змейки
let count = 0;

// А вот и сама змейка
const snake = {
  // Начальные координаты
  x: 160,
  y: 160,

  /* Скорость змейки — в каждом новом кадре змейка смещается по оси Х или У. 
  На старте будет двигаться горизонтально, поэтому скорость по игреку равна нулю. */
  dx: grid,
  dy: 0,
  cells: [], // Тащим за собой хвост, который пока пустой
  maxCells: 4, // Стартовая длина змейки — 4 клеточки

};

// А это — еда. Представим, что это яблоки.
const apple = {
  // Начальные координаты яблока
  x: 320,
  y: 320,
};

const score = document.querySelector('.currentScore > span');
const hiScore = document.querySelector('.highScore > span');
let highScore = localStorage.getItem('highScore') || 0;
hiScore.innerHTML = String(highScore).padStart(3, '0');

// Генератор случайных чисел в заданном диапазоне
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

let gameScore = 0;
score.innerHTML = String(gameScore).padStart(3, '0');
// Игровой цикл — основной процесс, внутри которого будет всё происходить
const loop = () => {
  // Хитрая функция, которая замедляет скорость игры с 60 кадров в секунду до 15 (60/15 = 4)
  requestAnimationFrame(loop);
  /* Игровой код выполнится только один раз из четырёх, в этом и суть замедления кадров, 
  а пока переменная count меньше четырёх, код выполняться не будет */
  if (++count < 4) {
    return;
  }
  // Обнуляем переменную скорости
  count = 0;
  // Очищаем игровое поле
  context.clearRect(0, 0, canvas.width, canvas.height);


  // Двигаем змейку с нужной скоростью
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Если змейка достигла края поля по горизонтали — продолжаем её движение с противоположной строны
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }

  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }

  // Делаем то же самое для движения по вертикали
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }


  /* Продолжаем двигаться в выбранном направлении. Голова всегда впереди,
  поэтому добавляем её координаты в начало массива, который отвечает за всю змейку */
  snake.cells.unshift({x: snake.x, y: snake.y});

  /* Сразу после этого удаляем последний элемент из массива змейки, 
  потому что она движется и постоянно освобождает клетки после себя */
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // Рисуем еду — яблоко
  context.fillStyle = 'yellow';
  context.fillRect(apple.x, apple.y, grid-1, grid-1);

  // Одно движение змейки — один новый нарисованный квадратик 
  context.fillStyle = 'white';

  // Обрабатываем каждый элемент змейки
  snake.cells.forEach((cell, index) => {
    /* Чтобы создать эффект клеточек, делаем зелёные квадратики меньше на один пиксель,
    чтобы вокруг них образовалась чёрная граница */
    context.fillRect(cell.x, cell.y, grid-1, grid-1);  
    // Если змейка добралась до яблока...
    if (cell.x === apple.x && cell.y === apple.y) {
      // увеличиваем длину змейки
      snake.maxCells += 1;
      gameScore += 1;
      score.innerHTML = String(gameScore).padStart(3, '0');
      if (gameScore > highScore) {
        highScore = gameScore;
        localStorage.setItem('highScore', highScore);
        hiScore.innerHTML = String(highScore).padStart(3, '0');

      }

      // Рисуем новое яблочко
      // Помним, что размер холста у нас 400x400, при этом он разбит на ячейки — 25 в каждую сторону
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }


    /* Проверяем, не столкнулась ли змея сама с собой
    Для этого перебираем весь массив и смотрим, есть ли у нас в массиве змейки две клетки
    с одинаковыми координатами  */
    for (let i = index + 1; i < snake.cells.length; i += 1) {
      // Если такие клетки есть — начинаем игру заново
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        // Задаём стартовые параметры основным переменным
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;
        // Ставим яблочко в случайное место
        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;

        gameScore = 0;
        score.innerHTML = String(gameScore).padStart(3, '0');
      }
    }
  });
};


// Смотрим, какие нажимаются клавиши, и реагируем на них нужным образом
document.addEventListener('keydown', (e) => {
  /* Дополнительно проверяем такой момент: если змейка движется, например,
  влево, то ещё одно нажатие влево или вправо ничего не поменяет — змейка продолжит
  двигаться в ту же сторону, что и раньше. 
  Это сделано для того, чтобы не разворачивать весь массив
  со змейкой на лету и не усложнять код игры */

  // Стрелка влево
  // Если нажата стрелка влево, и при этом змейка никуда не движется по горизонтали…
  if (e.which === 37 && snake.dx === 0) {
    // то даём ей движение по горизонтали, влево, а вертикальное — останавливаем
    // Та же самая логика будет и в остальных кнопках
    snake.dx = -grid;
    snake.dy = 0;
  }

  // Стрелка вверх
  else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }

  // Стрелка вправо
  else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }

  // Стрелка вниз
  else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

const controls = document.querySelector('.controls');
const buttonUp = controls.querySelector('.up');
const buttonLeft = controls.querySelector('.left');
const buttonRight = controls.querySelector('.right');
const buttonDown = controls.querySelector('.down');

controls.addEventListener('click', (e) => {
    if (e.target === buttonLeft && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
    else if (e.target === buttonUp && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    }
    else if (e.target === buttonRight && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    }
    else if (e.target === buttonDown && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    }
});

// Запускаем игру
requestAnimationFrame(loop);

