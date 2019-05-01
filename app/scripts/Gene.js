
// A simple Particle class
let Gene = function(name, value, strength) {
  this.name = name
  this.strength = strength
  this.value = value
};

Gene.prototype.reproduce = function () {
  return new Gene(this.name, this.value, this.strength)
}