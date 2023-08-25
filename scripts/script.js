// кнопка ваш город через промпт получаем город и через локалстораж его сохраняем

const headerCityButton = document.querySelector('.header__city-button') // Ваш город?
const cartListGoods = document.querySelector('.cart__list-goods')

// определим хэш страницы (мужское, женское, детям)
let hash = location.hash.substring(1) // location - это объект с данными типа порта, http, hostname и тд, туда же входит и hash, по которому будем переключать страницы, substring используем чтобы обрезать первую #

// работаем с корзиной

function getLocalStorage() {
    JSON?.parse(localStorage.getItem('cart-lomoda')) || [] // cart-lomoda имя ключа по которому получаем данные
}

function setLoalStorage(data) {
    localStorage.setItem('cart-lomoda', JSON.stringify(data)) // получили data, перевели в строку через json, задали ключ cart-lomoda по которому можем получить его
} 

const renderCart = () => { // при открытии корзины рендерим ее содержимое
    cartListGoods.textContent = '' // удалили все лишнее

    let totalPrice = 0 
    
    const cartItems = getLocalStorage() // при открытии корзины получаем данные

    cartItems.forEach((item, i) => {
        const tr = document.createElement('tr')

        tr.innerHTML =  `
            <tr>
                <td>${i + 1}</td>
                <td>${item.brand} ${item.name}</td>
                ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
                ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
                <td>${item.cost} &#8381;</td>
                <td><button class="btn-delete" data-id='${item.id}'>&times;</button></td>
            </tr>
        `

        totalPrice += item.cost
        cartListGoods.append(tr)
    })
}
 

// if (localStorage.getItem('lomoda-location')) { // если пользователь ввел город
//     headerCityButton.textContent = localStorage.getItem('lomoda-location') // выведем данные из локалстораж
// }

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?' // код сверху но через тернарный оператор

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город')
    headerCityButton.textContent = city
    localStorage.setItem('lomoda-location', city) // lomoda-location ключ-название по которому получаем значение переменной, в локалстораж идет city
})


// блокировка скролла при модальном окне

const disableScroll = () => {
    const widthScroll = window.innerWidth - document.body.offsetWidth // получили ширину скролла, потом паддингом сдвинули его вправо, чтобы не прыгала страница
    document.body.dbScrollY = window.scrollY // сколько отмотали сверху пикселей
    // ниже пропишем стили чтобы при закрытии скрола не было скачков вверх и влево
    document.body.style.cssText = ` 
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        height: 100vh;
        overFlow: hidden; 
        padding-right: ${widthScroll}px;
    `
}

const enableScroll = () => { // вернули скролл
    document.body.style.cssText = '' 
    window.scroll({ // здесь мы возвращаем положение страницы чтобы не было скачка вверх при закрытии модалки
        top: document.body.dbScrollY
    })
}

// запрос db

const getData = async () => { // обязательно делать запрос через async await иначе придет просто голый промис
    const data = await fetch('db.json') // 1ым параметром принимает сам сервер файл с данными, await не выполнит присваивание пока fetch не вернет ответ

    if (data.ok) {
        return data.json() // метод json() преобразует данные с сервера в нужный нам формат
        // в promiseResult мы получили наш массив данных из db.json
    } else {
        throw new Error(`Данные не были получены, ошибка ${data.status} ${data.status.text}`) // если данные не были получены то в консоли будет эта ошибка
    }

}

const getGoods = (callback, prop, value) => { // функция получения товаров. callback - генерит карточки товаров, value - наш хэш
    getData()
        .then(data => { // then() вызовет колбэк функцию (data), когда getData отработает
            if (value) { // если есть hash
                callback(data.filter(item => item[prop] === value)) // отфильтруй категории и выведи на экран соответствующий hash, сам hash задан в db.json
            } else {
                callback(data) // здесь будет вызвана функция, когда мы получим товары с сервера
            }
        })
        .catch(err => { // catch() отлавливает ошибки и выкидывает код из 72ой строки
            console.log(err)
        }) 
}


// модальное окно

const subheaderCart = document.querySelector('.subheader__cart') // кнопка корзины
const cartOverlay = document.querySelector('.cart-overlay') // модальное окно корзины в закрытом виде
const btnClose = document.querySelector('.cart__btn-close') // кнопка закрытия окна в корзине

subheaderCart.addEventListener('click', () => { // обработчик события на открытие корзины
    cartOverlay.classList.add('cart-overlay-open') // модальное меню корзины в открытом виде
    disableScroll() // функция убирания скролла
    renderCart()
})

cartOverlay.addEventListener('click', (e) => { // обработчик события на закрытие корзины
    const target = e.target
    if (target === btnClose || target === cartOverlay) { // если таргет = кнопка закрытия || таргет = фон вокруг
        cartOverlay.classList.remove('cart-overlay-open') // удали класс open, тем самым закрой модальное окно
    }
    enableScroll() // функция добавления скролла
})


// работаем со страницей goods.html, рендерим шмотки

