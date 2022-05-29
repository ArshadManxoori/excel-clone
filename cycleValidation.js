//Storage -> 2D array
let collectedGraphComponent = [];

let graphComponentMatrix = [];

// for(let i = 0; i < rows; i++){
//     let row = [];
//     for(let j = 0; j < cols; j++){
//         //why array -> more than 1 chld realtion(dependency) 
//         row.push([]);
//     }
//     graphComponentMatrix.push(row);
// }

//if true -> Cyclic, 
//if false-> non-cyclic
function isGraphCyclic(graphComponentMatrix){
    //Dependency -> visited, dfsVisited (2D array)
    let visited = [];
    let dfsVisited = [];

    for(let i = 0; i < rows; i++){
        let visitedRow = [];    //Node visit trace
        let dfsVisitedRow = []; //stack visit trace
        for(let j = 0; j < cols; j++){
            visitedRow.push(false);
            dfsVisitedRow.push(false);
        }
        visited.push(visitedRow);
        dfsVisited.push(dfsVisitedRow);
    }

    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            if(visited[i][j] === false){
                let response = dfsCycleDetection(graphComponentMatrix, i, j, visited, dfsVisited);
                if(response == true) return [i, j];
            }
        }
    }

    return null;

}

//Start -> vis(true) dfsVis(true)
//Start -> dfsVis(false)
//if vis[i][j] == true -> go back (already explored path, no use to explore again)
//Cyclic detection condition -> if (vis[i][j] == true && dfsVis[i][j] == true) -> cyclic
function dfsCycleDetection(graphComponentMatrix, srcr, srcc, visited, dfsVisited){
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;

    //A1 -> [ [0, 1], [1, 0], [5, 10], ........ ]  //cell
    for(let children = 0; children < graphComponentMatrix[srcr][srcc].length; children++){
        let [nbrr, nbrc] = graphComponentMatrix[srcr][srcc][children];
        if(visited[nbrr][nbrc] === false){
            let response = dfsCycleDetection(graphComponentMatrix, nbrr, nbrc, visited, dfsVisited)
            if(response === true) return true;   //found cycle so return immidiately no need to explore more
        }else if (visited[nbrr][nbrc] === true && dfsVisited[nbrr][nbrc] === true){
            return true;
        }
        
    }
    dfsVisited[srcr][srcc] = false;
    return false;
}