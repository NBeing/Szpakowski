// https://www.theparisreview.org/blog/2017/02/15/rhythmical-lines/

let pause = false;
let data = []
function mousePressed() {
  if (pause == false) {
    noLoop();
    pause = true;
    data = []
  } else {
    loop();
    pause = false;
  }
}
const meanings = {
  // move in
  "F": (config) => {
    let {
      axiom,
      meanings,
      length,
      theta,
      current_x,
      current_y,
      current_angle,
    } = config
    
    const next_x =
      (current_x) + (length * Math.cos(current_angle))
    // we flip the y axis because in p5 land, 
    // positive means "go down"
    // but in math land, negative means "go up"
    const next_y =
      (current_y) + (-length * Math.sin(current_angle))

    line(
      current_x,
      current_y,
      next_x,
      next_y,
    )
    // console.log(current_x, current_y, next_x, next_y)
    config.current_x = next_x
    config.current_y = next_y

    return config
  },
  "+": (config) => {
    // angle is in radians, and we want to change the angle in the direction
    config.current_angle = config.current_angle + config.theta
    return config
  },
  "-": (config) => {
    // angle is in radians, and we want to change the angle in the direction
    config.current_angle = config.current_angle - config.theta
    return config
  },
}
const drawTheThing = (config) => {
  let {
    axiom,
    meanings, // what each token "does"
    length,  // line length
    theta, // theta
    current_x, //starting_point_x,
    current_y, //starting_point_y
    current_angle,
    stack
  } = config

  axiom.forEach(symbol => {
    // console.log("Looking at", meanings, symbol, config)
    if (meanings[symbol]) {
      config = meanings[symbol](config)
    }
  })
}

const getRandomNucleotide = () =>{
  const validRules = Object.keys(meanings)
  // choose a token from validRules at random   
  return validRules[Math.floor(random(0, validRules.length))]
 }
const generateRandomDNA = (strandLength) => {
  const DNA = []
  for ( let i = 0; i < strandLength; i++ ){
    DNA.push(getRandomNucleotide())
  }  
  return DNA
}
const degreesToRadians = (degrees) => {
  return degrees * ((Math.PI)/180) 
}

const globals = {
  strandLength : 200,
  populationSize : 1000,
  population: [],
  meanings,  
  baseLength : 10,
  theta: Math.PI/2,
  numberOfGenerations : 100,
}

function judgeTheFitness(dna) {
  // count the number of F in dna.
  let score = 0
  dna.forEach(element => {
    if (element == "F") {
      score++
    } else {
      score = score * 0.75
    }
  });
  return score
}

function judgeTheFitnessBetter(dna, width, height) {
  // count the number of F in dna.
  let counts = new Array(width * height).fill(0) // width * height
  let outOfBounds = 0
  let x = 0
  let y = 0
  let direction = 0
  // 0 is right
  // 1 is up
  // 2 is left
  // 3 is down
  
  function xOff(direction) {
    switch (direction) {
      case 0:
        return 1;
      case 2:
        return -1;
      default:
        return 0;
    }
  }
  
  function yOff(direction) {
    switch (direction) {
      case 1:
        return 1;
      case 3:
        return -1;
      default:
        return 0;
    }
  }
  
  dna.forEach(element => {
    switch (element) {
    case "F":
      x += xOff(direction)
      y += yOff(direction)
    
      if (x < 0 || x > width) {
        outOfBounds++
      } else if (y < 0 || y > height) {
        outOfBounds++
      } else {
        counts[x * y]++;
      }
      break;
    case '+':
      direction = (direction + 1) % 4;
      break;
    case '-':
      direction = (direction - 1) % 4;
      break;
    default:
      console.error("not implemented:", element)
    }
  });
  
  let score = 0
  counts.forEach((count) => {
    if (count > 1) {
      score /= 10
    } else if (count == 1) {
      score++
    }
    
    if (outOfBounds > 5) {
      score /= 2
    }
  })
  
  return score
}