try { // если код внутри try выдает ошибка то срабатывает блок кода catch
    console.log(hash)
    const goodsList = document.querySelector('.goods__list') // получили класс который есть только на странице goods.html


    if (!goodsList) { // если не находит goodsList (т.е. открыта любая страница где нет этого класса)
        throw 'This is not a goods page!' // то выводит эту ошибку в консоль
    }

    const createCard = data => { // создали шаблон карточки товара
        const li = document.createElement('li')

        const {id, preview, cost, brand, name, sizes, category} = data // через деструктуризацию получили переменные

        const goodsTitle = document.querySelector('.goods__title') // получим тайтл для отдельной категории

        if (category === 'kids') { // заменим тайтл под каждую страницу
            goodsTitle.innerHTML = `<h2 class="goods__title">Детям</h2>`
        } else if (category === 'men') {
            goodsTitle.innerHTML = `<h2 class="goods__title">Мужчинам</h2>`
        } else if (category === 'women') {
            goodsTitle.innerHTML = `<h2 class="goods__title">Женщинам</h2>`
        }
        

        li.classList.add('goods__item')
        li.innerHTML = `
            <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ? `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` : ''}
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
            </article>
        `
        return li
    }

    const renderGoodsList = data => {
        goodsList.textContent = '' // очистили страницу от статических данных в виде товаров

        data.forEach(item => { // перебрали псевдомассив получили каждый элемент 
            const card = createCard(item) // в функцию выше в шаблон внесли каждый элемент по каждой отдельной карточке и в итоге получили уникальную карточку товара
            goodsList.append(card) // карточку добавили ребенком в переменную goodsList
        });
    }

    window.addEventListener('hashchange', () => { // слушатель события меня hash браузера при его изменении
        hash = location.hash.substring(1) // тут меняем сам хэш
        getGoods(renderGoodsList, 'category', hash) // getGoods у нас находится в запрос db, renderGoodsList является его колбэк функцией
    })

    getGoods(renderGoodsList, 'category', hash) // getGoods у нас находится в запрос db, renderGoodsList является его колбэк функцией

} catch (err) { // здесь он ошибку принимает
    console.warn(err)
}


// страница товара

try {

    if (!document.querySelector('.card-good')) {
        throw 'This is not a cart-good page'
    }

    const cardGoodImage = document.querySelector('.card-good__image')
    const cardGoodBrand = document.querySelector('.card-good__brand')
    const cardGoodTitle = document.querySelector('.card-good__title')
    const cardGoodPrice = document.querySelector('.card-good__price')
    const cardGoodColor = document.querySelector('.card-good__color')
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper')
    const cardGoodColorList = document.querySelector('.card-good__color-list')
    const cardGoodSizes = document.querySelector('.card-good__sizes')
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list')
    const cardGoodBuy = document.querySelector('.card-good__buy')

    // ниже метод для генерации li элементов с цветом в карточке товара
    const generateList = data => data.reduce((html, item, i) => // reduce принимает callback функцию и каждую следующую итерацию в первый аргумент передает предыдущий результат этой колбэк функции, 2ым параметром принимает значение которое может быть 1ым значением данной колбэк функции
       html + `<li class='card-goods__select_item' data-id='${i}'>${item}</li>` // в первую итерацию попадет пустая строка (снизу что указана 2ым аргументом) в html а затем к ней прибавится мой 1ый li элемент, потом начнется 2ая итерация и в нее попадет `<li>${item}</li>` элемент  и тд
    , '') 

    const renderCardGood = ([{brand, name, cost, color, sizes, photo}]) => { // в фигурных скобках через деструктуризацию получаем переменные, оборачиваем в [] тк объект лежит в массиве

        const data = {brand, name, cost, id}

        cardGoodImage.src = 'goods-image/' + photo
        cardGoodImage.alt = brand + ' ' + name
        cardGoodBrand.textContent = brand
        cardGoodTitle.textContent = name
        cardGoodPrice.textContent = cost + 'Р'
        if (color) {
            cardGoodColor.textContent = color[0]
            cardGoodColor.dataset.id = 0
            cardGoodColorList.innerHTML = generateList(color)
        } else {
            cardGoodColor.style.display = 'none'
        }

        if (sizes) {
            cardGoodSizes.textContent = sizes[0]
            cardGoodSizes.dataset.id = 0
            cardGoodSizesList.innerHTML = generateList(sizes) 
        } else {
            cardGoodColor.style.display = 'none'
        }
    }

    cardGoodSelectWrapper.forEach(item => { // переключатель в карточке товара на размер и цвет
        item.addEventListener('click', (e) => {
            const target = e.target

            if (target.closest('.card-good__select')) {
                target.classList.toggle('card-good__select__open')
            }

            if (target.closest('.card-good__select-item')) {
                const cardGoodSelect = item.querySelector('.card-good__select')
                cardGoodSelect.textContent = target.textContent
                cardGoodSelect.dataset.id = target.dataset.id
                cardGoodSelect.classList.remove('card-good__select__open')
            }
        })
    })

    cardGoodBuy.addEventListener('click', () => {
        if (color) data.color = cardGoodColor.textContent
        if (sizes) data.size = cardGoodSizes.textContent

        const cardData = getLocalStorage() // получили локалстораж
        cardData.push(data) // добавили туда новый товар
        setLoalStorage(cardData) // отправили обратно в локалстораж
    })

    getGoods(renderCardGood, 'id', hash) // по id мы получаем каждый товар

} catch (err) {
    console.warn(err) // если открыта страница без класса card-good то выведет 'This is not a cart-good page'
}


