window.addEventListener('load', main);

function prep(){
    const grid = document.querySelector(".grid");
    const nTiles = game.nrows * game.ncols;
    grid.innerHTML = "";   // removes previous tiles from previous game
    for (let i = 0; i < nTiles; i++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("data-tileInd", i);
      tile.addEventListener("click", () => {
        tile_click(i);
      });
      tile.addEventListener("contextmenu", e => {
        e.preventDefault();
        tile_mark(i);
      });
      grid.appendChild(tile);
      if (window.matchMedia("(max-width: 800px)").matches) {
        tile.id = "tile" + i;
        $("#tile" + i).bind("taphold", () => {
          tile_mark(i);
        });
      }
      
      console.log("i made tile");
    }
    
    let html = document.querySelector("html");
    console.log("Your render area:", html.clientWidth, "x", html.clientHeight)
    let height = html.clientHeight - 240;
    if(html.clientWidth < 800) {
      height = html.clientHeight - 400;
    }
    if(html.clientWidth < 800 && html.clientHeight < 1200) {
      height = html.clientHeight - 400;
    }
    document.querySelectorAll(".tile").forEach ( (tile) => {
        tile.style.width = (height / game.nrows) + "px";
        tile.style.height = (height / game.nrows) + "px";
    });

  }

function render() {
  const grid = document.querySelector(".grid");
  const rend = game.getRendering();
  grid.style.gridTemplateColumns = `repeat(${game.ncols}, 1fr)`;
  // grid.style.gridTemplateRows = `repeat(${game.nrows}, 1fr)`;
  for (let i = 0; i < grid.children.length; i++) {
    const col = i % game.ncols;
    const row = Math.floor(i / game.ncols);
    const tileind = rend[row][col];
    make_cell(tileind, i);
    console.log("i make tiles");
  }
  document.querySelectorAll(".mines").forEach(
    (e)=> {
      e.textContent = String(game.nmines - game.nmarked);
    });

}

function make_cell(tileind, ind) {
  const grid = document.querySelector(".grid");
  if (tileind !== "F") {
    grid.childNodes[ind].style.backgroundImage = "none";
  }
  if(tileind !== "H" && tileind !== "F" && tileind !== "M") {
    grid.childNodes[ind].style.backgroundColor = "#bd8fa6";
    if(tileind !== "0") {
      grid.childNodes[ind].innerHTML = tileind;
    }
  }  
  if(tileind === "F") {
    grid.childNodes[ind].style.backgroundImage = "url(flag.svg)";
  }
  if(tileind === "M" && game.exploded) {
    grid.childNodes[ind].style.backgroundImage = "url(explosion.svg)";
    grid.childNodes[ind].style.backgroundColor = "#703f58";
    end_game();
  }
  
}

function tile_click(ind) {
  if(game.nuncovered === 0) {
    start_time();
  }
  const col = ind % game.ncols;
  const row = Math.floor(ind / game.ncols);
  game.uncover(row, col);
  const grender = game.getRendering();
  console.log(grender.join("\n"));
  render();
  if(game.getStatus().done) {
      end_game();  
      stop_time();      
    }
}

function tile_mark(ind) {
  const col = ind % game.ncols;
  const row = Math.floor(ind / game.ncols);
  game.mark(row, col);
  const grender = game.getRendering();
  console.log(grender.join("\n"));
  render();
}

function end_game() {
  document.querySelector("#overlay").classList.toggle("active");
  if(game.exploded) {
    document.querySelector(".res").innerHTML = "AW! You lost! :(";
    return;
  }  
  if(!game.exploded) {
    document.querySelector(".res").innerHTML = "YAY! You won! :D";
  }
}

let t = 0;
let time = null;

function start_time() {
  time = setInterval(function(){
    t++;
    document.querySelectorAll(".time").forEach(
      (e)=> {
        e.innerHTML = ('000' + t).substr(-3);
      })
  }, 1000);  
}

function stop_time(){
   if(time) window.clearInterval(time);
}

function restart_time(){
  t = 0;
  document.querySelector(".time").innerHTML = ('000' + t).substr(-3);
}

function level_set(rows, cols) {
  if(rows == 8) {
    bombs = 10;
  }
  if(rows == 14) {
    bombs = 40;
  }
  game.init(rows, cols, bombs);
  prep();
  render();
  stop_time();
  restart_time();
}

let game = new MSGame();

function main() {

    // $(document).contextmenu(function() {
    //     return false;
    // });

    document.addEventListener("contextmenu", e => {
      e.preventDefault();
    });

    document.querySelectorAll(".levelButton").forEach((button) =>{
      let rows = button.getAttribute("rows");
      let cols = button.getAttribute("cols");
      button.addEventListener("click", level_set.bind(null, rows, cols));
    });

    // document.querySelectorAll(".levelButton").forEach((button) =>{
    //   [rows,cols] = button.getAttribute("data-size").split("x").map(s=>Number(s));
    //   button.addEventListener("click", level_set.bind(null, rows, cols));
    // });

    document.querySelector("#overlay").addEventListener("click", () => {
      document.querySelector("#overlay").classList.remove("active");
      level_set(game.nrows, game.ncols);
    });
  
    
    // game.init(8,10,10);
    level_set(8,10);
    //prep();
    // render();
}