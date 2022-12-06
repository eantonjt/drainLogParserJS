

class DrainLogParser {
    constructor(drainSettings) {

        const defaultRegex = []
        this.preProcessRegex = drainSettings.preProcessRegex === undefined ? defaultRegex : drainSettings.preProcessRegex

        const defaultSpecialChars = "#ˆ$’*+,/<=>@_`'‘~"
        this.specialChars = drainSettings.defaultSpecialChars === undefined ? defaultSpecialChars : drainSettings.defaultSpecialChars

        const defaultVarMarker = '§'
        this.varMarker = drainSettings.varMarker === undefined ? defaultVarMarker : drainSettings.varMarker

        const defaultLowerCase = true 
        this.lowerCaseAllLines = drainSettings.setLowerCase === undefined ? defaultLowerCase : drainSettings.setLowerCase

        this.logGroupStore = {}

    }

    preProcessLogLine(logline) 
    {
        
        this.preProcessRegex.forEach(it => logline = logline.replace(it.regex, it.replacementString))
        return logline

    }

    tokenizeLogline(logline) 
    {
        const splitLogline = logline.trim().split(/\s+/g);   
        return splitLogline
    }

    getNumTokensInLogline(logline) 
    {

        const tokenizedLogline = this.tokenizeLogline(logline) 
        return tokenizedLogline.length

    }

    tokenContainsDigit(token)
    {

        const digitRegex = /\d/g;
        return token.match(digitRegex)

    } 

    tokenContainsSpecialChars(token) 
    {
        
        const invalidChar = [...token].some(char => this.specialChars.includes(char))
        return invalidChar

    }

    obtainSplitToken(tokenizedLogline) 
    {

        const firstToken = tokenizedLogline[0]
        const lastToken = tokenizedLogline[tokenizedLogline.length - 1]

        const firstTokenContainsNum = this.tokenContainsDigit(firstToken)
        const lastTokenContainsNum = this.tokenContainsDigit(lastToken)
        const firstTokenContainSpecialChar = this.tokenContainsSpecialChars(firstToken) 
        const lastTokenContainSpecialChar = this.tokenContainsSpecialChars(lastToken) 

        if (firstTokenContainsNum && lastTokenContainsNum) {return null}
        else if (!firstTokenContainsNum && !lastTokenContainsNum) {
            return firstTokenContainSpecialChar && !lastTokenContainSpecialChar ? lastToken : firstToken
        }
        else {return !firstTokenContainsNum ? firstToken : lastToken}

    }

    calcSimilarity(loglineTokens, templateTokens) 
    {
        var numEqualTokens = 0
        loglineTokens.forEach((token1, index) => {
            let token2 = templateTokens[index]
            let checkVarToken = token2 === this.varMarker
            let sameToken = token1 === token2 
            numEqualTokens = !checkVarToken && sameToken ? numEqualTokens + 1 : numEqualTokens
          });
        const numNonVarTokens = templateTokens.filter(it => it != this.varMarker).length 
        console.log(numNonVarTokens)
        const similarity = numEqualTokens/numNonVarTokens
        return similarity

    }

    addLogline(logline) 
    {
        logline = this.setLowerCase ? logline.toLowerCase() : logline



    }


}


const drainSettings = 
{
    'preProcessRegex': [{'regex': /NodeId\d/, 'replacementString': 'nodeId'}]
}
logParserDrain = new DrainLogParser(drainSettings)
const inputTokenizedLogline = ['This', 'is', 'my', 'message', 'right']
const inputTokenizedTemplate = ['This', '*', 'a', 'message', 'right']
//console.log(logParserDrain.calcSimilarity(inputTokenizedLogline, inputTokenizedTemplate))


// SO I should store everything as
// {'Length_First:Token1_Group1': {'Template': ..., 'SimilarityThres': ..., 'LogLines': ...}}



module.exports = { DrainLogParser };