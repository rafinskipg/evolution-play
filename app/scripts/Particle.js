
// A simple Particle class
let Particle = function(position, genes) {
  this.adn = new ADN(genes)
  this.eaten = 0
  this.points = []
  this.maxDots = 3

  this.width = 10
  this.height = 10
  
  this.position = position.copy();
  this.lifespan = this.adn.findGene('lifespan').value
  this.accelerations = this.adn.findGene('accelerations').value
  this.velocity = this.adn.findGene('velocity').value.copy()
  this.color = this.adn.findGene('color').value
  this.familyName = this.adn.findGene('familyName').value
  this.vision = this.adn.findGene('vision').value;
  this.steps = 0
};

Particle.prototype.setPosition = function(pos) {
  this.position = pos.copy()
}

Particle.prototype.reset = function(pos) {
  this.lifespan = this.adn.findGene('lifespan').value
  this.steps = 0
  this.eaten = 0
  this.maxDots = 3
  this.points = []
}

Particle.prototype.run = function(p5) {
  this.update(p5);
  this.display(p5);
};

// Method to update position
Particle.prototype.update = function(p5){

  if (this.lifespan <= 0) {
    return
  }
  this.velocity.add(this.acceleration);
  this.velocity.limit(4 )

  
  if (this.accelerations.length > this.steps) {
    this.velocity.add(this.accelerations[this.steps])
    this.steps++
  } else {
    // Acceleration is over, add some random steps
    this.adn.findGene('accelerations').expand(p5, 10)
    this.accelerations = this.adn.findGene('accelerations').value
    this.steps++
  }

  this.lifespan -= 1

  this.position.add(this.velocity);

  if (this.position.x > p5.width  ) {
    this.position.x = p5.width  ;
  }
  if (this.position.x < 0 ) {
    this.position.x = 0 ;
  }
  if (this.position.y > p5.height  ) {
    this.position.y = p5.height  ;
  }
  if (this.position.y < 0 ) {
    this.position.y = 0 ;
  }

  this.points.push(this.position.copy())
  this.points = this.points.slice(-this.maxDots)  
};

Particle.prototype.eatFood = function() {
  this.lifespan += 200;
  this.maxDots += 1;
  this.eaten += 1
}

Particle.prototype.steerTowardsFood = function(target) {
  let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(2);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(2); // Limit to maximum steering force
  this.accelerations[this.steps] = steer
}

Particle.prototype.kill = function() {
  this.lifespan = 0;
}

// Method to display
Particle.prototype.display = function(p5) {
  if (!this.isDead()) {
    p5.stroke(Math.floor(this.color[0]), Math.floor(this.color[1]), Math.floor(this.color[2]));
    p5.strokeWeight(1);
    p5.fill(Math.floor(this.color[0]), Math.floor(this.color[1]), Math.floor(this.color[2]));
    p5.ellipse(this.position.x, this.position.y, this.width, this.height);
    p5.textSize(10);
    p5.text(this.familyName, this.position.x, this.position.y);
  
    // p5.fill(255,255,255)
    // this.points.forEach(point => {
    //   p5.ellipse(point.x, point.y, 2, 2)
    // })

    p5.stroke(255, 255, 255);
    p5.fill(0,0,0,0)
    p5.ellipse(this.position.x, this.position.y, this.vision + this.width);
  } else {
    p5.stroke(44, 44, 44)
    p5.fill(13,13,13)
    p5.ellipse(this.position.x, this.position.y, 8, 8)
  }

  
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  return this.lifespan <= 0;
};

Particle.prototype.calculateFitness = function() {
  return  (this.eaten * 1000 - this.steps ) / 1000
}