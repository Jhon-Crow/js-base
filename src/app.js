'use strict'

const HABBIT_KEY = 'HABBIT_KEY';
const habbits = load();
let activeSidebarItemID = '1';
const page = {
        sidebar: querySelector('.sidebar'),
        sidebarItems: 'init',
        header: {
            h1: querySelector('h1'),
            progressPercent: querySelector('.progress__percent'),
            progressCoverBar: querySelector('.progress__cover-bar'),
        },
        main: querySelector('main'),
    };

    habbits.map(elem => renderHabbitSidebarBtn(elem));
    page.sidebarItems = querySelectorAll('.sidebar__item');
    addEventListenerForEach(page.sidebarItems, sidebarItemClickHandler, 'click');
    addHabbitButton();
    habbitContentRender(habbits[0]);

const isActiveSidebarItem = (target) => target.id == activeSidebarItemID;
const activeHabitRender = () => habbitContentRender(habbits[activeSidebarItemID - 1]);


function addEventListenerForEach(elemsArr, handler, strEventName){
    elemsArr.forEach(elem => elem.addEventListener(strEventName, e => handler(e.currentTarget)));
}

function sidebarItemClickHandler(target) {
    if (!isActiveSidebarItem(target)){
        const prevElem = page.sidebarItems[activeSidebarItemID - 1];
        removeActiveFromSidebarItem(prevElem);
        addClass('sidebar__item_active', target);
        activeSidebarItemID = target.id;
        activeHabitRender();
    }
}

function habbitContentRender(habbit) {
    renderHabbitHeader(habbit);
    renderHabbitDays(habbit.days);
}

function renderHabbitHeader(habbit){
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
                    <button class="habbit__delete" onclick="onClickDeleteDayHandler(event)">
                        <img src="src/assets/delete.svg">
                    </button>
`;
        const elem = createElement('div');
        addClass('habbit', elem);
        elem.innerHTML = tamplate;
        elem.setAttribute('id', i);
        page.main.appendChild(elem);
    });
    page.main.appendChild(getFormElem(days));
}

function getFormElem(days){
    const habbitWithForm = createElement('div');
    addClass('habbit', habbitWithForm);
    habbitWithForm.innerHTML = `
                    <div class="habbit__day">Day ${days.length + 1}</div>
                    <form class="habbit__form" onsubmit="onSubmitDaysCommentHandler(event)">
                        <input name="comment" class="form__input" type="text" placeholder="comment">
                        <img class="comment-icon" src="src/assets/comments-icon.svg">
                        <button class="habbit__ok-button">ok</button>
                    </form>
`;
    return habbitWithForm;
}

function onSubmitDaysCommentHandler(event){
    if (!addDay(event)) return;
    activeHabitRender();
    saveHabbitsToLocalStorage();
}

function onClickDeleteDayHandler(event){
    const dayID = event.currentTarget.parentNode.id;
    const activeDays = habbits[activeSidebarItemID - 1].days;
    activeDays.splice(dayID, 1);
    activeHabitRender();
    saveHabbitsToLocalStorage();
}

function addDay(event){
    const form = event.target;
    event.preventDefault();
    const comment = new FormData(event.target).get('comment');
    if (comment) {
        habbits[activeSidebarItemID - 1].days.push({comment});
        return true;
    } else {
        visualError(form['comment'], 1000);
        return false;
    }
}

function visualError(elem, delayTime){
    addClass('error', elem);
    setTimeout(() => removeClass('error', elem), delayTime);
}

function renderHabbitSidebarBtn(elem){
    const button = getSidebarBtnElem();
    button.setAttribute('id', elem.id);
    if (elem.id == 1){
        addClass('sidebar__item_active', button);
    }
    button.innerHTML = `<img src="src/assets/${elem.icon}.svg">`;
    page.sidebar.appendChild(button);
}

function addHabbitButton() {
    const button = getSidebarBtnElem();
    addClass('sidebar__add', button);
    button.innerHTML = '<img src="src/assets/Add.svg">'
    page.sidebar.appendChild(button);
    button.addEventListener('click', () => console.log('add'));
}

function getSidebarBtnElem(){
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

function removeActiveFromSidebarItem(elem){
    removeClass('sidebar__item_active', elem);
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

