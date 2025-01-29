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
      rules,
      meanings,
      length,
      theta,
      iterations,
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
    return config
  },
  "f": (config) => {
    let {
      axiom,
      rules,
      meanings,
      length,
      theta,
      iterations,
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
  "|": (config) => {
    // reverse current angle
    config.current_angle = config.current_angle + Math.PI
    return config
  },
  //  10,10,PI                    20,20,PI/2             ...   20,20.PI/2     
  //  [                   F F F + [                          ] F           ] FF
  //   angle1 pushed to stack     angle 2 pushed to stack                       
  // write more
  "[": (config) => {
    config.stack.push({
      current_x: config.current_x,
      current_y: config.current_y,
      current_angle: config.current_angle,
    })

    return config
  },
  "]": (config) => {
    const previous_state = config.stack.pop(config)
    config.current_x = previous_state.current_x
    config.current_y = previous_state.current_y
    config.current_angle = previous_state.current_angle

    return config
  },
  "v" : (config) => {
    config.current_angle = config.current_angle / 2
    return config
  },
  "^" : (config) => {
    config.current_angle = config.current_angle + config.current_angle
    return config
  }

}
const drawTheThing = (config) => {
  let {
    axiom,
    rules, // how to rewrite each token
    meanings, // what each token "does"
    length,  // line length
    theta, // theta
    iterations,      // iterations
    current_x, //starting_point_x,
    current_y, //starting_point_y
    current_angle,
    stack
  } = config

  const rewrite = (rules, axiom) => {
    let tmp = []
    for (let i = 0; i < axiom.length; i++) {
      let current = axiom[i]
      if (rules[current]) {
        tmp.push(rules[current])
      } else {
        tmp.push(current)
      }
    }
    tmp = tmp.reduce((acc, cur) => {
      acc = acc.concat(cur)
      return acc

    }, "")
    return tmp
  }
  for (let j = 0; j < iterations; j++) {
    axiom = rewrite(rules, axiom)
  }


  Array.from(axiom).forEach(symbol => {
    // console.log("Looking at", meanings, symbol, config)
    if (meanings[symbol]) {
      config = meanings[symbol](config)
    }

  })
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(127)
  strokeWeight(2)
}
const degreesToRadians = (degrees) => {
  return degrees * ((Math.PI)/180) 
}
function draw() {
  fill(0)
  rect(0, 0, width, height)
  stroke(0,64,64)
  strokeWeight(2)
  try {
    let axiom = "F+F+F"
    let rules = {
      F : "F-F+F"
    }
    let theta = (2 * Math.PI / 3)

    let length = 20
    let iterations = 0
    let current_x = mouseX
    let current_y = mouseY
    let current_angle = Math.PI/2

    drawTheThing({
      axiom,
      rules, // how to rewrite each token
      meanings, // what each token "does"
      length,  // line length
      theta, // theta
      iterations,      // iterations
      current_x: mouseX, //starting_point_x,
      current_y: mouseY, //starting_point_y.
      current_angle,
      stack: [],
    })

  } catch (e) {
    console.log("error:", e)
  }
}
