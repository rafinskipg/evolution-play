
// A simple Particle class
let Gene = function(name, value, strength, mutationFn) {
  this.name = name
  this.strength = strength
  this.value = value
  this.mutationFn = mutationFn
};

Gene.prototype.reproduce = function () {
  const newValue = this.mutationFn ? this.mutationFn(this.value) : this.value
  return new Gene(this.name, newValue, this.strength, this.mutationFn)
}