const alexaSlotMatcher = {
  slotMatches: slot => slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH',
  getSlotValueId: slot => slot.resolutions.resolutionsPerAuthority &&
    slot.resolutions.resolutionsPerAuthority[0].values[0].value.id,
}

module.exports = alexaSlotMatcher
