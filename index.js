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
      current_angle
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


    /*
        -----
       |
    ---|   

    x1,y1,x2,y2





    */
    return config
  },
  // "f": (config) => {
  //   let {
  //     axiom,
  //     meanings,
  //     length,
  //     theta,
  //     current_x,
  //     current_y,
  //     current_angle
  //   } = config

  //   const next_x =
  //     (current_x) + (length * Math.cos(current_angle))
  //   // we flip the y axis because in p5 land, 
  //   // positive means "go down"
  //   // but in math land, negative means "go up"
  //   const next_y =
  //     (current_y) + (-length * Math.sin(current_angle))

  //   config.current_x = next_x
  //   config.current_y = next_y
  //   return config
  // },

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
  // "|": (config) => {
  //   // reverse current angle
  //   config.current_angle = config.current_angle + Math.PI
  //   return config
  // },
  // //  10,10,PI                    20,20,PI/2             ...   20,20.PI/2     
  // //  [                   F F F + [                          ] F           ] FF
  // //   angle1 pushed to stack     angle 2 pushed to stack                       
  // // write more
  // "[": (config) => {
  //   config.stack.push({
  //     current_x: config.current_x,
  //     current_y: config.current_y,
  //     current_angle: config.current_angle,
  //   })

  //   return config
  // },
  // "]": (config) => {
  //   const previous_state = config.stack.pop(config)
  //   config.current_x = previous_state.current_x
  //   config.current_y = previous_state.current_y
  //   config.current_angle = previous_state.current_angle

  //   return config
  // },
  // "v" : (config) => {
  //   config.current_angle = config.current_angle / 2
  //   return config
  // },
  // "^" : (config) => {
  //   config.current_angle = config.current_angle + config.current_angle
  //   return config
  // }

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

const getRandomNucleotide = (validRules) =>{
  // choose a token from validRules at random   
  return validRules[Math.floor(random(0, validRules.length))]
 }
const generateRandomDNA = (validRules, strandLength) => {
  const DNA = []
  for ( let i = 0; i < strandLength; i++ ){
    DNA.push(getRandomNucleotide(validRules))
  }  
  return DNA
}
const degreesToRadians = (degrees) => {
  return degrees * ((Math.PI)/180) 
}

const globals = {
  strandLength : 200,
  populationSize : 80,
  population: [],
  meanings,  
  baseLength : 10,
  theta: Math.PI/2,
  numberOfGenerations : 50,
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(127)
  strokeWeight(2)
  const validRules = Object.keys(meanings)

  for ( let i = 0; i < globals.populationSize; i++ ){
    globals.population.push(generateRandomDNA(validRules, globals.strandLength))
  }
  
  frameRate(2)
  

}

function draw() {
  // Draw!
  fill(0)
  rect(0, 0, width, height)
  stroke(0,64,64)
  strokeWeight(2)
  try {      
    
    for ( let i = 0; i < globals.population.length; i++ ){
      let current_x = (i * 100)
      let current_y =  (i * 100)
      drawTheThing({
        axiom: globals.population[i],
        meanings, // what each token "does"
        length: globals.baseLength,  // line length
        theta: globals.theta, // theta
        current_x, //starting_point_x,
        current_y, //starting_point_y.
        current_angle : 0,
        stack: [],
      })
    }

    for (let i = 0; i < globals.numberOfGenerations; i++) {
      const fitnesses = []
      for ( let i = 0; i < globals.population.length; i++ ){
        fitnesses.push(judgeTheFitness(globals.population[i]))
      }
      console.log(fitnesses)
  
      // create the mating pool
      let matingPool = [];
      for (let i = 0; i < globals.population.length; i++) {
        //{!1} n is equal to fitness times 100.
        // 100 is an arbitrary way to scale the percentage of fitness to a larger integer value.
        const fitness = fitnesses[i]
        let n = floor(fitness * 100);
        for (let j = 0; j < n; j++) {
          //{!1} Add each member of the population to the mating pool n times.
          matingPool.push(globals.population[i]);
        }
      }
      // remix our genes
      const newPopulation = []
      for ( let i = 0; i < globals.populationSize; i++ ){
        let parentA = random(matingPool);
        let parentB = random(matingPool);
        // the magic of intercourse?!
        const newChild = remix(parentA, parentB)
        newPopulation.push(newChild)
      }
  
      globals.population = newPopulation
      // run the simulation again with new genes
    }
  } catch (e) {
    console.log("error:", e)
  }
}
