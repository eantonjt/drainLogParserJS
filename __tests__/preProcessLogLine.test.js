

const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser



test('Verify preprocessing works for one regex', () => {

    const drainSettings1 = 
    {
    'preProcessRegex': [{'regex': /NodeId\d/, 'replacementString': 'NodeId'}]
    }
    
    logParserDrain = new DrainLogParser(drainSettings1)

    const inputLogline = 'NodeId5 is invalid'
    const expectedOutputLogLine = 'NodeId is invalid'

    const preProcessedLogLine = logParserDrain.preProcessLogLine(inputLogline)


    expect(expectedOutputLogLine).toBe(preProcessedLogLine);
  });

test('Verify preprocessing works for two regex', () => {

const drainSettings2 = 
{
'preProcessRegex': [{'regex': /NodeId\d/, 'replacementString': 'NodeId'}, {'regex': /BLOCKVAL\d\d/, 'replacementString': 'BLOCKVAL'}]
}

logParserDrain = new DrainLogParser(drainSettings2)

const inputLogline = 'NodeId5 is equal to BLOCKVAL42'
const expectedOutputLogLine = 'NodeId is equal to BLOCKVAL'

const preProcessedLogLine = logParserDrain.preProcessLogLine(inputLogline)


expect(expectedOutputLogLine).toBe(preProcessedLogLine);
});