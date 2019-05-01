
const iterationTime = 300

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


let ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
  this.food = []
  this.originalFood = []
  this.iterationTime = 0
  this.finishedIteration = false
};

ParticleSystem.prototype.createFood  = function(p5, amount) {
  for(var i = 0; i < amount; i++) {
    this.originalFood.push(p5.createVector(p5.random(0, p5.width), p5.random(0, p5.height)))
  }

  this.resetFood()
}

ParticleSystem.prototype.resetFood = function() {
  this.food = [...this.originalFood]
}


ParticleSystem.prototype.addParticle = function(p5) {

  const accelerations =  new Accelerations(400, p5 );
  const velocity = new Gene('velocity', p5.createVector(p5.random(-0.04, 0.04), p5.random(-0.04, 0.04)), p5.random(0, 1));
  const lifespan = new Gene('lifespan', p5.random(200, 500), p5.random(0, 1))
  const color = new Gene('color', [p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)], p5.random(0, 1))
  const familyName = new Gene('familyName', makeid(5), p5.random(0, 1))

  const genes = [accelerations, velocity, lifespan, color, familyName]

  this.particles.push(new Particle(this.origin, genes));
};

ParticleSystem.prototype.run = function(p5) {
  if (this.iterationTime < iterationTime) {
    for (let i = this.particles.length-1; i >= 0; i--) {
      let p = this.particles[i];
      p.run(p5);

      // Check if food collides 
      // TODO: can use better algorithm, like quad tree
      for(let j = this.food.length-1; j >= 0; j--) {
        let f = this.food[j]
        
        let hit = p5.collideCircleCircle(f.x,f.y,20,p.position.x,p.position.y,20)
        if (hit) {
          console.log('Eat food')
          p.eatFood()
          this.food.splice(j, 1);
        }
      }


      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }

    this.iterationTime++;

    if (this.iterationTime === iterationTime) {
      
      console.log('Iteration finished', this.particles.length, 'particles alive')
      this.finishedIteration = true;
    }
  }

  for (let i = this.food.length-1; i >= 0; i--) {
    let f = this.food[i];
    p5.stroke(255, 204, 0);
    p5.strokeWeight(4);
    p5.rect(f.x, f.y, 10, 10);    
  }

};

ParticleSystem.prototype.newIteration = function(position, p5) {
  console.log('Creating a new geneartion')
  this.position = position.copy()

  // new generation of particles
  this.generation(p5)

  // Reset the food
  this.resetFood()

  // Reset the iteration counter
  this.iterationTime = 0;
  this.finishedIteration = false;
  console.log('Reseted')
}

ParticleSystem.prototype.generation = function(p5) {
  // Get the best particles, kill the worst
  const withSomeFitness = this.particles.filter(i => i.calculateFitness() > 0)
  console.log('Only ', withSomeFitness.length, 'have reproduction capabilities')
  const particlesSorted = withSomeFitness.sort((a, b) => a.calculateFitness() > b.calculateFitness() ? -1 : 1)
  const halfLength = Math.ceil(particlesSorted.length / 2);    
  
  const leftSide = particlesSorted.slice(0, halfLength).filter(i => {
    if (Math.random() * 100 > 0.1) {
      return true
    }
  })

  const randomPercentageFromRightSide = particlesSorted.slice(halfLength, particlesSorted.length).filter(i => {
    if (Math.random() * 100 < 0.1) {
      return true
    }
  })

  const parentCandidates = leftSide.concat(randomPercentageFromRightSide)
  
  const newBorn = parentCandidates.map(p => {
    const newGenes = p.adn.reproduce(p5)
    return new Particle(p.position.copy(), newGenes)
  })

  console.log('New born', newBorn.length)

  const newGeneration = particlesSorted.concat(newBorn)

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

// ParticleSystem.prototype.generation = function(p5) {
//   // Get the best particles, kill the worst
//   const withSomeFitness = this.particles.filter(i => i.calculateFitness() > 0)
//   const particlesSorted = withSomeFitness.sort((a, b) => a.calculateFitness() > b.calculateFitness() ? -1 : 1)
//   const halfLength = Math.ceil(particlesSorted.length / 2);    
  
//   const leftSide = particlesSorted.slice(0, halfLength);
//   const rightSide = particlesSorted.slice( halfLength, particlesSorted.length);
//   const newBorn = leftSide.map(p => {
//     const newGenes = p.adn.reproduce(p5)
//     return new Particle(p.position.copy(), newGenes)
//   })

//   console.log('New born', newBorn.length)

//   const newGeneration = leftSide.concat(newBorn)

//   console.log(newGeneration.length)

//   // Update the origin position
//   this.particles = newGeneration.map(n => {
//     n.setPosition(this.position.copy())
//     n.reset()
//     return n
//   })

  
//   console.log('New generation with: ', this.particles.length)

//   // Store stats
// }