let system
const INITIAL_PARTICLES = 100

let sketch = function(p) {
  p.setup = function() {
    p.collideDebug(true)
    p.createCanvas(1200, 700)
    system = new ParticleSystem( p.createVector(p.width / 2 , p.height / 2))
    system.createFood(p, 50)
    system.createBombs(p, 10)
    p.background(51);

    for(var i = 0; i < INITIAL_PARTICLES; i++) {
      system.addParticle(p);
    }

  }

  p.draw = () => {
    p.background(51);
    system.run(p);
    
    if (system.finishedIteration) {
      system.newIteration(p.createVector(p.width / 2 , p.height / 2), p)
    }
  }

  p.newGeneration = () => {
    system.newIteration(p.createVector(p.width / 2 , p.height / 2), p)
  }
}

const sk = new p5(sketch, window.document.getElementById('canvas'))
