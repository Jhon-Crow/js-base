'use strict'

const HABBIT_KEY = 'HABBIT_KEY';
const habbits = load();
const renderAllHabbitsSidebarBtn = (habbitsArr) => habbitsArr.map(elem => renderHabbitSidebarBtn(elem));

let activeSidebarItemID = '1';
const page = {
        sidebar: querySelector('.sidebar'),
        sidebarItems: 'init',
        sidebarAddButton: 'init',
        header: {
            h1: querySelector('h1'),
            progressPercent: querySelector('.progress__percent'),
            progressCoverBar: querySelector('.progress__cover-bar'),
        },
        main: querySelector('main'),
        popup: querySelector('.cover')
    };

renderApp(activeSidebarItemID);

function renderApp(activeSidebarItemID) {
    renderAllHabbitsSidebarBtn(habbits);
    page.sidebarItems = querySelectorAll('.sidebar__item');
    addEventListenerForEach(page.sidebarItems, sidebarItemSetActiveAndRenderContent, 'click');
    addNewHabbitButton();
    habbitContentRender(habbits[activeSidebarItemID - 1]);
}

const isActiveSidebarItem = (target) => target.id == activeSidebarItemID;
const activeHabitRender = () => habbitContentRender(habbits[activeSidebarItemID - 1]);


function addEventListenerForEach(elemsArr, handler, strEventName){
    elemsArr.forEach(elem => elem.addEventListener(strEventName, e => handler(e.currentTarget)));
}

function sidebarItemSetActiveAndRenderContent(target) {
    if (!isActiveSidebarItem(target)){
        const prevElem = page.sidebarItems[activeSidebarItemID - 1];
        removeIconActiveClass(prevElem);
        addClass('icon_active', target);
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
    activeHabitRender();
    saveHabbitsToLocalStorage();
}

function onSubmitPopupHandler (event) {
    if (!addNewHabbieToArr(event)) return;
    togglePopup();
    const button = renderHabbitSidebarBtn(habbits[habbits.length - 1]);
    sidebarItemSetActiveAndRenderContent(button);
    button.addEventListener('click', sidebarItemSetActiveAndRenderContent);
    saveHabbitsToLocalStorage();
}

function addNewHabbieToArr(event){
    const target = event.target;
    const formData = getFormOnSubmit(target);
    const iconOptions = formData.get('iconOptions');
    const name = formData.get('name');
    const aim = formData.get('aim');
    const template = {
        id: habbits.length + 1,
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
    activeHabitRender();
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

function renderHabbitSidebarBtn(habbitsItem){
    const button = getEmptySidebarBtnElem();
    button.setAttribute('id', habbitsItem.id);
    if (habbitsItem.id == 1){
        addClass('icon_active', button);
    }
    button.innerHTML = `<img src="src/assets/${habbitsItem.icon}.svg">`;
    page.sidebar.insertBefore(button, page.sidebar.lastChild);
    return button;
}

function addNewHabbitButton() {
    const button = getEmptySidebarBtnElem();
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

