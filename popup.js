let dataQuery = document.querySelector('.data');
let btn = document.querySelector('.btn-ext');
let tablesList = [];
let index;
let tablesData;
async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text)
}
function downloadJson(index){
    let filename ='table.json'
    const jsonBlob = new Blob([JSON.stringify(tablesList[index].json,null,2)], {
        type: 'application/json'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}
function downloadTableAsWordd(table) {
    const filename = 'table.docx'
    const tableHTML = table.outerHTML;
    const blob = new Blob(['\ufeff', tableHTML], {
        type: 'application/msword'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'table.doc';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}
function downloadTableAsExcel(table) {
    const filename = 'table.xlsx';
    const tableHTML = table.outerHTML;
    const blob = new Blob([tableHTML], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'table.xlsx';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}

function upDownInit(){
    let downUpEl = document.createElement('a')
    downUpEl.id='upDown'
    downUpEl.href="#downEl"
    downUpEl.style.bottom='30px'
    downUpEl.textContent = '⬆️'
    document.querySelector('body').appendChild(downUpEl)

    window.addEventListener('scroll',()=>{
        let upDownEl = document.querySelector('#upDown')
        if (window.scrollY*0.95<window.innerHeight/2){
    
            upDowner('down')
        }
        
        else{
            upDowner('up')
    
            }
    })}
function tableGrabber() {
    let tables = document.querySelectorAll('table');
    let tablesData = [];
    tables.forEach(table => {
        let tbody = [];
        let rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            let cols = row.querySelectorAll('td');
            let rowData = Array.from(cols).map(col => col.textContent);
            tbody.push(rowData);
        });
        let thead = table.querySelector('thead');
        let tableData = {
            'tbody': tbody,
            'thead': thead ? Array.from(thead.querySelectorAll('th')).map(th => th.textContent) : [],
                };
        tablesData.push(tableData);
    });
    return tablesData;
}

function createTable(table, index, amountTables) {
    let html = `<div class="table-wrapper">
    <div class="page-change-wrapper">${index > 0 ? createPagBtn(0, index - 1) : ""}</div>
    <div class="table-wrapper-data">
    <div id="upEl"></div>

    <table>
    <thead>${table.thead ? createThead(table.thead) : ""}</thead>
    <tbody>${createTbody(table.tbody)}</tbody>
    </table>
    </div>
    <div class="page-change-wrapper">${index < amountTables - 1 ? createPagBtn(1, index + 1) : ""}</div>
    </div>
    ${setUpPagesList()}
    <div id="downEl"></div>
    <div class="save-wrapper" data="${index}">
    <div class="word sf"><button class="copy-word cp copy">Copy Word</button><button class="save_as-word cp save">Save as Word</button></div>
<div class="excel sf"><button class="copy-excel cp copy">Copy excel</button><button class="save_as-excel cp save">Save as excel</button></div>
<div class="json  sf"><button class="copy-json cp copy">Copy json</button><button class="save_as-json cp save">Save as json</button></div>
    </div>`;
    let tableTag = document.createElement('div')
    tableTag.innerHTML = html
    return {
        'html': html,
        'json': table,
        'table': tableTag.querySelector('table')
    };
}
async function saveManager(index, format, action) {
    switch (format) {
        case 'word':
            if (action === 'save_as') {
                downloadTableAsWordd(tablesList[index].table);
            }
            break;

        case 'excel':
            if (action === 'save_as') {
                downloadTableAsExcel(tablesList[index].table);
            }
            break;

        case 'json':
            if (action === 'save_as') {
                downloadJson(index);
            }
            break;

            
    }
    if(format=='json'&&action=="copy"){
        let jsonData = (JSON.stringify(tablesList[index].json))
        await copyToClipboard(jsonData)
    }
}
function setupSave(){
    document.querySelectorAll('.cp').forEach(cpbtn=>{
        let page = document.querySelector('.save-wrapper')
        page = page.getAttribute('data')
        let format = cpbtn.getAttribute('class').split('-')[1].split(' ')[0]
        let action = cpbtn.getAttribute('class').split('-')[0]
        cpbtn.addEventListener('click',async ()=>{await saveManager(page,format,action)})
    })
}
function createThead(thead) {
    return "<tr>" + thead.map(th => `<th>${th}</th>`).join('') + "</tr>";
}

function createTbody(tbody) {
    return tbody.map(row => `<tr>${row.map(col => `<td>${col}</td>`).join('')}</tr>`).join('');
}

function setupPages() {
    document.querySelectorAll('.btnPage').forEach(btn => {
        let page = btn.getAttribute('data');
        btn.addEventListener('click', () => {
            addHtml(tablesList[page].html);
        });
    });
    document.querySelectorAll('.page-list-btn').forEach((btn)=>{
        btn.addEventListener('click',()=>{
            addHtml(tablesList[btn.getAttribute('data')].html)
            


            btn.classList.add('selected-btn')
        })
    })
}

function createPagBtn(action, page) {
    let label = action === 0 ? '⬅️' : '➡️';
    return `<button class="btnPage" data="${page}">${label}</button>`;
}

function addHtml(html) {
    dataQuery.innerHTML = html;
    setupSave();
    setupPages();
}

function setUpPagesList(){
    
    let pagesList = Array.from({length:tablesData.length},(_,index)=>`<button class="page-list-btn" data=${index}>${index+1}</button>`)
    return `<div class="pages-list-wrapper">${pagesList.join("-")}</div>`

}
function mainInit(){
    function secondInit(){
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let tab = tabs[0];
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: false },
                func: tableGrabber,
            }).then((result) => {
                if (result && result.length > 0) {
                    tablesData = result[0].result;
                    tablesList = tablesData.map((table, index) => createTable(table, index, tablesData.length));
                    if (tablesList.length==0){
                        dataQuery.innerHTML=`<div id="noTables">
                        <h1>No tables on the pages</h1>
                        </div>
                        <button id="reload">Reload</button>`
                        document.querySelector('#reload').addEventListener('click',()=>secondInit())
                    }
                    if(tablesList.length>0){
                    addHtml(tablesList[0].html);
                    upDownInit()
                    }
                }
            });
        } else {
            alert('No tab');
        }
    });
}
document.addEventListener('DOMContentLoaded', ()=>secondInit());
}
mainInit()

function upDowner(action){
    let upDownEl = document.querySelector('#upDown')
    if(action=='up'){
        'goDown' in upDownEl.classList?"":upDownEl.classList.remove('goDown')
        'goUp' in upDownEl.classList?"":upDownEl.classList.add('goUp')

        upDownEl.textContent='⬆️'
        upDownEl.style.top=''
        upDownEl.style.bottom ="40px"
        upDownEl.href="#upEl"

        

    }

    if(action=='down'){
        'goDown' in upDownEl.classList?"":upDownEl.classList.add('goDown')
        'goUp' in upDownEl.classList?"":upDownEl.classList.remove('goUp')
        upDownEl.textContent='⬇️'
        upDownEl.style.top='40px'
        upDownEl.style.bottom =""
        upDownEl.href="#downEl"

    }


}
