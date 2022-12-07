

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

        const defaultCacheEnabled = true 
        this.cacheEnabled = drainSettings.cacheEnabled === undefined ? defaultCacheEnabled : drainSettings.cacheEnabled

        this.previousTemplateGroupKey = null 
        this.numTokensOfPreviousLogline = null

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

    createNewTemplateGroup(templateGroupKey, logline)
    {

        const similarityThres = this.initializeSimilarityThres(logline)
        const initialGroupInfo = {'Template': logline, 'SimilarityThres': similarityThres, 'OriginalSimilarityThres': similarityThres}
        this.logTemplateGroupStore[templateGroupKey] = initialGroupInfo

    }

    obtainAssociatedTemplateGroupKeys(DAGInitialStepsMarker) 
    {
        const allTemplateGroupKeys = Object.keys(this.logTemplateGroupStore)
        const associatedTemplateGroupKeys = allTemplateGroupKeys.filter(it => it.includes(DAGInitialStepsMarker))
        return associatedTemplateGroupKeys

    }

    findMostSimilarTemplateGroup(logline, associatedTemplateGroupKeys) 
    {

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

        return bestMatchingGroupKey

    }

    newSimilarityThreshold(orgSimThres, tokenizedLogline) 
    {

        const numDigits = tokenizedLogline.filter(it => this.tokenContainsDigit(it)).length 
        const base = Math.max(2, numDigits + 1)
        const numVarTokens = tokenizedLogline.filter(it => this.varMarker).length 
        const logBaseNumVarTokens = Math.log(base) / Math.log(numVarTokens + 1);
        const newSimThres = Math.min(1, orgSimThres + 0.5*logBaseNumVarTokens)
        return newSimThres
    }

    updateTemplateGroup(groupKey, logline) 
    {

        let currTemplate = this.logTemplateGroupStore[groupKey]['Template']
        let tokenizedLogline = this.tokenizeLogline(logline)
        let tokenizedTemplate = this.tokenizeLogline(currTemplate)
        const newTokenizedTemplate = tokenizedLogline.map((it,ind) => 
        {
           let updateToken = it ===  tokenizedTemplate[ind] ? it : this.varMarker
           return updateToken
           
        })
        let newTemplate = newTokenizedTemplate.join(' ')
        this.logTemplateGroupStore[groupKey]['Template'] = newTemplate
        const orgSimThres = this.logTemplateGroupStore[groupKey]['OriginalSimilarityThres']
        const newSimThres = this.newSimilarityThreshold(orgSimThres, newTokenizedTemplate) 
        this.logTemplateGroupStore[groupKey]['SimilarityThres'] = newSimThres

    }

    loglineCanBeAddedToPreviousGroup(logline) 
    {
        const prevKey = this.previousTemplateGroupKey
        const previousTemplate = this.logTemplateGroupStore[prevKey]['Template']
        const previousSimilarityThres = this.logTemplateGroupStore[prevKey]['SimilarityThres']
        const tokenizedLogline = this.tokenizeLogline(logline)
        const tokenizedTemplate = this.tokenizeLogline(previousTemplate)
        const currSimilarity = this.calcSimilarity(tokenizedLogline, tokenizedTemplate)
        const loglineCanBeAddedToPreviousGroup = currSimilarity > previousSimilarityThres
        return loglineCanBeAddedToPreviousGroup

    }

    compareCachedGroupFirst(logline, numTokens)
    {
        if (numTokens == this.numTokensOfPreviousLogline && this.previousTemplateGroupKey != null)
        {
            if (this.loglineCanBeAddedToPreviousGroup(logline)) 
            {
                this.updateTemplateGroup(this.previousTemplateGroupKey, logline)                
                return true 
            }

        } 
        return false 

    }

    addLogline(logline) 
    {
        
        let copyLogline = this.setLowerCase ? logline.toLowerCase() : logline
        copyLogline = this.preProcessLogLine(copyLogline)
        let numTokens = this.getNumTokensInLogline(logline) 
        let tokenizedLogline = this.tokenizeLogline(copyLogline)
        let splitToken = this.obtainSplitToken(tokenizedLogline)
        let DAGInitialStepsMarker = [numTokens.toString(), splitToken].join(this.DAGSplitMarker)

        if (this.cacheEnabled) 
        {
            const loglineWasAddedToCachedGroup = this.compareCachedGroupFirst(logline, numTokens) 
            if (loglineWasAddedToCachedGroup) { return }
        }
        

        if (this.templateGroupExists(DAGInitialStepsMarker)) {
            
            const associatedTemplateGroupKeys = this.obtainAssociatedTemplateGroupKeys(DAGInitialStepsMarker)
            const mostSimilarGroup = this.findMostSimilarTemplateGroup(logline, associatedTemplateGroupKeys) 
            if (mostSimilarGroup === null) 
            { 
                
                const newGroupNumber = associatedTemplateGroupKeys.length + 1
                const groupKey = [DAGInitialStepsMarker, 'Group' + newGroupNumber].join(this.DAGSplitMarker)
                this.createNewTemplateGroup(groupKey, logline)

            }
            else
            {
                
                this.updateTemplateGroup(mostSimilarGroup, logline)

            }
        } 
        else 
        {
            const newGroupMarker = 'Group1'
            const groupKey = [DAGInitialStepsMarker, newGroupMarker].join(this.DAGSplitMarker)
            this.createNewTemplateGroup(groupKey, logline)
        }

        return

    }


}

// I NEED RETRIEVE LOGTEMPLATES AS WELL
// SO A LOGLINE CAN BE MATCHED WITH A TEMPLATE
// AND SOME PRINT FUNCTION MAYBE?


const drainSettings = 
{
    'preProcessRegex': [{'regex': /NodeId\d/, 'replacementString': 'nodeId'}]
}
logParserDrain = new DrainLogParser(drainSettings)
const inputTokenizedLogline = ['This', 'is', 'my', 'message', 'right']
const inputTokenizedTemplate = ['This', '*', 'a', 'message', 'right']

const inputLogline1 = 'Where lives the lord?'
const inputLogline2 = 'Where did you sleep?'
const inputLogline3 = 'Where is my cat?'


logParserDrain.addLogline(inputLogline1)
logParserDrain.addLogline(inputLogline2)
logParserDrain.addLogline(inputLogline3)

//console.log(logParserDrain.logTemplateGroupStore)
//console.log(logParserDrain.calcSimilarity(inputTokenizedLogline, inputTokenizedTemplate))


// SO I should store everything as
// {'Length_First:Token1_Group1': {'Template': ..., 'SimilarityThres': ..., 'LogLines': ...}}



module.exports = { DrainLogParser };