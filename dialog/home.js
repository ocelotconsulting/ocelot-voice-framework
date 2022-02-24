module.exports = (overrides = {}) => ({
  welcome: [
    `Hi. Welcome to Ocelot Voice Framework`,
  ],
  engage: [
		`<break strength="strong" /> How can I help you?`,
		`<break strength="strong" /> What would you like to do?`,
		`<break strength="strong" /> What can I do for you today?`,
  ],
  reEngage: [
		`<break strength="strong" /> What else can I do for you?`,
		`<break strength="strong" /> How else can I help you today?`,
		`<break strength="strong" /> What else can I do for you today?`,
  ],
  error: [
    `Sorry, an error occurred. Please try again.`,
  ],
  goodbye: [
    `Goodbye!`,
  ],
  promptResume: [
    `It looks like we didn't finish our conversation last time.  Would you like to finish talking about {{subConversation}}?`
  ],
  misheardResume: [
    `I didn't catch that.  Would you like to resume your previous session?`
  ],
  denyResume: [
    `No worries.`,
    `No problem.`,
    `Okay.`,
  ],
  returnContext: [
    `We're talking about {{previousConversation}}.`,
    `We were just talking about {{previousConversation}}.`,
    `{{previousConversation}}.`,
  ],
  noContext: [
    `We weren't talking about anything.`,
    `I can't remember either... oh well.`,
    `We're not in the middle of anything.`
  ],
  ...overrides,
})
