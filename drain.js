

class DrainLogParser {
    constructor(drainSettings) {

        const defaultRegex = []
        this.preProcessRegex = drainSettings.preProcessRegex === undefined ? defaultRegex : drainSettings.preProcessRegex

        const defaultSpecialChars = "#ˆ$’*+,/<=>@_`'‘~"
        this.specialChars = drainSettings.defaultSpecialChars === undefined ? defaultSpecialChars : drainSettings.defaultSpecialChars

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
        let splitToken = null;

        const firstTokenContainsNum = this.tokenContainsDigit(firstToken)
        const lastTokenContainsNum = this.tokenContainsDigit(lastToken)
        const firstTokenContainSpecialChar = this.tokenContainsSpecialChars(firstToken) 
        const lastTokenContainSpecialChar = this.tokenContainsSpecialChars(lastToken) 

        if (firstTokenContainsNum && lastTokenContainsNum)
        {
            if (firstTokenContainSpecialChar && lastTokenContainSpecialChar)
            {
                splitToken = null;
            }
            else 
            {
                splitToken = firstTokenContainSpecialChar ? lastToken : firstToken
            }
        } 
        else
        {
            splitToken = firstTokenContainsNum ? lastToken : firstToken 
        }


        return splitToken

    }


}


const drainSettings = 
{
    'preProcessRegex': [{'regex': /NodeId\d/, 'replacementString': 'nodeId'}]
}
logParserDrain = new DrainLogParser(drainSettings)
logParserDrain.tokenContainsSpecialChars('bajs')






module.exports = { DrainLogParser };