'use strict'

const HABBIT_KEY = 'HABBIT_KEY';
const habbits = load();
const imgsArr = [
    'Dumbbell',
    'water',
    'food'
//     TODO добавить по больше значков
];

const renderAllHabbitsSidebarBtn = (habbitsArr) => habbitsArr.map(elem => renderHabbitSidebarBtnInDiv(elem));
const renderAllHabbitsDeleteBtn = (habbitsArr) => habbitsArr.map(elem => renderHabbitDeleteBtn(elem));

let activeSidebarItemID = habbits.length ? habbits[habbits.length - 1].id : '1';
const page = {
        sidebar: querySelector('.sidebar'),
        sidebarHabbitButtons: [],
        sidebarDivs: 0,
        sidebarAddButton: 0,
        header: {
            h1: querySelector('h1'),
            progressPercent: querySelector('.progress__percent'),
            progressCoverBar: querySelector('.progress__cover-bar'),
        },
        main: querySelector('main'),
        popup: querySelector('.cover')
    };

renderApp();

function renderApp() {
    if (habbits.length){
        renderAllHabbitsSidebarBtn(habbits);
        page.sidebarHabbitButtons = querySelectorAll('.sidebar__item');
        page.sidebarDivs = querySelectorAll('.sidebar__div');
        renderAllHabbitsDeleteBtn(habbits);
        addEventListenerForEach(page.sidebarHabbitButtons, sidebarItemSetActiveAndRenderContent, 'click');
        addNewHabbitButton();
        renderPopupIcons(imgsArr);
        sidebarItemSetActiveAndRenderContent(page.sidebarHabbitButtons[0]);
        // habbitContentRender(habbits[idToIndex(activeSidebarItemID)]);
    } else {
        addNewHabbitButton();
        renderPopupIcons(imgsArr);
    }
}

function activeHabitContentRender() {
    console.log(idToIndex(activeSidebarItemID), habbits);
    habbitContentRender(habbits[idToIndex(activeSidebarItemID)])
}


function addEventListenerForEach(elemsArr, handler, strEventName){
    elemsArr.forEach(elem => elem.addEventListener(strEventName, e => handler(e.currentTarget)));
}

function sidebarItemSetActiveAndRenderContent(target) {
    console.log(target)
        const prevElem = page.sidebarHabbitButtons[activeSidebarItemID - 1];
        if (prevElem) removeIconActiveClass(prevElem);
        addClass('icon_active', target);
        activeSidebarItemID = target.id;
    console.log(activeSidebarItemID)
        activeHabitContentRender();
}

function habbitContentRender(habbit) {
    console.log(habbit)
    if (!habbit) return undefined;
    renderHabbitHeader(habbit);
    renderHabbitDays(habbit.days);
}

