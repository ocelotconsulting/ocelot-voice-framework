const objectMapToSpeech = optionsList => Object.keys(optionsList).length === 1 ?
  `${optionsList[Object.keys(optionsList)[0]]} for ${Object.keys(optionsList)[0]}` :
  Object.keys(optionsList).map((key, i) =>
    i < (Object.keys(optionsList).length - 1) ?
      `${Object.keys(optionsList)[i]} for ${optionsList[key]}, ` :
      `or ${Object.keys(optionsList)[i]} for ${optionsList[key]}`
  ).join('')

module.exports = { objectMapToSpeech }
