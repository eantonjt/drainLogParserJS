## DrainJavascript

This repo contains an implementation of the logparser Drain LINK for Javascript.
This is my own implementation and is this not official.

## Usage

To see how to retrieve template and how to add loglines to the Drainparser, see the usage example below

    logParserDrain = new DrainLogParser()
    const inputLoglines = ['NodeID45 OUT OF MEMORY', 
                           'Where is my dog?',
                           'Where is my cat?']
    
    inputLoglines.forEach( logline => console.log(logParserDrain.addLogline(logline)))
Gives the output
    
    Template: NodeID45 OUT OF MEMORY
    Template: Where is my dog?
    Template: Where is my §

To configure some settings, pass an Object to the DrainLogParser, e.g,
    const mySettings = {
        preProcessRegex: ['\d+', 'NUM']
    }
    logParserDrain = new DrainLogParser(mySettings)
    
## Configurations

Formats of the possible configurations of the logparser can be seen below.

* preProcessRegex: List of list where first element is the regex and second element is string to insert where the regex matches.
    * Example: [['\d', 'NUM']]
* defaultSpecialChars: The characters that should be seen as special characters. This can affect the logparsing as explained in Section 3.4 in the Drain article.
    * Example: "#ˆ$’*+,/<=>@_`'‘~"
* varMarker: The character to signify a variable part of the templates
* numMarker: The character to signify the number.
* DAGSplitMarker: The character used to separate the nodes in a path in the DAG.
* setLowerCase: Boolean indicating whether all loglines should be set to lowercase.
* cacheEnabled: Boolean indicating if a loglien should be compared to the previous cached group first before proceeding with the general algorithm.

## Tests
All tests are available in the tests folder and implemented with the Jest framework.