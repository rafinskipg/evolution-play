let Accelerations = function(amount, p, steps, strength) {
  if (!steps) {
    this.steps = []

    for (var i = 0; i < amount; i++) {
      const angle = p.random(2 * Math.PI)
      this.steps.push(p5.Vector.fromAngle(angle))
    }
  } else {
    this.steps = steps
  }

  this.strength = strength || p.random(0, 1)

  Gene.call(this, 'accelerations', this.steps, this.strength, function(steps) {
    const newSteps = steps.map(step => {
      const shouldMutate = Math.random() * 100 < 0.5
      const angle = p.random(2 * Math.PI)
  
      return shouldMutate ? p5.Vector.fromAngle(angle) : step
    })

    return newSteps
  })
}

Accelerations.prototype = Object.create(Gene.prototype)

Accelerations.prototype.expand = function(p, amount) {
  for (var i = 0; i < amount; i++) {
    const angle = p.random(2 * Math.PI)
    this.steps.push(p5.Vector.fromAngle(angle))
  }
}

Accelerations.prototype.reproduce = function(p) {
  const newValue = this.mutationFn ? this.mutationFn(this.value) : this.value
  return new Accelerations(null, p, newValue, this.strength)
}
