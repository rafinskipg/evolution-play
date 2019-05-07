const MAX_ITERATION_TIME = 12000

function makeid(length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

let ParticleSystem = function(position) {
  this.origin = position.copy()
  this.particles = []
  // Food
  this.food = []
  this.originalFood = []

  // Bombs
  this.bombs = []
  this.originalBombs = []

  // Iterations
  this.iterationTime = 0
  this.finishedIteration = false
  this.generation = 0

  // Stats
  this.stats = {
    medianLifespan: 0,
    dominantFamily: ''
  }
}

ParticleSystem.prototype.createFood = function(p5, amount) {
  for (var i = 0; i < amount; i++) {
    this.originalFood.push(
      p5.createVector(p5.random(0, p5.width), p5.random(0, p5.height))
    )
  }

  this.resetFood()
}

ParticleSystem.prototype.createBombs = function(p5, amount) {
  for (var i = 0; i < amount; i++) {
    this.originalBombs.push(
      p5.createVector(p5.random(0, p5.width), p5.random(0, p5.height))
    )
  }

  this.resetBombs()
}

ParticleSystem.prototype.resetFood = function() {
  this.food = [...this.originalFood]
}

ParticleSystem.prototype.resetBombs = function() {
  this.bombs = [...this.originalBombs]
}

ParticleSystem.prototype.addParticle = function(p5) {
  const accelerations = new Accelerations(400, p5)
  const velocity = new Gene(
    'velocity',
    p5.createVector(p5.random(-1.5, 1.5), p5.random(-1.5, 1.5)),
    p5.random(0, 1),
    function(value) {
      const shouldMutate = Math.random() * 100 < 0.1
      return shouldMutate
        ? p5.createVector(p5.random(-1.5, 1.5), p5.random(-1.5, 1.5))
        : value
    }
  )
  const lifespan = new Gene(
    'lifespan',
    p5.random(200, 500),
    p5.random(0, 1),
    function(value) {
      const shouldMutate = Math.random() * 100 < 0.1
      return shouldMutate ? p5.random(200, 500) : value
    }
  )
  const color = new Gene(
    'color',
    [p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)],
    p5.random(0, 1),
    function(value) {
      const shouldMutate = Math.random() * 100 < 0.1
      return shouldMutate
        ? [p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)]
        : value
    }
  )
  const familyName = new Gene('familyName', makeid(5), p5.random(0, 1))

  const genes = [accelerations, velocity, lifespan, color, familyName]

  this.particles.push(new Particle(this.origin, genes))
}

ParticleSystem.prototype.run = function(p5) {
  if (this.iterationTime < MAX_ITERATION_TIME && !this.finishedIteration) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i]

      if (!p.isDead()) {
        p.run(p5)

        // Check if food collides
        // TODO: can use better algorithm, like quad tree
        for (let j = this.food.length - 1; j >= 0; j--) {
          let f = this.food[j]

          let hit = p5.collideCircleCircle(
            f.x,
            f.y,
            20,
            p.position.x,
            p.position.y,
            20
          )
          if (hit) {
            p.eatFood()
            this.food.splice(j, 1)
          }
        }

        // Check if bomb collides
        // TODO: can use better algorithm, like quad tree
        for (let j = this.bombs.length - 1; j >= 0; j--) {
          let f = this.bombs[j]

          let hit = p5.collideCircleCircle(
            f.x,
            f.y,
            20,
            p.position.x,
            p.position.y,
            20
          )
          if (hit) {
            p.kill()
          }
        }
      } else {
        p.display(p5)
      }
    }

    this.iterationTime++

    const allParticlesDead = this.particles.filter(p => !p.isDead()).length === 0
    
    if (this.iterationTime === MAX_ITERATION_TIME || allParticlesDead) {
      console.log('Iteration finished')
      this.finishedIteration = true
    }
  }

  this.renderFood(p5)
  this.renderBombs(p5)

  const particlesAlive = this.particles.filter(p => !p.isDead()).length

  p5.textSize(20)
  p5.text('Generation ' + this.generation, 10, 20)
  p5.text('Median lifespan ' + this.stats.medianLifespan, 10, 40)
  p5.text('Dominant family ' + this.stats.dominantFamily, 10, 60)
  p5.text('Particles alive ' + particlesAlive, 10, 80)
}

