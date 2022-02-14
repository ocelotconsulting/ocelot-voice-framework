module.exports = (value, capitalize) => [ 'a', 'e', 'i', 'o', 'u', 'h' ].includes(value.substring(0, 1)) ?
  capitalize ? 'An' : 'an' :
  capitalize ? 'A' : 'a'
