// https://www.theparisreview.org/blog/2017/02/15/rhythmical-lines/

let pause = false
let data = []
function mousePressed() {
  if (pause == false) {
    noLoop()
    pause = true
    data = []
  } else {
    loop()
    pause = false
  }
}

class Drawer {
  constructor(xOffset, yOffset, baseLength) {
    this.xOffset = xOffset
    this.yOffset = yOffset
    this.baseLength = baseLength
    this.x = xOffset
    this.y = yOffset
  }

  move(x, y) {
    const nextX = this.xOffset + x * this.baseLength
    const nextY = this.yOffset + y * this.baseLength

    line(
      this.x,
      this.y,
      nextX,
      nextY
    )

    this.x = nextX
    this.y = nextY
  }
}

const meanings = ['←', '→', '↑', '↓']

function processInstructions(instructions, drawer) {
  let x = 0
  let y = 0

  instructions.forEach(symbol => {
    switch (symbol) {
      case '→':
        x += 1
        drawer.move(x, y)
        break
      case '↓':
        y += 1
        drawer.move(x, y)
        break
      case '←':
        x -= 1
        drawer.move(x, y)
        break
      case '↑':
        y -= 1
        drawer.move(x, y)
        break
    }
  })
}

function drawTheThing(config) {
  const drawer = new Drawer(
    config.current_x,
    config.current_y,
    config.length
  )

  processInstructions(config.axiom, drawer)
}

const getRandomNucleotide = () => {
  return random(meanings)
}

const generateRandomDNA = (strandLength) => {
  const DNA = []
  for (let i = 0; i < strandLength; i++) {
    DNA.push(getRandomNucleotide())
  }
  return DNA
}
const degreesToRadians = (degrees) => {
  return degrees * ((Math.PI) / 180)
}

const globals = {
  strandLength: (25 * 25) / 4,
  populationSize: 500,
  population: [],
  baseLength: 10,
  gridSize: 25,
  numberOfGenerations: 100,
}

class Scorer {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.counts = new Array(width * height).fill(0)
    this.outOfBounds = 0
  }

  move(x, y) {
    if (x < 0 || x >= this.width) {
      this.outOfBounds++
    } else if (y < 0 || y >= this.height) {
      this.outOfBounds++
    } else {
      this.counts[x + y * this.width]++
    }

    this.x = x
    this.y = y
  }

  neighbor(x, y) {
    if (0 <= x && x < this.width && 0 <= y && y < this.height) {
      return this.counts[x + y * this.width] > 0
    }
    return false
  }

  score() {
    let score = 0
    let overdraw = 0
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const count = this.counts[x + y * this.width]
        if (count > 1) {
          overdraw += count - 1
          continue
        }

        score += count
        score += this.neighbor(x - 1, y) ? 1 : 0
        score += this.neighbor(x + 1, y) ? 1 : 0
        score += this.neighbor(x, y - 1) ? 1 : 0
        score += this.neighbor(x, y + 1) ? 1 : 0
      }
    }

    score = score / Math.max(this.outOfBounds + overdraw, 1)

    return score
  }
}

const remix = (parentA_DNA, parentB_DNA) => {
  // console.log("Parents",
  //   parentA_DNA, 
  //   parentB_DNA
  // )
  const midPoint = Math.floor(random(0, parentA_DNA.length))
  const parentA_DNA_contribution = parentA_DNA.slice(0, midPoint)
  const parentB_DNA_contribution = parentB_DNA.slice(midPoint, parentB_DNA.length)
  let result = parentA_DNA_contribution.concat(parentB_DNA_contribution)
  // console.log("Result", result)
  return result
}

const mutate = (child, mutationRate) => {
  //{!1} Look at each gene in the array.
  for (let i = 0; i < child.length; i++) {
    //{!1} Check a random number against the mutation rate.
    if (random(1) < mutationRate) {
      //{!1} Mutation means choosing a new random character.
      child[i] = getRandomNucleotide()
    }
  }
  return child
}

function simulate() {
  function weightedSelection() {
    let index = 0
    let start = random(1)
    while (start > 0) {
      start = start - globals.population[index].fitness
      index++
    }
    index--
    return globals.population[index].dna
  }

  // remix our genes
  const newPopulation = Array(globals.populationSize)
  for (let i = 0; i < newPopulation.length; i++) {
    let parentA = weightedSelection()
    let parentB = weightedSelection()
    // the magic of intercourse?!
    let newChild = remix(parentA, parentB)
    // console.log("Child before mutate", newChild)
    newChild = mutate(newChild, 0.02)
    // console.log("Child after mutate", newChild)
    newPopulation[i] = {
      dna: newChild,
      fitness: 0
    }
  }

  globals.population = newPopulation
  judgeFitness()
}

function judgeFitness() {
  let totalFitness = 0
  for (let i = 0; i < globals.population.length; i++) {
    const judge = new Scorer(globals.gridSize, globals.gridSize)
    processInstructions(globals.population[i].dna, judge)
    const fitness = judge.score()
    totalFitness += fitness
    globals.population[i].fitness = fitness
  }

  // Normalize fitness between 0 and 1
  for (let i = 0; i < globals.population.length; i++) {
    globals.population[i].fitness /= totalFitness
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  stroke(127)
  strokeWeight(2)

  for (let i = 0; i < globals.populationSize; i++) {
    globals.population.push({
      dna: generateRandomDNA(globals.strandLength),
      fitness: 0,
    })
  }

  judgeFitness()

  setInterval(simulate)
  frameRate(2)
}

function draw() {
  // Draw!
  fill(0)
  stroke(0)
  rect(0, 0, width, height)

  // Update how we track the fittest individuals
  let sortedPopulation = [...globals.population]
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 9)

  const maxDim = globals.gridSize * globals.baseLength
  const debugX = 25 + (maxDim + 25) * 3

  fill(255)
  noStroke()
  textSize(16)
  text(`Fittest: ${sortedPopulation[0].fitness.toFixed(3)}`, debugX, 25)

  // Draw fitness history trendline
  if (!data) data = []
  data.push(sortedPopulation[0].fitness)
  if (data.length > 60) data.shift()

  drawTrendline(debugX, 40, 180, 50, data)

  for (let i = 0; i < sortedPopulation.length; i++) {
    const row = floor(i / 3)
    const column = i % 3
    let current_x = 25 + (column * (maxDim + 25))
    let current_y = 25 + (row * (maxDim + 25))

    stroke(0)
    fill(30)
    rect(current_x, current_y, maxDim, maxDim)

    fill(0)
    stroke(255, 125)
    strokeWeight(3)
    drawTheThing({
      axiom: sortedPopulation[i].dna,
      meanings,
      length: globals.baseLength,
      current_x,
      current_y,
      direction: 0,
    })
  }
}

function drawTrendline(x, y, width, height, data) {
  // Draw graph background
  fill(30)
  stroke(0)
  rect(x, y, width, height)

  // Get current value for centering
  const currentValue = data[data.length - 1] || 0.5
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)

  // Draw trendline
  if (data.length > 1) {
    stroke(255, 125)
    strokeWeight(2)
    noFill()
    beginShape()
    for (let i = 0; i < data.length; i++) {
      const pointX = map(i, 0, data.length, x, x + width)
      const pointY = map(data[i], minValue, maxValue, y + height, y)
      vertex(pointX, pointY)
    }
    endShape()

    // Draw dot at current value
    const lastX = map(data.length - 1, 0, data.length, x, x + width)
    const lastY = map(currentValue, minValue, maxValue, y + height, y)
    fill(255)
    noStroke()
    circle(lastX, lastY, 6)
  }
}
