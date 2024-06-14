const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const ruletka = document.getElementById('ruletka');
let countDrop = 0;
const NameRich = 'Бонус';
let name = document.querySelector('#username');
let countLow = document.querySelector('#count');
let countLowBox = document.querySelector('#countBox');
let countRich = document.querySelector('#countRich');
let countRichBox = document.querySelector('#countRichBox');
const xhr = new XMLHttpRequest();
const url = "wss://socket7.donationalerts.ru:443";
const token = "sK88nHiEpOiy509ZI1J9";
const priceMin = 100;
const priceMax = 300;
const IMAGE_WIDTH = 128;
const IMAGE_HEIGHT = 128;
const IMAGE_COUNT = 5;
const OFFSET = 1;
const BASE_SPEED = 7;
const ACCELERATION_DURATION_MIN = 1500;
const ACCELERATION_DURATION_MAX = 2500;
const ACCELERATION_STEP = 0.5;
const DECELERATION_MULTIPLIER = 0.989;
const RETURN_MULTIPLIER = 0.7;
const STATE = {
    ACCELERATION: 1,
    DECELERATION: 2,
    RETURN: 3
};
animationClose();
var mes = null;
var donations = [];
const balance = [];
function addMaxPrice(){
  donations.unshift({username: mes.username, mes: mes.message, price: priceMax, id: mes.id});
}
const image = [
	{
        url: '/roulette/png/icons/coderdonate.jpg',
        chance: 2189, // 15%
        name: 'Зарплата кодеру',
        color: '#66FFB9'
    },
	{
        url: '/roulette/png/icons/moderdonate.jpg',
        chance: 720, // 6%
        name: 'Зарплата модеру',
        color: '#66FFB9'
    },
	{
        url: '/roulette/png/icons/monitor90.jpg',
        chance: 1200, // 10%
        name: 'Повернуть монитор на 90°',
        color: '#FF61AC'
    },
	{
        url: '/roulette/png/icons/nosound.jpg',
        chance: 1800, // 15%
        name: '3 раунда без звука',
        color: '#FF61AC'
    },
	{
        url: '/roulette/png/icons/returnmoney.jpg',
        chance: 600, // 5%
        name: 'Вернуть донат отправителю',
        color: '#24A300'
    },
	{
        url: '/roulette/png/icons/richroulette.jpg',
        chance: 2999000000, // 3% 360
        name: 'Прокрут дорогой рулетки',
        color: '#FFF247',
		event: addMaxPrice
    },
	{
        url: '/roulette/png/icons/signsteam.jpg',
        chance: 1200, // 10%
        name: 'Роспись в Стиме',
        color: '#6618FF'
    },
	{
        url: '/roulette/png/icons/steamfriend.jpg',
        chance: 600, // 5%
        name: 'Добавить в Стиме',
        color: '#6618FF'
    },
	{
        url: '/roulette/png/icons/tshirtnickname.jpg',
        chance: 1200, // 10%
        name: 'Ник на футболке чёрным маркером',
        color: '#B700C2'
    },
	{
        url: '/roulette/png/icons/viewercfg.jpg',
        chance: 600, // 5%
        name: 'Поставить КФГ донатера',
        color: '#FF61AC'
    },
	{
        url: '/roulette/png/icons/vkfriend.jpg',
        chance: 360, // 3%
        name: 'Добавить в ВК',
        color: '#0FD3FF'
    },
	{
        url: '/roulette/png/icons/30fps.jpg',
        chance: 1171, // 13%
        name: '30FPS на 2 раунда',
        color: '#FF61AC'
    }
];
const image2 = [
     {
        url: '/roulette/png/icons/rich/aimka.jpg',
        chance: 2800, // 20%
        name: 'Аимка с наградой',
        color: '#FF3858'
    },
	{
        url: '/roulette/png/icons/rich/cashgiveaway.jpg',
        chance: 2100, // 15%
        name: 'Розыгрыш надоначенных монет',
        color: '#FFF247'
    },
	{
        url: '/roulette/png/icons/rich/coderdonate.jpg',
        chance: 2660, // 15%
        name: 'Зарплата кодеру',
        color: '#66FFB9'
    },
	{
        url: '/roulette/png/icons/rich/moderdonate.jpg',
        chance: 1400, // 10%
        name: 'Зарплата модеру',
        color: '#66FFB9'
    },
	{
        url: '/roulette/png/icons/rich/returnmoney.jpg',
        chance: 700, // 5%
        name: 'Вернуть донат отправителю',
        color: '#24A300'
    },
	{
        url: '/roulette/png/icons/rich/tshirtnickname.jpg',
        chance: 1400, // 10%
        name: 'Ник на футболке красным маркером',
        color: '#B700C2'
    },
	{
        url: '/roulette/png/icons/rich/vkstickers.jpg',
        chance: 2940, // 25%
        name: 'Подарить стикеры в ВК',
        color: '#0FD3FF'
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
  }
  return arr2;
}

