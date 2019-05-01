
// A simple Particle class
let Particle = function(position, genes) {
  this.adn = new ADN(genes)
  this.hasEaten = false
  this.points = []
  this.maxDots = 3
  
  this.position = position.copy();
  this.lifespan = this.adn.findGene('lifespan').value
  this.accelerations = this.adn.findGene('accelerations').value
  this.velocity = this.adn.findGene('velocity').value.copy()
  this.color = this.adn.findGene('color').value
  this.familyName = this.adn.findGene('familyName').value
  this.steps = 0
};

Particle.prototype.setPosition = function(pos) {
  this.position = pos.copy()
}

Particle.prototype.reset = function(pos) {
  this.lifespan = this.adn.findGene('lifespan').value
  this.steps = 0
  this.hasEaten = false
  this.maxDots = 3
  this.points = []
}

Particle.prototype.run = function(p5) {
  this.update(p5);
  this.display(p5);
};

// Method to update position
Particle.prototype.update = function(){

  if (this.lifespan <= 0) {
    return
  }
  this.velocity.add(this.acceleration);
  this.velocity.limit(4 )
  
  if (this.accelerations.length > this.steps) {
    this.velocity.add(this.accelerations[this.steps])
    this.steps++
  } else {
    this.lifespan = 0
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
  this.hasEaten = true
  this.lifespan += 200;
  this.maxDots += 1;
}

Particle.prototype.kill = function() {
  this.lifespan = 0;
}

// Method to display
Particle.prototype.display = function(p5) {
  p5.stroke(Math.floor(this.color[0]), Math.floor(this.color[1]), Math.floor(this.color[2]));
  p5.strokeWeight(1);
  p5.fill(Math.floor(this.color[0]), Math.floor(this.color[1]), Math.floor(this.color[2]));
  p5.ellipse(this.position.x, this.position.y, 12, 12);
  p5.textSize(10);
  p5.text(this.familyName, this.position.x, this.position.y);

  p5.fill(255,255,255)
  this.points.forEach(point => {
    p5.ellipse(point.x, point.y, 2, 2)
  })
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  return this.lifespan < 0;
};

Particle.prototype.calculateFitness = function() {
  return this.hasEaten ? (this.lifespan )  - this.steps : 0
  // (this.lifespan > 0 ? this.lifespan - this.steps : 0)
}