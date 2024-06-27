
let cols = 14
let rows = 7

let dimen = JSON.parse(window.localStorage.getItem('dimen'))
if(dimen !== null){
  rows = dimen.rows
  cols = dimen.cols
}else{
  window.localStorage.setItem('dimen', JSON.stringify({rows:7, cols:14}))
}

function setIt(x, y){
  window.localStorage.setItem('dimen', JSON.stringify({rows:y, cols:x}))
  return 'succesful'
}

let codes = {
  0 : {x:1, y:0},
  1 : {x:0, y:1},
  2 : {x:-1, y:0},
  3 : {x:0, y:-1}
}

let size;

let occupancy_factor = 0.84

let arr = new Array(cols).fill().map(() => {
  
  return new Array(rows).fill().map(() => {
    return {
      isConnected : false,
      dirs : [],
      options : []
    }
  })

})

let solution = []

let counter = 0

async function generateMaze(){
  
  let pos = {
    x: floor(random(cols)),
    y: floor(random(rows))
  }
  
  let traces = [JSON.parse(JSON.stringify(pos))]
  
  while(counter <= rows*cols){
    
    let options = checkOptions(pos)
    console.log(arr[pos.x][pos.y].isConnected)
    arr[pos.x][pos.y].isConnected = true
    
    while(options.length == 0 && traces.length > 1){
      //console.log(options.length, traces.length)
      traces.splice(traces.length-1, 1)
      pos = traces[traces.length-1]
      options = checkOptions(pos)
    }
    
    if(options.length == 0){
      console.log(pos, 49)
      break
    }
    
    //console.log([...options], counter)
    
    let i = floor(random(options.length))
    arr[pos.x][pos.y].dirs.push(options[i])
    
    pos.x += codes[options[i]].x
    pos.y += codes[options[i]].y
    traces.push(JSON.parse(JSON.stringify(pos)))
    
    arr[pos.x][pos.y].dirs.push((options[i]+2)%4)
    
    if(random(1) < 10/(rows*cols)) await delay(0)
    
    counter++
  }
  
  await solveMaze({x:0, y:0}, -3, [])
}

function checkOptions(p){
  
  let dirs = [0, 1, 2, 3]
  let options = []
  
  for(let n = 0; n < dirs.length; n++){
    let i = p.x + codes[dirs[n]].x
    let j = p.y + codes[dirs[n]].y
    
    if(arr[i] && arr[i][j] && !arr[i][j].isConnected){
      options.push(dirs[n])
    }
  }
  return options
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight)
  
  if(rows/cols > height/width){
    size = (height*occupancy_factor)/rows
  }else{
    size = (width*occupancy_factor)/cols
  }
  
  angleMode(DEGREES)
  
  generateMaze()
}

function draw(){
  
  background(25, 30, 50)
  
  translate((width-cols*size)/2, (height-rows*size)/2)
  
  strokeWeight(size/15)
  
  stroke(255, 100)
  fill(0)
  rect(0, 0, cols*size, rows*size)
  
  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      fill(0)
      let s = size
      if(arr[i][j].isConnected){
        fill(255, 50)
        stroke(150, 100, 50)
        for(let dir of arr[i][j].dirs){
          //line(i*s+s/2, j*s+s/2, i*s+cos(dir*90)*s+s/2, j*s+sin(dir*90)*s+s/2)
        }
      }
      stroke(120, 130, 170)
      if(!arr[i][j].dirs.join('').includes('2')){
        line(i*s, j*s, i*s, (j+1)*s)
      }
      if(!arr[i][j].dirs.join('').includes('3')){
        line(i*s, j*s, (i+1)*s, j*s)
      }
    }
  }
  
  drawPath(solution)
  
  stroke(255, 100)
  line(0, 0, cols*size, 0)
  line(0, 0, 0, rows*size)
  line(cols*size, 0, cols*size, rows*size)
  line(0, rows*size, cols*size, rows*size)
  
}

async function solveMaze(pos, prev_dir){
  
  solution.push(JSON.parse(JSON.stringify(pos)))
  await delay(20000/(rows*cols) < 1000 ? 20000/(rows*cols) : 1000)
  
  if(pos.x == cols-1 && pos.y == rows-1) return solution
  
  let cell = arr[pos.x][pos.y]
  let forward_dirs = []
  
  cell.dirs.forEach((dir) => {
    if(dir !== (prev_dir+2)%4) forward_dirs.push(dir)
  })
  
  if(forward_dirs.length == 0) return false
  
  while(forward_dirs.length == 1){
    prev_dir = forward_dirs[0]
    pos.x += codes[forward_dirs[0]].x
    pos.y += codes[forward_dirs[0]].y
    
    solution.push(JSON.parse(JSON.stringify(pos)))
    await delay(20000/(rows*cols) < 1000 ? 20000/(rows*cols) : 1000)
    
    if(pos.x == cols-1 && pos.y == rows-1) return solution
    
    cell = arr[pos.x][pos.y]
    forward_dirs = []
    cell.dirs.forEach((dir) => {
      if(dir !== (prev_dir+2)%4) forward_dirs.push(dir)
    })
  }
  
  if(forward_dirs.length == 0) return false
  
  for(let dir of forward_dirs){
    let temp = {x: pos.x + codes[dir].x,
                y: pos.y + codes[dir].y}
    let prev_path = [...solution]
    let a = await solveMaze(temp, dir)
    if(a) return a
    else solution = prev_path
  }
  
}

function drawPath(sol){
  noFill()
  beginShape()
  let s = size
  if(sol[0]) curveVertex(sol[0].x*s+s/2, sol[0].y*s+s/2)
  for(let i = 1; i < sol.length; i++){
    colorMode(HSB)
    stroke((360*i/sol.length-frameCount*5)%360+360, 100, 100)
    //stroke(180, 100, 100)
    //curveVertex(sol[i].x*s+s/2, sol[i].y*s+s/2)
    line(sol[i-1].x*s+s/2, sol[i-1].y*s+s/2, sol[i].x*s+s/2, sol[i].y*s+s/2)
  }
  endShape()
  colorMode(RGB)
}

function delay(time){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //console.log(55565)
      resolve("rytf")
    }, time)
  })
}
