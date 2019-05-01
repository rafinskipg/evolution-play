
// A simple Particle class
function ADN( genes) {
  this.genes = [...genes]
};

ADN.prototype.combine = function(genes = []) {
  let newGenes = []

  // Sort all genes by strength
  const allgenes = this.genes.concat(genes).sort((a, b) => a.strength > b.strength ? -1 : 1)

  // Return the top X genes by strength, but make a small probability of mutation and getting one that is weak or not
  allgenes.forEach(g => {
    if(!newGenes.find(n => n.name === g.name)) {
      newGenes.push(g)
    } else {
      // The gene is already in the new chain, but lets give it a random chance of replacing a stronger one
      const randomChanceOfReplacement = Math.random()*100
      if (randomChanceOfReplacement < 0.01) {
        const replacedGenes = newGenes.filter(i => i.name !== g.name)
        replacedGenes.push(g)
        newGenes = replacedGenes
      }
    }
  })

  return newGenes
};

ADN.prototype.reproduce = function(p5) {
  return this.genes.map(g => {
    return g.reproduce(p5)
  })
};


ADN.prototype.findGene = function(name) {
  return this.genes.find(g => g.name === name)
}