for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur", (e) => {
            let address = addressBar.value;
            let [activeCell , cellProp] = getCellAndCellProp(address);
            let enteredData = activeCell.innerText;

            if(enteredData === cellProp.value) return;
            
            cellProp.value = enteredData;
            //If datat modifies remove P-C relation, formula empty, update children with new hardcoded (modified) value
            removeChildFromParent(cellProp.formula);
            cellProp.formula = "";
            updateChildrenCells(address);
            
            // console.log(cellProp);

        })
    }
}

let formulaBar = document.querySelector(".formula-bar");
formulaBar.addEventListener("keydown", async (e) => {
    let inputFormula = formulaBar.value;
    if(e.key === "Enter" && inputFormula){
        
        //If cahnge in formula , break old P-C relation , evaluate new Formula, add new P-C relationship
        let address = addressBar.value;
        let [cell, cellProp] = getCellAndCellProp(address);
        if(inputFormula !== cellProp.formula) removeChildFromParent(cellProp.formula);
        
        addChidlToGraphComponent(inputFormula, address);
        //Check formula is cyclic or not , then only evaluate
        let cyclicResponse = isGraphCyclic(graphComponentMatrix); //it return the points where our graph is cyclic
        if(cyclicResponse){ 
            // alert ("Your formula is cyclic");
            let response = confirm("Your Formula is Cyclic, Do you Want To Trace Your Path?");  //OK -> true
            while(response === true){
                //Keep on tracking color untile user is satisfied
               await isGraphCyclicTracePath(graphComponentMatrix, cyclicResponse);   //i want to complete full iteration of color tracking, so i will attach await here also
                response = confirm("Your Formula is Cyclic, Do you Want To Trace Your Path?");
            }
            
            removeChidlFromGraphComponent(inputFormula, address);
            return;
        }

        let evaluatedValue = evaluateFormula(inputFormula);

        

        //To Update UI and cellProp in DB
        setCellUIandCellProp(evaluatedValue, inputFormula, address);

        addChidlToParent(inputFormula);
        console.log(sheetDB);

        updateChildrenCells(address);
    }

})

function addChidlToGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for(let i = 0; i < encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            //B1 = A1 + 10  //A1's row and col is prid pcid which is (0,0) we find this index in graphComponentMatix and cell will be identified and then we push there respective4 childrens
            graphComponentMatrix[prid][pcid].push([crid, ccid]);
        }
    }
}

function removeChidlFromGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");

    for(let i = 0; i < encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].pop();
        }
    }
}

function updateChildrenCells(parenAddress){
    let [parentCell, parentCellProp] = getCellAndCellProp(parenAddress);
    let children = parentCellProp.children;

    for(let i = 0; i < children.length; i++){
        let childAddress = children[i];
        let [childCell, childCellProp] = getCellAndCellProp(childAddress);
        let childFormula = childCellProp.formula;

        let evaluatedValue = evaluateFormula(childFormula);
        setCellUIandCellProp(evaluatedValue, childFormula, childAddress);
        updateChildrenCells(childAddress);  //it will work recursivly and changes its child and grand child and so on..
        //here base case is our loop , at last when a cell hasnt any cildren so it's children length become 0, and loop on occure
    }
}

function addChidlToParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i = 0; i < encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){   //A to Z
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            parentCellProp.children.push(childAddress);
        }
    }
}

function removeChildFromParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i = 0; i < encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){   //A to Z
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx, 1); //remove from idx and remove just one value
        }
    }
}

function evaluateFormula(formula){
    //Dependency formula Work
    let encodedFormula = formula.split(" ");
    for(let i = 0; i < encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){   //A to Z
            let [cell, cellProp] = getCellAndCellProp(encodedFormula[i]);
            encodedFormula[i] = cellProp.value;
        }
    }
    let decodedFormula = encodedFormula.join(" "); 

    return eval(decodedFormula);   //this is js function it will evaluate a valid expression and we return it
}
function setCellUIandCellProp(evaluatedValue, formula, address){
    let [cell, cellProp] = getCellAndCellProp(address);

    cell.innerText = evaluatedValue;    //UI Update
    cellProp.value = evaluatedValue;    //DB Update
    cellProp.formula = formula;         //DB Formula Update
}