

class DrainLogParser {
    constructor(drainSettings) {

        const defaultRegex = []
        this.preProcessRegex = drainSettings.preProcessRegex === undefined ? defaultRegex : drainSettings.preProcessRegex

        const defaultSpecialChars = "#ˆ$’*+,/<=>@_`'‘~"
        this.specialChars = drainSettings.defaultSpecialChars === undefined ? defaultSpecialChars : drainSettings.defaultSpecialChars

        const defaultVarMarker = '§'
        this.varMarker = drainSettings.varMarker === undefined ? defaultVarMarker : drainSettings.varMarker

        const defaultNumMarker = '§'
        this.numMarker = drainSettings.numMarker === undefined ? defaultNumMarker : drainSettings.numMarker

        const defaultDAGSplitMarker = '_'
        this.DAGSplitMarker = drainSettings.DAGSplitMarker === undefined ? defaultDAGSplitMarker : drainSettings.DAGSplitMarker

        const defaultLowerCase = true 
        this.lowerCaseAllLines = drainSettings.setLowerCase === undefined ? defaultLowerCase : drainSettings.setLowerCase

        this.logTemplateGroupStore = {}

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

        if (firstTokenContainsNum && lastTokenContainsNum) {return this.numMarker}
        else if (!firstTokenContainsNum && !lastTokenContainsNum) {
            return firstTokenContainSpecialChar && !lastTokenContainSpecialChar ? 'Last:' + lastToken : 'First:' + firstToken
        }
        else {return !firstTokenContainsNum ? 'First' + firstToken : 'Last:' + lastToken}

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

    templateGroupExists(DAGSplitMarker) {

        const firstTemplateKey = [DAGSplitMarker, 'Group1'].join(this.DAGSplitMarker)
        const allTemplateGroupKeys = Object.keys(this.logTemplateGroupStore)
        return allTemplateGroupKeys.includes(firstTemplateKey)

    }

    initializeSimilarityThres(logline) 
    {
        const tokenizedLogline = this.tokenizeLogline(logline)
        const numTokens = tokenizedLogline.length
        const numDigitTokens = tokenizedLogline.filter(it => this.tokenContainsDigit(it)).length 
        const initialSimilarityThres = 0.5*(numTokens - numDigitTokens)/numTokens 
        return initialSimilarityThres

    }

    createNewTemplateGroup(DAGInitialStepsMarker, logline, groupMarker)
    {
        const templateGroupKey = [DAGInitialStepsMarker, groupMarker].join(this.DAGSplitMarker)
        const similarityThres = this.initializeSimilarityThres(logline)
        const initialGroupInfo = {'Template': logline, 'SimilarityThres': similarityThres}
        this.logTemplateGroupStore[templateGroupKey] = initialGroupInfo

    }

    obtainAssociatedTemplateGroupKeys(DAGInitialStepsMarker) 
    {
        const allTemplateGroupKeys = Object.keys(this.logTemplateGroupStore)
        const associatedTemplateGroupKeys = allTemplateGroupKeys.filter(it => it.includes(DAGInitialStepsMarker))
        return associatedTemplateGroupKeys

    }

    addLoglineToTemplateGroup(DAGInitialStepsMarker, logline) 
    {
        const associatedTemplateGroupKeys = this.obtainAssociatedTemplateGroupKeys(DAGInitialStepsMarker)
        var bestMatchingGroupKey = null
        var highestSimilarityValue = -1
        associatedTemplateGroupKeys.forEach(currKey => 
            {
                let currTemplate = this.logTemplateGroupStore[currKey]['Template']
                let currSimilarityThres = this.logTemplateGroupStore[currKey]['SimilarityThres']
                let tokenizedLogline = this.tokenizeLogline(logline)
                let tokenizedTemplate = this.tokenizeLogline(currTemplate)
                let currSimilarity = this.calcSimilarity(tokenizedLogline, tokenizedTemplate)
                currSimilarity = currSimilarity > currSimilarityThres ? currSimilarity : -2
                highestSimilarityValue = currSimilarity >= highestSimilarityValue ? currSimilarity : highestSimilarityValue 
                bestMatchingGroupKey = currSimilarity >= highestSimilarityValue ? currKey : bestMatchingGroupKey 

            })
        if (bestMatchingGroupKey === null)
        {
            const newGroupNumber = associatedTemplateGroupKeys.length
            this.createNewTemplateGroup(DAGInitialStepsMarker, logline, 'Group' + newGroupNumber.toString())
        } 
        else
        {
            // CONTINUE HERE, DOES THE FUNCTION NEED TO BE RENAMED?
            // THEN CONTIUE IN ADDLOGLINE BELOW
        }
        

    }

    addLogline(logline) 
    {
        
        let copyLogline = this.setLowerCase ? logline.toLowerCase() : logline
        copyLogline = this.preProcessLogLine(copyLogline)
        let numTokens = this.getNumTokensInLogline(logline) 
        let tokenizedLogline = this.tokenizeLogline(copyLogline)
        let splitToken = this.obtainSplitToken(tokenizedLogline)
        let DAGInitialStepsMarker = [numTokens.toString(), splitToken].join(this.DAGSplitMarker)

        if (this.templateGroupExists(DAGInitialStepsMarker)) {
            // Retrieve all the template keys and find the one with the highest similarity
            //this.addLoglineToTemplateGroup
        } 
        else 
        {
            const newGroupMarker = 'Group1'
            this.createNewTemplateGroup(DAGInitialStepsMarker, logline, newGroupMarker)
        }







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