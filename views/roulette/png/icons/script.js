const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let name = document.querySelector('p');

const url = "wss://socket5.donationalerts.ru:443";
const token = "S64YiBzZqaJzQ2yANt2A";
const priceMin = 100;
const priceMax = 299.99;
const IMAGE_WIDTH = 128;
const IMAGE_HEIGHT = 128;
const IMAGE_COUNT = 7;
const OFFSET = 1;
const BASE_SPEED = 3;
const ACCELERATION_DURATION_MIN = 1500;
const ACCELERATION_DURATION_MAX = 2500;
const ACCELERATION_STEP = 0.3;
const DECELERATION_MULTIPLIER = 0.991;
const RETURN_MULTIPLIER = 0.1;
const STATE = {
    ACCELERATION: 1,
    DECELERATION: 2,
    RETURN: 3
};
var mes = null;
const donations = [];
const image = [
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Strawberry.png',
        chance: 2000
    },
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Cherry.png',
        chance: 2000
    },
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Apple.png',
        chance: 2000
    },
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Lemon.png',
        chance: 2000
    },
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Kiwi.png',
        chance: 1
    },
    {
        url: 'https://cdn0.iconfinder.com/data/icons/fruits/128/Pear.png',
        chance: 1999
    }
];
socket = io(url, {
            reconnection: true,
            reconnectionDelayMax: 5000,
            reconnectionDelay: 1000,
          });
socket.emit('add-user', {token: token, type: "minor"});
const images = [];

var imageUrls = GetRandArray(image);

console.log(imageUrls);
function GetRandArray(arr){

const arr2 = [];

let sum = Sum(arr);
let y = 0;
for (let i = 0; i < 100; i++) {
        let rand = Math.floor(Math.random() * sum);
        let h = 0;
        for (let j = arr[0].chance; j <= rand; j += arr[h].chance) {
            h++;
        }
        arr2.push(arr[h].url);
        y = h;
    }

  function Sum(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++){

          sum += arr[i].chance;

        }
        return sum;
  }

  for(let i = 0; i < arr.length; i++)
  {
    let q = 0;
    for(let j = 0; j < arr2.length; j++)
    {
       if(arr[i] == arr2[j]){
         q++;
       }
    }
    console.log(arr[i] + ' ' + q);
  }
  return arr2;
}

let speed = 0;
let state = STATE.RETURN;
let startIndex = 0;
let startTime = 0;
let accelerationDuration = 0;
let offset = 0;

const loadImage = (url) => fetch(url)
    .then(response => response.blob())
    .then(createImageBitmap);

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const draw = () => {
    const imagesLength = images.length;
    const center = Math.floor(canvas.width / 2)

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = -OFFSET; index < IMAGE_COUNT + OFFSET; index++) {
        const imageIndex = index < 0 ? index + imagesLength : index;
        const image = images[(imageIndex + startIndex) % imagesLength];
        context.drawImage(
            image,
            IMAGE_WIDTH * index - offset,
            0,
            IMAGE_WIDTH,
            IMAGE_HEIGHT
        );
    }

    context.moveTo(center + 0.5, 0);
    context.lineTo(center + 0.5, canvas.height);
    context.closePath();
};

const update = async () => {
    const imagesLength = images.length;
    const deltaTime = performance.now() - startTime;

    if (deltaTime > accelerationDuration && state === STATE.ACCELERATION) {
        state = STATE.DECELERATION;
    }

   if (offset > IMAGE_WIDTH) {
        startIndex = (startIndex + 1) % imagesLength;
        offset %= IMAGE_WIDTH;
    }

    draw();

    const center = IMAGE_WIDTH * IMAGE_COUNT / 2;
    const index = Math.floor((center + offset) / IMAGE_WIDTH);

    offset += speed;
    if (state === STATE.ACCELERATION) {
        speed += ACCELERATION_STEP;
    } else if (state === STATE.DECELERATION) {
        speed *= DECELERATION_MULTIPLIER;
        if (speed < 1e-2) {
            speed = 0;
            state = STATE.RETURN;
        }
    } else if (state === STATE.RETURN) {
        const halfCount = Math.floor(IMAGE_COUNT / 2);
        const distance = IMAGE_WIDTH * (index - halfCount) - offset;
        const step = distance * RETURN_MULTIPLIER;

        offset += Math.max(0.1, Math.abs(step)) * Math.sign(step);

        if (Math.abs(offset) <= 0.1) {
            offset = 0;
        }
    }

    if (speed > 0 || offset !== 0) {
        requestAnimationFrame(update);
    } else {
        const winner = (index + startIndex) % imagesLength;
        context.fillStyle = 'rgba(255, 0, 255, 0.2)';
        context.fillRect(index * IMAGE_WIDTH - offset, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

        console.group('Winner');
        console.log('Index', winner);
        console.log('Image', imageUrls[winner]);
        console.groupEnd();
        console.log(donations.length);
        donations.splice(0,1);
        mes = null;
        if(donations.length != 0){
          images.splice(0);
          imageUrls = GetRandArray(image);
          console.log(imageUrls);
          await init();
          setTimeout(start ,1000);
        }
    }
};

const init = async () => {
    [canvas.width, canvas.height] = [IMAGE_WIDTH * IMAGE_COUNT, IMAGE_HEIGHT];

    console.group('Loading images');
    for (const imageUrl of imageUrls) {
        console.group(imageUrl);
        console.time('loading');
        images.push(await loadImage(imageUrl));
        console.timeEnd('loading');
        console.groupEnd();
    }
    console.log(images);
    console.groupEnd();
    draw();
};
socket.on('donation', function(msg) {
  console.log(msg);
  mesObj = JSON.parse(msg);
  if(mesObj.amount_main >= priceMin && (mesObj.amount_main <= priceMax || priceMax === 0)){
  donations.push(mesObj);
  if(mes == null){
    console.log(donations[0]);
    mes = donations[0];
    start();
    }
  }
});
function start()
{
  mes = donations[0];
  console.log(name.textContent);
  name.textContent = mes.username;
  if (speed === 0 && offset === 0) {
      startTime = performance.now();
      accelerationDuration = random(ACCELERATION_DURATION_MIN, ACCELERATION_DURATION_MAX);
      state = STATE.ACCELERATION;
      speed = BASE_SPEED;
      requestAnimationFrame(update);
  }
}
window.addEventListener('DOMContentLoaded', init);
