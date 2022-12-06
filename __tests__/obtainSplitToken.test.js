
const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser


test('Verify first token can be chosen', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['This', 'is', 'my', 'message']
    const expectedNumOutput = 'This'

    const observedSplitToken = logParserDrain.obtainSplitToken(inputTokenizedLogline)

    expect(observedSplitToken).toBe(expectedNumOutput);
});

test('Verify last token can be chosen when first contains digit', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['Th5s', 'is', 'my', 'message']
    const expectedNumOutput = 'message'

    const observedSplitToken = logParserDrain.obtainSplitToken(inputTokenizedLogline)

    expect(observedSplitToken).toBe(expectedNumOutput);
});


test('Verify null token returned when both contains digits', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['Th5s', 'is', 'my', 'mes6age']
    const expectedNumOutput = null

    const observedSplitToken = logParserDrain.obtainSplitToken(inputTokenizedLogline)

    expect(observedSplitToken).toBe(expectedNumOutput);
});

test('Verify second token returned when first contain special char', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['Th@s', 'is', 'my', 'message']
    const expectedNumOutput = 'message'

    const observedSplitToken = logParserDrain.obtainSplitToken(inputTokenizedLogline)

    expect(observedSplitToken).toBe(expectedNumOutput);
});

test('Verify first token returned when both contain special char and no digits', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['Th@s', 'is', 'my', 'mess_age']
    const expectedNumOutput = 'Th@s'

    const observedSplitToken = logParserDrain.obtainSplitToken(inputTokenizedLogline)

    expect(observedSplitToken).toBe(expectedNumOutput);
});
