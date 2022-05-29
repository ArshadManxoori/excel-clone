let downloadBtn = document.querySelector(".download");
let openBtn = document.querySelector(".open");

//Download task
downloadBtn.addEventListener("click", (e) => {
    let jsonData = JSON.stringify([sheetDB, graphComponentMatrix]);
    let file = new Blob([jsonData], { type: "application/json" });  //this is the type of json type data "application/json"
    
    let a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "SheetData.json";
    a.click();
})

//Open task
openBtn.addEventListener("click", (e) => {
    
    //Opens files explorer
    let input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click();

    input.addEventListener("change", (e) => {
        let fr = new FileReader();
        let files = input.files;    //return a list of files
        let fileObj = files[0];

        fr.readAsText(fileObj);
        fr.addEventListener("load", (e) => {
            let readSheetData = JSON.parse(fr.result);
            
            //Basic sheet will be created with default data
            addSheetBtn.click();

            //SheetDB, graphComponent
            sheetDB = readSheetData[0];
            graphComponentMatrix = readSheetData[1];

            collectedSheeetDB[collectedSheeetDB.length - 1] = sheetDB;          
            collectedGraphComponent[collectedGraphComponent.length - 1] = graphComponentMatrix;          

            handleSheetProperties();
        })

    })
})