let speed = 0;
let state = STATE.RETURN;
let startIndex = 0;
let startTime = 0;
let accelerationDuration = 0;
let offset = 0;

const loadImage = (url) =>{
  var img = new Image();
  img.src = url;
  return img;
};

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
function animationOpen(){
  $(function(){
    $('#ruletka').animate({
                width: IMAGE_WIDTH * IMAGE_COUNT
            });
    ruletka.width = IMAGE_WIDTH * IMAGE_COUNT;
  });
    setTimeout(() => document.getElementById('img').style.visibility = "visible", 150)
}
function animationClose(){
  closeDrop();
  setTimeout(()=>{
  $(function(){
      $('#ruletka').animate({
              width: 0
            });
            ruletka.width = 0;
    });
    document.querySelector("img").style.visibility = "hidden";
  }, 700);
}
function canvasAnimationOpen(){
  $(function(){
    $('.ruletka').animate({
                width: IMAGE_WIDTH * IMAGE_COUNT
            });
    document.querySelector('.ruletka').width = IMAGE_WIDTH * IMAGE_COUNT;
  });
  setTimeout(() => document.getElementById('img').style.visibility = "visible", 150);
}
function canvasAnimationClose(){
  $(function(){
    $('.ruletka').animate({
                width: 0
            });
      document.querySelector('.ruletka').width = 0;
  });
  document.querySelector("img").style.visibility = "hidden";
}
function textAnimationOpen(id, text, color){
  $(function(){
    const par = document.getElementById("drop" + id);
    par.textContent = text;
    document.getElementById("cvet" + id).style.background = color;
    $('#dropBox' + id).animate({
                width: 1000
            }, {
              duration: 700
            });
      document.querySelector('#dropBox'+ id).width = 1000;
  });
}
function textAnimationClose(id){
  $(function(){
    $('#dropBox' + id).animate({
                width: 0
            }, {
              duration: 700
            });
      document.querySelector('#dropBox'+ id).width = 0;
  });
}
function soundClick(){
var audio = new Audio(); // Создаём новый элемент Audio
audio.src = '/roulette/sound.mp3'; // Указываем путь к звуку "клика"
audio.autoplay = true; // Автоматически запускаем
}