const remix = (parentA_DNA, parentB_DNA) => {
  // console.log("Parents",
  //   parentA_DNA, 
  //   parentB_DNA
  // )
  const midPoint = Math.floor(random(0, parentA_DNA.length))
  const parentA_DNA_contribution = parentA_DNA.slice(0, midPoint)
  const parentB_DNA_contribution =  parentB_DNA.slice(midPoint, parentB_DNA.length)
  let result  = parentA_DNA_contribution.concat(parentB_DNA_contribution)
  // console.log("Result", result)
  return result
} 

const mutate = (child, mutationRate) => {
  //{!1} Look at each gene in the array.
  for (let i = 0; i < child.length; i++) {
    //{!1} Check a random number against the mutation rate.
    if (random(1) < mutationRate) {
      //{!1} Mutation means choosing a new random character.
      child[i] = getRandomNucleotide();
    }
  }
  return child
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(127)
  strokeWeight(2)

  for ( let i = 0; i < globals.populationSize; i++ ){
    globals.population.push(generateRandomDNA(globals.strandLength))
  }
  
  frameRate(2)
}

function draw() {
  // Draw!
  fill(0)
  rect(0, 0, width, height)
  stroke(255)
  strokeWeight(3)
  try {      

    let highestFitness = 0
    let fitnesses = []
    
    for (let i = 0; i < globals.numberOfGenerations; i++) {
      highestFitness = 0
      fitnesses = []
      let totalFitness = 0
      for (let i = 0; i < globals.population.length; i++ ){
        const fitness = judgeTheFitnessBetter(globals.population[i], 25, 25)
        totalFitness += fitness
        fitnesses.push(fitness)
      }
      
      // Normalize fitness between 0 and 1.
      for (let i = 0; i < fitnesses.length; i++ ){
        fitnesses[i] /= totalFitness;
        highestFitness = Math.max(fitnesses[i], highestFitness)
      }
      // console.log(fitnesses)
  
      function weightedSelection() {
        // Start with the first element.
        let index = 0;
        // Pick a starting point.
        let start = random(1);
        // At the finish line?
        while (start > 0) {
          // Move a distance according to fitness.
          start = start - fitnesses[index];
          // Pass the baton to the next element.
          index++;
        }
        // Undo moving to the next element since the finish has been reached.
        index--;
        return globals.population[index];
      }
      
      // create the mating pool
      
      // remix our genes
      const newPopulation = []
      for ( let i = 0; i < globals.populationSize; i++ ){
        let parentA = weightedSelection();
        let parentB = weightedSelection();
        // the magic of intercourse?!
        let newChild = remix(parentA, parentB)
        // console.log("Child before mutate", newChild)
        newChild = mutate(newChild, 0.01)
        // console.log("Child after mutate", newChild)
        newPopulation.push(newChild)
      }
  
      globals.population = newPopulation
      // run the simulation again with new genes
    }
    console.log("Fittest baby:", highestFitness)
    
    // sort globals.population by fitnesses
    let matchedPopulationWithFitness = []
    for(let j = 0; j < globals.population.length; j++){
      matchedPopulationWithFitness.push(
        {
          population: globals.population[j],
          fitness: fitnesses[j]
        }
      )
    }
    matchedPopulationWithFitness = matchedPopulationWithFitness.sort((a, b) => {
      return a.fitness - b.fitness
    }).slice(-10)
    

    for ( let i = 0; i < matchedPopulationWithFitness.length; i++ ){
      let current_x = (i * 100)
      let current_y =  (i * 100)
      drawTheThing({
        axiom: matchedPopulationWithFitness[i].population,
        meanings, // what each token "does"
        length: globals.baseLength,  // line length
        theta: globals.theta, // theta
        current_x, //starting_point_x,
        current_y, //starting_point_y.
        current_angle : 0,
        stack: [],
      })
    }
  } catch (e) {
    console.log("error:", e)
  }
}