ParticleSystem.prototype.renderFood = function(p5) {
  p5.fill(144, 144, 144)
  p5.stroke(255, 204, 0)
  for (let i = this.food.length - 1; i >= 0; i--) {
    let f = this.food[i]
    p5.strokeWeight(4)
    p5.rect(f.x, f.y, 10, 10)
  }
}

ParticleSystem.prototype.renderBombs = function(p5) {
  p5.fill(98, 98, 98)
  p5.stroke(155, 155, 0)
  for (let i = this.bombs.length - 1; i >= 0; i--) {
    let f = this.bombs[i]
    p5.strokeWeight(1)
    p5.rect(f.x, f.y, 10, 10)
  }
}

ParticleSystem.prototype.newIteration = function(position, p5) {
  console.log('Creating a new geneartion')
  this.position = position.copy()

  // new generation of particles
  this.newGeneration(p5)

  // Add 2 more random particles each generation
  // for(var i = 0; i < 2; i++) {
  //   this.addParticle(p5)
  // }

  // Reset the food
  this.resetFood()

  // Reset the iteration counter
  this.iterationTime = 0
  this.finishedIteration = false
  this.generation++

  // Generate stats
  this.generateStats()
}

ParticleSystem.prototype.newGeneration = function(p5) {
  // Get the best particles, kill the worst
  const withSomeFitness = this.particles.filter(i => i.calculateFitness() > 0)
  console.log('Only ', withSomeFitness.length, 'have reproduction capabilities')

  const particlesSorted = withSomeFitness.sort((a, b) =>
    a.calculateFitness() > b.calculateFitness() ? -1 : 1
  )

  const totalFitness = particlesSorted.reduce((prev, next) => {
    return prev + next.calculateFitness()
  }, 0)

  const halfLength = Math.ceil(particlesSorted.length / 2)

  const leftSide = particlesSorted.slice(0, halfLength).filter(i => {
    if (Math.random() * 100 > 0.1) {
      return true
    }
  })

  const randomPercentageFromRightSide = particlesSorted
    .slice(halfLength, particlesSorted.length)
    .filter(i => {
      if (Math.random() * 100 < 0.2) {
        return true
      }
    })

  const parentCandidates = leftSide.concat(randomPercentageFromRightSide)

  const newBorn = parentCandidates.map(p => {
    const newGenes = p.adn.reproduce(p5)
    return new Particle(p.position.copy(), newGenes)
  })

  // Generate kids from the remaining units with fitness in a random way
  const difference = this.particles.length - newBorn.length
  const remainingKids = []

  for (var i = 0; i < difference; i++) {
    const randomParent =
      particlesSorted[Math.floor(Math.random() * particlesSorted.length)]
    const newGenes = randomParent.adn.reproduce(p5)

    remainingKids.push(new Particle(randomParent.position.copy(), newGenes))
  }

  console.log('New born', newBorn.length)

  // const newGeneration = particlesSorted.concat(newBorn)
  const newGeneration = newBorn.concat(remainingKids)

  console.log(newGeneration.length)

  // Update the origin position
  this.particles = newGeneration.map(n => {
    n.setPosition(this.position.copy())
    n.reset()
    return n
  })

  console.log('New generation with: ', this.particles.length)

  // Store stats
}

ParticleSystem.prototype.generateStats = function() {
  const medianLifespan =
    this.particles.reduce((prev, next) => {
      return prev + next.lifespan
    }, 0) / this.particles.length

  const familytree = {}

  this.particles.forEach(p => {
    if (!familytree[p.familyName]) {
      familytree[p.familyName] = 1
    } else {
      familytree[p.familyName] += 1
    }
  })

  const dominantFamily = Object.keys(familytree)
    .map(k => {
      return {
        name: k,
        amount: familytree[k]
      }
    })
    .sort((a, b) => {
      return a.amount > b.amount ? -1 : 1
    })[0].name

  this.stats = {
    medianLifespan,
    dominantFamily
  }
}
