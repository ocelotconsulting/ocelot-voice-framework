

const skillIdInterceptor = {
  process: async handlerInput => {
    const {
      requestEnvelope: {
        context:{
          System:{
            application:{
              applicationId
            }
          }
        },
      },
    } = handlerInput

    if ( applicationId !== process.env.SKILL_ID ) throw "This should never happen. Incorrect skill."
  }

}

module.exports = {
  skillIdInterceptor
}