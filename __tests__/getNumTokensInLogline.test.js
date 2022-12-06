
const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser


test('Verify num tokens works correctly', () => {

    const drainSettings1 = 
    {
    }
    
    logParserDrain = new DrainLogParser(drainSettings1)

    const inputLogline = 'NodeId5 is invalid'
    const expectedNumOutput = 3

    const preProcessedLogLine = logParserDrain.getNumTokensInLogline(inputLogline)

    expect(expectedNumOutput).toBe(preProcessedLogLine);
});