function newDrop(text, color){
  if(countDrop == 3){
    closeDrop();
    setTimeout(() => newDrop(text, color), 1050);
  }
  else {
    if(countDrop == 0)
    textAnimationOpen('1', text, color);
  else if(countDrop == 1)
    textAnimationOpen('2', text, color);
  else if(countDrop == 2)
    textAnimationOpen('3', text, color);
  countDrop++;
  }
}
function closeDrop(){
  textAnimationClose('3');
  setTimeout(() => textAnimationClose('2'), 100);
  setTimeout(() => textAnimationClose('1'), 200);
  countDrop = 0;
}

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
      soundClick();
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
        console.group('Winner');
        console.log('Index', winner);
        console.log('Image', imageUrls[winner]);
        if(mes.price == priceMin){
          var r = image.find(el => el.url == imageUrls[winner]);
        }
        else {
          var r = image2.find(el => el.url == imageUrls[winner]);
        }
        newDrop(r.name, r.color);
        save({username: mes.username, mes: mes.mes, gift: r.name, price: mes.price});
        console.groupEnd();
        console.log(donations.length);
        donations.splice(0,1);
		    if(r.event != null){
          r.event();
        }
        if(donations.length > 0 && mes.id == donations[0].id)
          setTimeout(canvasAnimationClose, 2500);
        else
          setTimeout(animationClose, 1800);
		    setTimeout(async () => {
        if(donations.length != 0){
            lastName = mes;
		        mes = donations[0];
            images.splice(0);
		        imageUrls.splice(0);
		        console.log(images);
		        console.log(imageUrls);
		        console.log(mes.price == priceMin);
            if(mes.price == priceMin){
              imageUrls = GetRandArray(image);
            }
            else{
              imageUrls = GetRandArray(image2);
            }
            console.log(imageUrls);
            await init();
            setTimeout(start ,1000);
        }
        else {
            mes = null;
            lastName = null;
        }
		  },2900);
    }
};
const init = async () => {
    [canvas.width, canvas.height] = [IMAGE_WIDTH * IMAGE_COUNT, IMAGE_HEIGHT];
    for (const imageUrl of imageUrls) {
        images.push(await loadImage(imageUrl));
    }
    draw();
};

socket.on('donation', function(msg) {
  console.log(msg);
  mesObj = JSON.parse(msg);
  console.log(mesObj);
  if(mesObj.amount_main >= priceMin && mesObj.billing_system != 'TWITCH'){

    let amount = Number(mesObj.amount_main);
    console.log(amount);
    var username = 'Аноним';
    if(mesObj.username != null){
      username = mesObj.username;
    }
    let id = getRandomInt(1000000000);
    var count = Math.floor(amount/priceMax) + Math.floor(amount%priceMax/priceMin);
    while(amount%priceMax >= priceMin){
    donations.push({username: username, mes: mesObj.message, price: priceMin, id: id});
    amount -= priceMin;
    count--;
    }
	while(amount >= priceMax){
    donations.push({username: username, mes: mesObj.message, price: priceMax, id: id});
    amount -= priceMax;
    count--;
    }
    console.log(donations);
    if(mes == null){
      console.log(donations[0]);
      mes = donations[0];
      images.splice(0);
      if(mes.price == priceMin){
      imageUrls = GetRandArray(image);
      }
      else{
      imageUrls = GetRandArray(image2);
      }

      init();
      start();
    }
  }
});

var lastName = null;
function start(){

  if(lastName && lastName.id  == mes.id){
    canvasAnimationOpen();
  }
  else{
    name.textContent = mes.username;
    animationOpen();
  }
  UpdCounts();
  if (speed === 0 && offset === 0) {
      startTime = performance.now();
      accelerationDuration = random(ACCELERATION_DURATION_MIN, ACCELERATION_DURATION_MAX);
      state = STATE.ACCELERATION;
      speed = BASE_SPEED;
      requestAnimationFrame(update);
  }
}
function save(obj){
  xhr.open("POST", "/save");
  xhr.setRequestHeader("Content-Type", "application/json");
  if(obj.price >= 1000000){
    obj.price = 'Дроп с утешительной';
  }
  var data = JSON.stringify(obj);
  console.log(data);
  xhr.send(data);
}
function UpdCounts(){
  let counts = donations.filter(el => el.username == mes.username && mes.id == el.id).reduce((sums, el) => {
    el.price == priceMax ? sums.rich++ : sums.low++;
    return sums;
  }, {rich: 0, low: 0});
  if(counts.low == 0){
    countClose(countLowBox);
  } else { 
    countOpen(countLowBox, countLow, counts.low);
  }
  if(counts.rich == 0){
    countClose(countRichBox);
  } else {
    countOpen(countRichBox, countRich, counts.rich);
  }
}
function countClose(countBox){
  countBox.style.opacity = '0';
  countBox.style.position = 'absolute';
  countBox.style.zIndex = '-1';
}
function countOpen(countBox, countHTML, count){
  countBox.style.opacity = '1';
  countBox.style.position = 'relative';
  countBox.style.zIndex = '1';
  countHTML.textContent = count + "x";
}
window.addEventListener('DOMContentLoaded', init);
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}