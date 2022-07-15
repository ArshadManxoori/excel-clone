let ctrlKey;
document.addEventListener("keydown", (e) => {   //if keydown -> true
    ctrlKey = e.ctrlKey;
})
document.addEventListener("keyup", (e) => { //if keyup -> false
    ctrlKey = e.ctrlKey;
})

for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        handleSelectedCells(cell);
    }
}

let copyBtn = document.querySelector(".copy");
let cutBtn = document.querySelector(".cut");
let pasteBtn = document.querySelector(".paste");

let rangeStorage = [];
function handleSelectedCells(cell){
    cell.addEventListener("click", (e) => {
        //Select cells range work
        if(!ctrlKey) return;    //ctrl not pressed
        if(rangeStorage.length >= 2){    //already 2 or more element is presnt
            defaultSelectedSetUI();
            rangeStorage = [];
        }
        //UI
        cell.style.border = "3px solid #218c74";

        let rid = Number(cell.getAttribute("rid"));
        let cid = Number(cell.getAttribute("cid"));
        rangeStorage.push([rid, cid]);
        console.log(rangeStorage);

    })
}

function defaultSelectedSetUI(){
    for(let i = 0; i < rangeStorage.length; i++){
        let cell = document.querySelector(`.cell[rid="${rangeStorage[i][0]}"][cid="${rangeStorage[i][1]}"]`);
        cell.style.border = "1px solid lightgrey";
    }
}

let copyData = [];
let cut = false;

copyBtn.addEventListener("click", (e) => {
    if(rangeStorage.length < 2) return;
    copyData = [];

    // let strow = rangeStorage[0][0];
    // let stcol = rangeStorage[0][1];
    // let endrow = rangeStorage[1][0];
    // let endcol = rangeStorage[1][1];
    let [strow, stcol, endrow, endcol] =[ rangeStorage[0][0], rangeStorage[0][1], rangeStorage[1][0], rangeStorage[1][1] ];
    
    for(let i = strow; i <= endrow; i++){
        let copyRow = [];
        for(let j = stcol; j <= endcol; j++){
            let cellProp = sheetDB[i][j];
            copyRow.push(cellProp);
        }
        copyData.push(copyRow);
    }
    // console.log(copyData);
    defaultSelectedSetUI();
})

cutBtn.addEventListener("click", (e) => {
    if(rangeStorage.length < 2) return;
    copyData = [];

    let [strow, stcol, endrow, endcol] =[ rangeStorage[0][0], rangeStorage[0][1], rangeStorage[1][0], rangeStorage[1][1] ];
    for(let i = strow; i <= endrow; i++){
        let copyRow = [];
        for(let j = stcol; j <= endcol; j++){
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            
            //DB - make default
            let cellProp = sheetDB[i][j];

            copyRow.push({...cellProp}); 
            cellProp.value = "";
            cellProp.bold = false;
            cellProp.italic = false;
            cellProp.underline = false;
            cellProp.fontSize = 14;
            cellProp.fontFamily = "monospace";
            cellProp.fontColor = "#000000";
            cellProp.BGcolor = "#000000";
            cellProp.alignment = "left";
            
            //UI change
            cell.click();
        }
        copyData.push(copyRow);
    }
    // console.log(copyData);
    cut = true;
    defaultSelectedSetUI();
})

pasteBtn.addEventListener("click", (e) => {
    //Past cells data work
    if(rangeStorage.length < 2) return;

    let rowDiff = Math.abs(rangeStorage[0][0] - rangeStorage[1][0]);
    let colDiff = Math.abs(rangeStorage[0][1] - rangeStorage[1][1]);

    //Target -> where we paste
    let address = addressBar.value;
    let [stRow, stCol] = decodeRIDCIDFromAddress(address);

    // r -> refers copyData row
    // c -> refers copyData col
    console.log(copyData);
    for(let i = stRow, r = 0; i <= stRow + rowDiff; i++, r++){
        for(let j = stCol, c = 0; j <= stCol + colDiff; j++, c++){
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            if(!cell) continue;   //out of the box

            // chng in DB
            let data = copyData[r][c];
            let cellProp = sheetDB[i][j];
            
            cellProp.value = data.value;
            cellProp.bold = data.bold;
            cellProp.italic = data.italic;
            cellProp.underline = data.underline;
            cellProp.fontSize = data.fontSize;
            cellProp.fontFamily = data.fontFamily;
            cellProp.fontColor = data.fontColor;
            cellProp.BGcolor = data.BGcolor;
            cellProp.alignment = data.alignment;

            //chng in UI
            cell.click();
        }
    }
    if(cut){
        copyData = [];
        cut = false;
    }
    // console.log(copyData);
})