

const dlp = require('../drain');
const DrainLogParser = dlp.DrainLogParser



test('Verify special chars are detected', () => {

    const drainSettings = 
    {
        'defaultSpecialChars': "#ˆ$’*+,/<=>@_`'‘~"
    }
    
    logParserDrain = new DrainLogParser(drainSettings)

    const inputLogline = 'No_h+'
    const expectedOutputLogLine = true

    const checkForSpecialChars = logParserDrain.tokenContainsSpecialChars(inputLogline)


    expect(checkForSpecialChars).toBe(expectedOutputLogLine);
  });