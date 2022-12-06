const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser


test('Similarity with no variable markers', () => {

    const drainSettings = 
    {
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['This', 'is', 'my', 'message']
    const inputTokenizedTemplate = ['This', 'is', 'a', 'message']
    const expectedSimilarity = 0.75

    const observedSimilarity = logParserDrain.calcSimilarity(inputTokenizedLogline, inputTokenizedTemplate)

    expect(observedSimilarity).toBe(expectedSimilarity);
});

test('Similarity with variable markers', () => {

    const drainSettings = 
    {
        'varMarker': '§'
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputTokenizedLogline = ['This', 'is', 'my', 'message', 'right']
    const inputTokenizedTemplate = ['This', '§', 'a', 'message', 'right']
    const expectedSimilarity = 0.75

    const observedSimilarity = logParserDrain.calcSimilarity(inputTokenizedLogline, inputTokenizedTemplate)

    expect(observedSimilarity).toBe(expectedSimilarity);
});

