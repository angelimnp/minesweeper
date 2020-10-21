window.addEventListener('load', main);

/*
* creates tiles for the grid
* tile number depends on size of game
*/
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

      // if window  width is 800px or less
      // taphold is used for marking tiles instead of right click
      if (window.matchMedia("(max-width: 800px)").matches) {
        tile.id = "tile" + i;
        $("#tile" + i).bind("taphold", () => {
          tile_mark(i);
        });
      }
    }

    // changes size of grid and tiles based on the size of screen
    // if width of screen is less than 800px
    // new height (size of screen - 400px)
    // height divided by size of level's rows
    // resulting in tile's new width and height
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


/*
* updates DOM to show grid and any changes
* - gets game's rendering for updating the tiles
* - subtracts or adds the amount of mines are marked
*/
function render() {
  const grid = document.querySelector(".grid");
  const rend = game.getRendering();
  grid.style.gridTemplateColumns = `repeat(${game.ncols}, 1fr)`;
  // grid.style.gridTemplateRows = `repeat(${game.nrows}, 1fr)`;
  for (let i = 0; i < grid.children.length; i++) {
    const col = i % game.ncols;
    const row = Math.floor(i / game.ncols);
    const tileind = rend[row][col];
    make_tile(tileind, i);
  }
  document.querySelectorAll(".mines").forEach(
    (e)=> {
      e.textContent = String(game.nmines - game.nmarked);
    });

}

/*
* creates tiles depending on their rendering
* - checks condition of tile based on its index
* - changes appearance of tile based on condition
*/
function make_tile(tileind, ind) {
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

/*
* callback for clickin a tile
* - if first click on board, time starts
* - calculates position of row and column of tile
* - uncovers position of row and column through game engine
* - renders game to show what is uncovered
* - if game is done, end of game function called and time stops
*/
function tile_click(ind) {
  if(game.nuncovered === 0) {
    start_time();
  }
  const col = ind % game.ncols;
  const row = Math.floor(ind / game.ncols);
  game.uncover(row, col);
  render();
  if(game.getStatus().done) {
      end_game();  
      stop_time();      
    }
}

/*
* callback for marking a tile
* - calculates position of row and column of tile
* - marks position of row and column through game engine
* - renders game to show flag
*/
function tile_mark(ind) {
  const col = ind % game.ncols;
  const row = Math.floor(ind / game.ncols);
  game.mark(row, col);
  render();
}

/*
* displays overlay when game ends
* type of message depends on if win or lose
*/
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

let t = 0;  // variable for incrementing time
let time = null; // variable for time

/*
* starts time of game
*/
function start_time() {
  time = setInterval(function(){
    t++;
    document.querySelectorAll(".time").forEach(
      (e)=> {
        e.innerHTML = ('000' + t).substr(-3);
      })
  }, 1000);  
}

/*
* stops time of game
*/
function stop_time(){
   if(time) window.clearInterval(time);
}

/*
* restarts time of game
*/
function restart_time(){
  t = 0;
  document.querySelector(".time").innerHTML = ('000' + t).substr(-3);
}

/*
* callback for level buttons
* - sets the rows and columns of grid
* - sets number of bombs based on number of rows
* - renders game
* - stops time if previous game is still going on
* - restarts time
*/
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

    // disables context menu within game
    document.addEventListener("contextmenu", e => {
      e.preventDefault();
    });

    // register callbacks for level buttons
    document.querySelectorAll(".levelButton").forEach((button) =>{
      let rows = button.getAttribute("rows");
      let cols = button.getAttribute("cols");
      button.addEventListener("click", level_set.bind(null, rows, cols));
    });

    // callback for overlay - hides overlay and restarts game
    document.querySelector("#overlay").addEventListener("click", () => {
      document.querySelector("#overlay").classList.remove("active");
      level_set(game.nrows, game.ncols);
    });
  
    // simulates starting at easy level
    level_set(8,10);
}