function renderHabbitHeader(habbit){
    if (!habbit) return;
    page.header.h1.innerText = habbit.name;
    const progress = habbit.days.length / habbit.target * 100;
    page.header.progressPercent.innerText = habbit.days.length / habbit.target > 1
        ? '100%'
        : (progress).toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function renderHabbitDays(days) {
    page.main.innerHTML = '';
    days.map((d,i) => {
        const tamplate = `                
                    <div class="habbit__day">Day ${i+1}</div>
                    <div class="habbit__comment">${d.comment}</div>
                    <button class="habbit__delete" onclick="onClickDeleteDayHandler(${i})">
                        <img src="src/assets/delete.svg">
                    </button>
`;
        const elem = createElement('div');
        addClass('habbit', elem);
        elem.innerHTML = tamplate;
        page.main.appendChild(elem);
    });
    page.main.appendChild(getHabbitWithForm(days));
}


function renderHabbitDeleteBtn(habbitsItem){
    const index = habbits.indexOf(habbitsItem);
    const button = createElement('button');
    addClass('habbit__delete', button)
    addClass('sidebar__delete', button)
    button.innerHTML = '<img src="src/assets/delete.svg">';
    button.addEventListener('click', onClickDeleteHabbitHandler);
    if (habbitsItem.parentNode) {
        habbitsItem.parentNode.appendChild(button);
    } else {
        page.sidebarDivs[index].appendChild(button);
    }
    return button;
}

function idToIndex(id) {
    const index = habbits.findIndex(obj => obj.id == id);
    console.log(id, index, habbits[index])
    return index;
}

function onClickDeleteHabbitHandler(event){

    // TODO
    const divToDelete = event.currentTarget.parentNode;
    const index = idToIndex(event.currentTarget.previousSibling.id);
    // console.log([...habbits], event.currentTarget.previousSibling.id)
    // console.log(habbits[index])
    habbits.splice(index, 1);
    divToDelete.remove();
    // if (!habbits.length){
    //     setEmptyMainContent();
    // }
    if (habbits.length) {
        console.log(page.sidebarHabbitButtons[0])
        sidebarItemSetActiveAndRenderContent(page.sidebarHabbitButtons[0])
    } else {
        setEmptyMainContent();
    }
    saveHabbitsToLocalStorage();
}

function setEmptyMainContent(){
    page.header.h1.innerText = '';
    page.header.progressPercent.innerText = '';
    page.header.progressCoverBar.style.width = '0%';
    page.main.innerHTML = `
            <h1>Добавить привычку</h1>
        `;
}

function getHabbitWithForm(days){
    const habbitWithForm = createElement('div');
    addClass('habbit', habbitWithForm);
    habbitWithForm.innerHTML = `
                    <div class="habbit__day">Day ${days.length + 1}</div>
                    <form class="habbit__form" onsubmit="onSubmitDaysCommentHandler(event)">
                        <input name="comment" class="form__input" type="text" placeholder="comment">
                        <img class="comment-icon" src="src/assets/comments-icon.svg">
                        <button type="submit" class="button">ok</button>
                    </form>
`;
    return habbitWithForm;
}

function onSubmitDaysCommentHandler(event){
    if (!addDayChangeHabbitsArr(event)) return;
    activeHabitContentRender();
    saveHabbitsToLocalStorage();
}

function onSubmitPopupHandler (event) {
    if (!addNewHabbieToArr(event)) return;
    togglePopup();
    const button = renderHabbitSidebarBtnInDiv(habbits[habbits.length - 1]);
    sidebarItemSetActiveAndRenderContent(button);
    page.sidebarHabbitButtons = querySelectorAll('.sidebar__item');
    button.addEventListener('click', (e) => sidebarItemSetActiveAndRenderContent(e.currentTarget));
    renderHabbitDeleteBtn(button);
    saveHabbitsToLocalStorage();
}

function addNewHabbieToArr(event){
    const target = event.target;
    const formData = getFormOnSubmit(target);
    const iconOptions = formData.get('iconOptions');
    const name = formData.get('name');
    const aim = formData.get('aim');
    const template = {
        id: habbits.length ? habbits[habbits.length - 1].id + 1 : 1,
        icon: `${iconOptions}`,
        name: `${name}`,
        target: Number(aim),
        days: []
    }
    if (name && template.target > 0){
        habbits.push(template);
        return true;
    }
    if (!name && !(template.target > 0)){
        visualError(target['name'], 1000);
        visualError(target['aim'], 1000);
    }
    if (!name){
        visualError(target['name'], 1000);
    } else {
        visualError(target['aim'], 1000);
    }
    return false;
}

function onClickDeleteDayHandler(index){
    const activeDays = habbits[activeSidebarItemID - 1].days;
    activeDays.splice(index, 1);
    activeHabitContentRender();
    saveHabbitsToLocalStorage();
}

function addDayChangeHabbitsArr(event){
    const target = event.target;
    const comment = getFormOnSubmit(target).get('comment');
    if (comment) {
        habbits[activeSidebarItemID - 1].days.push({comment});
        return true;
    } else {
        visualError(target['comment'], 1000);
        return false;
    }
}

function getFormOnSubmit(target) {
    event.preventDefault();
    if (target) return new FormData(target);
}

function visualError(elem, delayTime){
    addClass('error', elem);
    setTimeout(() => removeClass('error', elem), delayTime);
}

function togglePopup() {
    page.popup.classList.toggle('cover_hidden');
}

function renderHabbitSidebarBtnInDiv(habbitsItem){
    const div = document.createElement('div');
    div.setAttribute('id', 'sidebarDiv' + habbitsItem.id);
    addClass('sidebar__div', div);
    const button = getEmptySidebarBtnElem();
    button.setAttribute('id', habbitsItem.id);
    if (habbitsItem.id == (activeSidebarItemID === '1')){
        addClass('icon_active', button);
    }
    button.innerHTML = `<img src="src/assets/${habbitsItem.icon}.svg">`;
    div.appendChild(button);
    page.sidebar.insertBefore(div, page.sidebar.lastChild);
    return button;
}

function renderPopupIcons(arr) {
    const iconSelect = document.querySelector('.icon-select');
    arr.map((imgName, index) => {
        iconSelect.innerHTML += `<input ${index === 0 ? 'checked' : null} type="radio" id='option${index}' name="iconOptions" value=${imgName}>
        <label class="icon " for='option${index}'>
            <img src="./src/assets/${imgName}.svg" alt="sport"/>
        </label>`
    });
}

function addNewHabbitButton() {
    const button = createElement('button');
    addClass('sidebar__add', button);
    button.innerHTML = '<img src="src/assets/Add.svg">'
    page.sidebar.appendChild(button);
    button.addEventListener('click', () => togglePopup());
    page.sidebarAddButton = button;
}

function getEmptySidebarBtnElem(){
    const button = createElement('button');
    addClass('sidebar__item', button);
    return button;
}

function load() {
    const raw = localStorage.getItem(HABBIT_KEY);
    return JSON.parse(raw) || [];
}

function saveHabbitsToLocalStorage() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function addClass(className, elem) {
    elem.classList.add(className);
}

function removeClass(className, elem){
    elem.classList.remove(className);
}

function removeIconActiveClass(elem){
    removeClass('icon_active', elem);
}

function querySelector(str){
     return document.querySelector(str);
}

function createElement(str){
     return document.createElement(str);
}

function querySelectorAll(str){
     return document.querySelectorAll(str);
}

