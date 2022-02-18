const Dialog = require('../generate/Dialog')

const translations = {
  ['test']: {
    translation: {
      helloWorld: {
        hello: [`{{world}}!`, `to you, {{world}}!`],
      },
      whitespace: {
        test: [
          `bar! baz!`,
          `bar! baz!`,
        ],
      },
      deeply: {
        nested: {
          value: {
            to: {
              fetch: `translation!`,
            },
          },
        },
      },
      single: {
        value: 'test',
      },
    },
  },
  ['en-US'] : {
    translation: {
      handleMissingFromTestDialect: 'Lo siento, no hablo español',
      single: {
        key: `{{count}} item`,
        key_plural: `{{count}} items`,
      },
      aA: {
        aTest: [`{{tag, en-handle-an}}`,]
      },
    },
  },
}

const dialog = new Dialog('test', translations)

it('fetches deeply nested objects', () => {
  expect(dialog.getText('deeply.nested.value.to.fetch')).toEqual('translation!')
})

it('falls back to en-US when missing a translation', () => {
  expect(dialog.getText('handleMissingFromTestDialect')).toEqual('Lo siento, no hablo español')
})

it('throws if no translations are available', () => {
	const newDialog = new Dialog('en-US', translations)
  expect(() => newDialog.getText('deeply.nested.value.to.fetch')).toThrow(/^No translation key available/)
})

it('returns lower a for ether', () => {
  const newDialog = new Dialog('en-US', translations)
  const translated = newDialog.getText('aA.aTest', {tag: 'ether'})
  expect(translated).toEqual('an ether')
})

it('minimizes newlines, indentation, and excess whitespace from translations',  () => {
    const translated = dialog.getText('whitespace.test')
    expect(translated).toEqual('bar! baz!')
})

it('injects parameters into translation strings', () => {
    const translated = dialog.getText('helloWorld.hello', {world: "baz"})
    expect(translated).toEqual(expect.stringMatching(/baz!/))
})

it('returns a single value when only one translation option is provided', () => {
    const translated = dialog.getText('single.value')
    expect(translated).toEqual('test')
})

it('selects a random value when an array of text is provided.', () => {
  const translated = dialog.getText('helloWorld.hello', { world: 'baz' })

  // jest isn't really built to handle random results.  To work around this,
  // we can reverse the assertion - take the list of possible values, and
  // assert that we've matched on a single item that's a subset.
  expect(translated).toEqual(expect.any(String))
  expect(['baz!', 'to you, baz!' ]).toEqual(expect.arrayContaining([ translated ]))
})

// this test is mostly here to catch if/when we shift to ICU - plural formatting
// in ICU shifts to the translation string, rather than the key structure.
it('automatically delegates plurals to translations using the _plural key', () => {
  expect(dialog.getText('single.key', { count: 1 })).toEqual('1 item')
  expect(dialog.getText('single.key_plural', { count: 5 })).toEqual('5 items')
})
